/**
 * Shared helpers for department (ministry) media: the cover image, the gallery
 * of additional photos, and the optional featured video.
 *
 * The gallery is stored as a `text[]` column on `public.departments` holding
 * public storage URLs from the `department-media` bucket.
 */

export const DEPARTMENT_MEDIA_BUCKET = "department-media";

export type DepartmentMediaResult = { error: string } | { success: true };

/** Path segment Supabase uses for objects in a public bucket. */
const PUBLIC_OBJECT_MARKER = `/object/public/${DEPARTMENT_MEDIA_BUCKET}/`;

/**
 * Parse the JSON-encoded gallery that the department form submits through a
 * hidden input, tolerating missing or malformed values.
 */
export function parseGallery(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  } catch {
    return [];
  }
}

/**
 * Turn a stored public URL back into the object path inside the bucket so it
 * can be removed from storage. Returns null for external URLs.
 */
export function getStoragePath(url: string): string | null {
  const index = url.indexOf(PUBLIC_OBJECT_MARKER);
  if (index === -1) return null;
  const path = url.slice(index + PUBLIC_OBJECT_MARKER.length).split("?")[0];
  return decodeURIComponent(path) || null;
}

/** Remove a single image from the gallery, leaving the original untouched. */
export function removeGalleryImage(gallery: string[], imageUrl: string): string[] {
  return gallery.filter((image) => image !== imageUrl);
}

/** Move a gallery image one position, returning a new array. */
export function moveGalleryImage(gallery: string[], fromIndex: number, toIndex: number): string[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return gallery;
  if (fromIndex >= gallery.length || toIndex >= gallery.length) return gallery;
  const next = [...gallery];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/** Drop empty or non-string entries from a raw gallery list. */
export function sanitizeGallery(value: string[]): string[] {
  return value.filter((image): image is string => typeof image === "string" && image.trim() !== "");
}

/** File extension for an uploaded image, defaulting to jpg. */
export function imageExtension(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension || extension === fileName.toLowerCase()) return "jpg";
  return extension.replace(/[^a-z0-9]/g, "") || "jpg";
}
