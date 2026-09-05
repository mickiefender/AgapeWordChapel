"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { randomUUID } from "crypto";

const sermonSchema = z.object({
  title: z.string().min(1, { message: "Sermon title is required." }),
  speaker: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  scripture_references: z.string().optional().nullable(),
  categories: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  audio_url: z.string().optional().nullable(),
  video_url: z.string().optional().nullable(),
  youtube_url: z.string().url().optional().nullable(),
  pdf_url: z.string().optional().nullable(),
  facebook_url: z.string().url().optional().nullable(),
  published_date: z.string().min(1, { message: "Sermon date is required." }),
  status: z.enum(["published", "unpublished"]),
});

export type SermonActionError = { error: string };

function cleanFormData(formData: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return cleaned;
}

async function uploadSermonFile(file: File, kind: "images" | "audio" | "video"): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${kind}/${randomUUID()}.${extension}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("sermon-media").upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return admin.storage.from("sermon-media").getPublicUrl(path).data.publicUrl;
}

async function uploadMedia(formData: FormData, field: "image" | "audio" | "video", kind: "images" | "audio" | "video") {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 100 * 1024 * 1024) throw new Error(`${field} files must be 100MB or smaller.`);
  const expected = field === "image" ? "image/" : `${field}/`;
  if (!file.type.startsWith(expected)) throw new Error(`Select a valid ${field} file.`);
  return uploadSermonFile(file, kind);
}

async function getUploadedMedia(formData: FormData) {
  return {
    image_url: await uploadMedia(formData, "image", "images"),
    audio_url: await uploadMedia(formData, "audio", "audio"),
    video_url: await uploadMedia(formData, "video", "video"),
  };
}

function splitList(value: string | null | undefined): string[] | null {
  if (!value) return null;
  const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts : null;
}

function sanitizeSermonData(data: Record<string, unknown>) {
  return {
    ...data,
    scripture_references: splitList(data.scripture_references as string | null),
    categories: splitList(data.categories as string | null),
    tags: splitList(data.tags as string | null),
  };
}

export async function createSermon(formData: FormData): Promise<SermonActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = sermonSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid sermon data." };
  }

  const sermonData = sanitizeSermonData(parsed.data);
  let media: Awaited<ReturnType<typeof getUploadedMedia>>;
  try { media = await getUploadedMedia(formData); } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload sermon media." };
  }

  const { error } = await supabase.from("sermons").insert({ ...sermonData, ...Object.fromEntries(Object.entries(media).filter(([, value]) => value)) });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/sermons");
  redirect("/dashboard/sermons");
}

export async function updateSermon(id: string, formData: FormData): Promise<SermonActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = sermonSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid sermon data." };
  }

  const sermonData = sanitizeSermonData(parsed.data);
  let media: Awaited<ReturnType<typeof getUploadedMedia>>;
  try { media = await getUploadedMedia(formData); } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to upload sermon media." };
  }

  const { error } = await supabase.from("sermons").update({ ...sermonData, ...Object.fromEntries(Object.entries(media).filter(([, value]) => value)) }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/sermons");
  revalidatePath(`/dashboard/sermons/${id}`);
  redirect(`/dashboard/sermons/${id}`);
}

export async function deleteSermon(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("sermons").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/sermons");
  redirect("/dashboard/sermons");
}
