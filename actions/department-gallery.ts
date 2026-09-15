"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import {
  moveGalleryImage,
  removeGalleryImage,
  sanitizeGallery,
  type DepartmentMediaResult,
} from "@/lib/department-media";
import {
  deleteDepartmentImage,
  uploadDepartmentGallery,
} from "@/lib/department-storage";

/** Largest number of photos a single ministry gallery may hold. */
const MAX_GALLERY_IMAGES = 30;

type DepartmentMediaRow = { gallery: string[] | null; image_url: string | null };

async function loadDepartmentMedia(id: string): Promise<DepartmentMediaRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("departments")
    .select("gallery, image_url")
    .eq("id", id)
    .maybeSingle();
  return (data as DepartmentMediaRow) ?? null;
}

async function saveGallery(id: string, gallery: string[]): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.from("departments").update({ gallery }).eq("id", id);
  return error?.message ?? null;
}

function revalidateDepartmentMedia(id: string): void {
  revalidatePath("/dashboard/departments");
  revalidatePath(`/dashboard/departments/${id}`);
  revalidatePath("/ministries");
  revalidatePath(`/ministries/${id}`);
}

/** Upload one or more new photos and append them to the ministry gallery. */
export async function addDepartmentGalleryImages(
  departmentId: string,
  formData: FormData,
): Promise<DepartmentMediaResult> {
  await requireAdmin();

  const existing = await loadDepartmentMedia(departmentId);
  if (!existing) return { error: "That department could not be found." };

  let uploaded: string[];
  try {
    uploaded = await uploadDepartmentGallery(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload those images." };
  }

  if (uploaded.length === 0) {
    return { error: "Choose at least one image to upload." };
  }

  const gallery = sanitizeGallery([...(existing.gallery ?? []), ...uploaded]);
  if (gallery.length > MAX_GALLERY_IMAGES) {
    return { error: `A gallery can hold at most ${MAX_GALLERY_IMAGES} images.` };
  }

  const saveError = await saveGallery(departmentId, gallery);
  if (saveError) return { error: saveError };

  revalidateDepartmentMedia(departmentId);
  return { success: true };
}

/** Remove a single photo from the gallery and delete it from storage. */
export async function removeDepartmentGalleryImage(
  departmentId: string,
  imageUrl: string,
): Promise<DepartmentMediaResult> {
  await requireAdmin();

  const existing = await loadDepartmentMedia(departmentId);
  if (!existing) return { error: "That department could not be found." };

  const current = sanitizeGallery(existing.gallery ?? []);
  if (!current.includes(imageUrl)) {
    return { error: "That image is no longer in the gallery." };
  }

  const gallery = removeGalleryImage(current, imageUrl);
  const saveError = await saveGallery(departmentId, gallery);
  if (saveError) return { error: saveError };

  // Only clear the stored file once the row no longer references it.
  if (existing.image_url !== imageUrl) {
    await deleteDepartmentImage(imageUrl).catch(() => undefined);
  }

  revalidateDepartmentMedia(departmentId);
  return { success: true };
}

/** Move a gallery photo one step earlier or later in the gallery order. */
export async function moveDepartmentGalleryImage(
  departmentId: string,
  imageUrl: string,
  direction: "earlier" | "later",
): Promise<DepartmentMediaResult> {
  await requireAdmin();

  const existing = await loadDepartmentMedia(departmentId);
  if (!existing) return { error: "That department could not be found." };

  const current = sanitizeGallery(existing.gallery ?? []);
  const fromIndex = current.indexOf(imageUrl);
  if (fromIndex === -1) return { error: "That image is no longer in the gallery." };

  const toIndex = direction === "earlier" ? fromIndex - 1 : fromIndex + 1;
  const gallery = moveGalleryImage(current, fromIndex, toIndex);
  if (gallery === current) return { success: true };

  const saveError = await saveGallery(departmentId, gallery);
  if (saveError) return { error: saveError };

  revalidateDepartmentMedia(departmentId);
  return { success: true };
}

/**
 * Promote a gallery photo to the ministry cover image. The previous cover is
 * pushed back into the gallery so no uploaded photo is lost.
 */
export async function setDepartmentCoverImage(
  departmentId: string,
  imageUrl: string,
): Promise<DepartmentMediaResult> {
  await requireAdmin();

  const existing = await loadDepartmentMedia(departmentId);
  if (!existing) return { error: "That department could not be found." };

  const current = sanitizeGallery(existing.gallery ?? []);
  if (!current.includes(imageUrl)) {
    return { error: "That image is no longer in the gallery." };
  }

  const remaining = removeGalleryImage(current, imageUrl);
  const previousCover = existing.image_url;
  const gallery =
    previousCover && previousCover !== imageUrl ? [previousCover, ...remaining] : remaining;

  const supabase = await createClient();
  const { error } = await supabase
    .from("departments")
    .update({ image_url: imageUrl, gallery })
    .eq("id", departmentId);
  if (error) return { error: error.message };

  revalidateDepartmentMedia(departmentId);
  return { success: true };
}

/** Clear the cover image, returning it to the gallery and deleting nothing. */
export async function clearDepartmentCoverImage(departmentId: string): Promise<DepartmentMediaResult> {
  await requireAdmin();

  const existing = await loadDepartmentMedia(departmentId);
  if (!existing) return { error: "That department could not be found." };
  if (!existing.image_url) return { success: true };

  const current = sanitizeGallery(existing.gallery ?? []);
  const gallery = [existing.image_url, ...current.filter((image) => image !== existing.image_url)];

  const supabase = await createClient();
  const { error } = await supabase
    .from("departments")
    .update({ image_url: null, gallery })
    .eq("id", departmentId);
  if (error) return { error: error.message };

  revalidateDepartmentMedia(departmentId);
  return { success: true };
}
