"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { randomUUID } from "crypto";

const departmentSchema = z.object({
  name: z.string().min(1, { message: "Department name is required." }),
  description: z.string().optional().nullable(),
  leader_id: z.string().optional().nullable(),
  video_url: z.string().optional().nullable(),
  meeting_time: z.string().optional().nullable(),
  meeting_location: z.string().optional().nullable(),
});

export type DepartmentActionError = { error: string };

function parseGallery(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function cleanFormData(formData: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === "image" || key === "gallery" || key === "existing_gallery") continue;
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return cleaned;
}

async function uploadDepartmentImage(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `department-media/${randomUUID()}.${extension}`;

  const admin = createAdminClient();
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === "department-media")) {
    await admin.storage.createBucket("department-media", { public: true });
  }

  const { error } = await admin.storage.from("department-media").upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    {
      contentType: file.type || "image/jpeg",
      upsert: true,
    },
  );
  if (error) throw new Error(error.message);

  const { data } = admin.storage.from("department-media").getPublicUrl(path);
  return data.publicUrl;
}

async function getDepartmentMedia(formData: FormData, existingGallery: string[]) {
  const cover = formData.get("image");
  let imageUrl: string | null = null;
  if (cover instanceof File && cover.size > 0) {
    imageUrl = await uploadDepartmentImage(cover);
  }

  const galleryFiles = formData
    .getAll("gallery")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const newGallery: string[] = [];
  for (const file of galleryFiles) {
    newGallery.push(await uploadDepartmentImage(file));
  }

  return { imageUrl, gallery: [...existingGallery, ...newGallery] };
}

export async function createDepartment(formData: FormData): Promise<DepartmentActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = departmentSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid department data." };
  }

  let media: Awaited<ReturnType<typeof getDepartmentMedia>>;
  try {
    media = await getDepartmentMedia(formData, []);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload department media." };
  }

  const { error } = await supabase
    .from("departments")
    .insert({
      ...parsed.data,
      image_url: media.imageUrl,
      gallery: media.gallery,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/departments");
  revalidatePath("/ministries");
  redirect("/dashboard/departments");
}

export async function updateDepartment(id: string, formData: FormData): Promise<DepartmentActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = departmentSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid department data." };
  }

  const existingGallery = parseGallery(formData.get("existing_gallery") as string | null);

  let media: Awaited<ReturnType<typeof getDepartmentMedia>>;
  try {
    media = await getDepartmentMedia(formData, existingGallery);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload department media." };
  }

  const updateData: Record<string, unknown> = { ...parsed.data, gallery: media.gallery };
  if (media.imageUrl) updateData.image_url = media.imageUrl;

  const { error } = await supabase.from("departments").update(updateData).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/departments");
  revalidatePath(`/dashboard/departments/${id}`);
  revalidatePath("/ministries");
  revalidatePath(`/ministries/${id}`);
  redirect(`/dashboard/departments/${id}`);
}

export async function deleteDepartment(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("departments").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/departments");
  revalidatePath("/ministries");
  redirect("/dashboard/departments");
}

export async function addDepartmentMembers(
  departmentId: string,
  memberIds: string[],
): Promise<DepartmentActionError | void> {
  await requireAdmin();

  if (memberIds.length === 0) {
    return { error: "Select at least one member to add." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("department_members").upsert(
    memberIds.map((memberId) => ({
      department_id: departmentId,
      member_id: memberId,
    })),
    { onConflict: "department_id,member_id", ignoreDuplicates: true },
  );

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/departments/${departmentId}`);
}
