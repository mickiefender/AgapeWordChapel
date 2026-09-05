"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { randomUUID } from "crypto";

const eventSchema = z.object({
  title: z.string().min(1, { message: "Event title is required." }),
  description: z.string().optional().nullable(),
  event_type: z.string().optional().nullable(),
  start_date: z.string().min(1, { message: "Start date is required." }),
  end_date: z.string().optional().nullable(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  capacity: z.coerce.number().int().min(0).optional().nullable(),
  registration_required: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  image_url: z.string().url().optional().nullable(),
});

export type EventActionError = { error: string };

function cleanFormData(formData: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return cleaned;
}

async function uploadEventBanner(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `event-banners/${randomUUID()}.${extension}`;
  const admin = createAdminClient();

  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === "event-banners")) {
    await admin.storage.createBucket("event-banners", { public: true });
  }

  const { error } = await admin.storage.from("event-banners").upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(error.message);

  return admin.storage.from("event-banners").getPublicUrl(path).data.publicUrl;
}

async function extractEventImageUrl(formData: FormData): Promise<string | null> {
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) return null;
  if (image.size > 8 * 1024 * 1024) throw new Error("Event image must be 8MB or smaller.");
  if (!image.type.startsWith("image/")) throw new Error("Event image must be a valid image file.");
  return uploadEventBanner(image);
}

export async function createEvent(formData: FormData): Promise<EventActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = eventSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event data." };
  }
  let imageUrl: string | null;
  try {
    imageUrl = await extractEventImageUrl(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload event image." };
  }

  const { error } = await supabase.from("events").insert({ ...parsed.data, image_url: imageUrl ?? parsed.data.image_url });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}

export async function updateEvent(id: string, formData: FormData): Promise<EventActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = eventSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event data." };
  }
  let imageUrl: string | null;
  try {
    imageUrl = await extractEventImageUrl(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload event image." };
  }

  const { error } = await supabase
    .from("events")
    .update({ ...parsed.data, ...(imageUrl ? { image_url: imageUrl } : {}) })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${id}`);
  redirect(`/dashboard/events/${id}`);
}

export async function deleteEvent(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}
