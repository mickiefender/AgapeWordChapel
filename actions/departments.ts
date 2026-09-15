"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sanitizeGallery } from "@/lib/department-media";
import {
  deleteDepartmentImages,
  uploadDepartmentGallery,
  uploadDepartmentImage,
} from "@/lib/department-storage";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(1, { message: "Department name is required." }),
  description: z.string().optional().nullable(),
  leader_id: z.string().optional().nullable(),
  video_url: z.string().optional().nullable(),
  meeting_time: z.string().optional().nullable(),
  meeting_location: z.string().optional().nullable(),
});

export type DepartmentActionError = { error: string };

/** Fields handled separately from the plain text columns. */
const MEDIA_FIELDS = new Set(["image", "gallery", "existing_gallery"]);

function cleanFormData(formData: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (MEDIA_FIELDS.has(key)) continue;
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return cleaned;
}

/** Upload the optional cover image submitted alongside the department fields. */
async function uploadCoverIfPresent(formData: FormData): Promise<string | null> {
  const cover = formData.get("image");
  if (!(cover instanceof File) || cover.size === 0) return null;
  return uploadDepartmentImage(cover);
}

/** Read the gallery currently stored for a department — the source of truth. */
async function readStoredGallery(id: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("departments").select("gallery").eq("id", id).maybeSingle();
  return sanitizeGallery((data?.gallery as string[] | null) ?? []);
}

function revalidateDepartment(id?: string): void {
  revalidatePath("/dashboard/departments");
  revalidatePath("/ministries");
  if (id) {
    revalidatePath(`/dashboard/departments/${id}`);
    revalidatePath(`/ministries/${id}`);
  }
}

export async function createDepartment(formData: FormData): Promise<DepartmentActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const parsed = departmentSchema.safeParse(cleanFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid department data." };
  }

  let imageUrl: string | null;
  let gallery: string[];
  try {
    imageUrl = await uploadCoverIfPresent(formData);
    gallery = await uploadDepartmentGallery(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload department media." };
  }

  const { error } = await supabase
    .from("departments")
    .insert({ ...parsed.data, image_url: imageUrl, gallery })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidateDepartment();
  redirect("/dashboard/departments");
}

export async function updateDepartment(id: string, formData: FormData): Promise<DepartmentActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const parsed = departmentSchema.safeParse(cleanFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid department data." };
  }

  let coverUrl: string | null;
  let added: string[];
  try {
    coverUrl = await uploadCoverIfPresent(formData);
    added = await uploadDepartmentGallery(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload department media." };
  }

  // The gallery always grows from whatever is stored now, so photos removed
  // from the department page are never resurrected by saving this form.
  const storedGallery = await readStoredGallery(id);
  const updateData: Record<string, unknown> = {
    ...parsed.data,
    gallery: sanitizeGallery([...storedGallery, ...added]),
  };
  if (coverUrl) updateData.image_url = coverUrl;

  const { error } = await supabase.from("departments").update(updateData).eq("id", id);
  if (error) return { error: error.message };

  revalidateDepartment(id);
  redirect(`/dashboard/departments/${id}`);
}

export async function deleteDepartment(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { data } = await supabase.from("departments").select("image_url, gallery").eq("id", id).maybeSingle();

  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // Storage cleanup happens after the row is gone so a failure there never
  // blocks the delete the admin actually asked for.
  const mediaUrls = [
    ...sanitizeGallery((data?.gallery as string[] | null) ?? []),
    ...(data?.image_url ? [data.image_url as string] : []),
  ];
  await deleteDepartmentImages(mediaUrls);

  revalidateDepartment();
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
