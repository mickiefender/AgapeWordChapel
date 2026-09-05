"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const leaderSchema = z.object({
  name: z.string().trim().min(1, "Leader name is required."),
  position: z.string().trim().min(1, "Position is required."),
  bio: z.string().optional().nullable(),
  email: z.string().email("Enter a valid email.").optional().nullable(),
  phone: z.string().optional().nullable(),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.enum(["on", "off"]).transform((value) => value === "on"),
});

export type LeaderActionError = { error: string };

function parseFormData(formData: FormData) {
  const value = (key: string) => {
    const item = formData.get(key);
    return typeof item === "string" && item.trim() === "" ? null : item;
  };

  return {
    name: value("name"),
    position: value("position"),
    bio: value("bio"),
    image_url: value("image_url"),
    email: value("email"),
    phone: value("phone"),
    sort_order: value("sort_order") ?? "0",
    is_active: formData.get("is_active") === "on" ? "on" : "off",
  };
}

async function uploadLeaderPhoto(file: File): Promise<{ url: string; path: string }> {
  if (!file.type.startsWith("image/")) throw new Error("Select a valid image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Leader photos must be 5MB or smaller.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `leader-photos/${randomUUID()}.${extension}`;
  const admin = createAdminClient();
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === "leader-photos")) {
    await admin.storage.createBucket("leader-photos", { public: true });
  }

  const { error } = await admin.storage.from("leader-photos").upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Unable to upload leader photo: ${error.message}`);

  return { path, url: admin.storage.from("leader-photos").getPublicUrl(path).data.publicUrl };
}

async function getPhotoUrl(formData: FormData) {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return null;
  return uploadLeaderPhoto(photo);
}

export async function createLeader(formData: FormData): Promise<LeaderActionError | void> {
  await requireAdmin();
  const parsed = leaderSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid leader data." };

  let photo: Awaited<ReturnType<typeof getPhotoUrl>>;
  try {
    photo = await getPhotoUrl(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload leader photo." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leaders").insert({ ...parsed.data, image_url: photo?.url ?? null });
  if (error) {
    if (photo) await createAdminClient().storage.from("leader-photos").remove([photo.path]);
    return { error: error.message };
  }

  revalidatePath("/about");
  revalidatePath("/leadership");
  revalidatePath("/dashboard/leaders");
  redirect("/dashboard/leaders");
}

export async function updateLeader(id: string, formData: FormData): Promise<LeaderActionError | void> {
  await requireAdmin();
  const parsed = leaderSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid leader data." };

  let photo: Awaited<ReturnType<typeof getPhotoUrl>>;
  try {
    photo = await getPhotoUrl(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload leader photo." };
  }

  const supabase = await createClient();
  const updateData = photo ? { ...parsed.data, image_url: photo.url } : parsed.data;
  const { error } = await supabase.from("leaders").update(updateData).eq("id", id);
  if (error) {
    if (photo) await createAdminClient().storage.from("leader-photos").remove([photo.path]);
    return { error: error.message };
  }

  revalidatePath("/about");
  revalidatePath("/leadership");
  revalidatePath("/dashboard/leaders");
  revalidatePath(`/dashboard/leaders/${id}/edit`);
  redirect("/dashboard/leaders");
}

export async function deleteLeader(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("leaders").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/about");
  revalidatePath("/leadership");
  revalidatePath("/dashboard/leaders");
  redirect("/dashboard/leaders");
}
