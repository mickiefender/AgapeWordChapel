/**
 * Server-only storage helpers for the `department-media` bucket.
 *
 * These use the service-role client, so this module must never be imported
 * from a client component — only from server actions or server components.
 */

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEPARTMENT_MEDIA_BUCKET, imageExtension, getStoragePath } from "@/lib/department-media";

/** Largest image we accept, in bytes. Keeps the bucket from filling with raw camera files. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

async function ensureBucket(): Promise<void> {
  const admin = createAdminClient();
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === DEPARTMENT_MEDIA_BUCKET);
  if (!exists) {
    await admin.storage.createBucket(DEPARTMENT_MEDIA_BUCKET, { public: true });
  }
}

function assertValidImage(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name || "That file"} is not an image.`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${file.name || "That image"} is larger than 10MB.`);
  }
}

/** Upload one image and return its public URL. */
export async function uploadDepartmentImage(file: File): Promise<string> {
  assertValidImage(file);
  await ensureBucket();

  const objectPath = `${DEPARTMENT_MEDIA_BUCKET}/${randomUUID()}.${imageExtension(file.name)}`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(DEPARTMENT_MEDIA_BUCKET)
    .upload(objectPath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const { data } = admin.storage.from(DEPARTMENT_MEDIA_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

/** Upload every non-empty image in a form's repeated `gallery` field. */
export async function uploadDepartmentGallery(formData: FormData): Promise<string[]> {
  const files = formData
    .getAll("gallery")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadDepartmentImage(file));
  }
  return urls;
}

/**
 * Delete an image from the bucket. URLs that do not live in the
 * `department-media` bucket (e.g. pasted external links) are ignored so we
 * never delete something we did not create.
 */
export async function deleteDepartmentImage(url: string): Promise<void> {
  const objectPath = getStoragePath(url);
  if (!objectPath) return;

  const admin = createAdminClient();
  const { error } = await admin.storage.from(DEPARTMENT_MEDIA_BUCKET).remove([objectPath]);
  // A missing object is fine — the row update is what the admin cares about.
  if (error && !/not found/i.test(error.message)) {
    throw new Error(error.message);
  }
}

/** Delete several images, tolerating individual failures. */
export async function deleteDepartmentImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => deleteDepartmentImage(url).catch(() => undefined)));
}
