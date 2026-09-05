"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  content: z.string().min(1, { message: "Content is required." }),
  audience: z.string().min(1, { message: "Audience is required." }),
  image_url: z.string().optional().nullable(),
  video_url: z.string().optional().nullable(),
  document_url: z.string().optional().nullable(),
  publish_date: z.string().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  published: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

export type AnnouncementActionError = { error: string };

function cleanFormData(formData: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return cleaned;
}

export async function createAnnouncement(formData: FormData): Promise<AnnouncementActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = announcementSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid announcement data." };
  }

  const { error } = await supabase.from("announcements").insert(parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/announcements");
  redirect("/dashboard/announcements");
}

export async function updateAnnouncement(id: string, formData: FormData): Promise<AnnouncementActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = announcementSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid announcement data." };
  }

  const { error } = await supabase.from("announcements").update(parsed.data).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/announcements");
  revalidatePath(`/dashboard/announcements/${id}`);
  redirect(`/dashboard/announcements/${id}`);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/announcements");
  redirect("/dashboard/announcements");
}
