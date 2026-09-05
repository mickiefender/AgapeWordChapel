"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const heroImageSchema = z.object({
  title: z.string().trim().max(120).optional().nullable(),
  duration_seconds: z.coerce.number().int().min(1).max(60),
  is_active: z.enum(["true", "false"]).default("true"),
});

export type HeroImageActionError = { error: string };

export async function createHeroImage(formData: FormData): Promise<HeroImageActionError | void> {
  const { user } = await requireAdmin();
  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) return { error: "Choose an image to upload." };
  if (image.size > 10 * 1024 * 1024) return { error: "Hero images must be 10MB or smaller." };
  if (!image.type.startsWith("image/")) return { error: "Select a valid image file." };

  const parsed = heroImageSchema.safeParse({
    title: formData.get("title") || null,
    duration_seconds: formData.get("duration_seconds"),
    is_active: formData.get("is_active") || "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid hero image settings." };

  const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `hero-images/${randomUUID()}.${extension}`;
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("hero-images")
    .upload(storagePath, Buffer.from(await image.arrayBuffer()), {
      contentType: image.type,
      upsert: false,
    });

  if (uploadError) return { error: `Unable to upload hero image: ${uploadError.message}` };

  const supabase = await createClient();
  const { data: lastImage } = await supabase
    .from("hero_images")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error: insertError } = await supabase.from("hero_images").insert({
    image_url: admin.storage.from("hero-images").getPublicUrl(storagePath).data.publicUrl,
    storage_path: storagePath,
    title: parsed.data.title || null,
    duration_seconds: parsed.data.duration_seconds,
    is_active: parsed.data.is_active === "true",
    sort_order: (lastImage?.sort_order ?? -1) + 1,
    created_by: user.id,
  });

  if (insertError) {
    await admin.storage.from("hero-images").remove([storagePath]);
    return { error: `Unable to save hero image: ${insertError.message}` };
  }

  revalidatePath("/dashboard/hero-images");
  revalidatePath("/");
}

export async function deleteHeroImage(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: image, error: readError } = await supabase
    .from("hero_images")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (readError) throw new Error(`Unable to find hero image: ${readError.message}`);

  const { error: deleteError } = await supabase.from("hero_images").delete().eq("id", id);
  if (deleteError) throw new Error(`Unable to delete hero image: ${deleteError.message}`);

  const storageError = (await createAdminClient().storage.from("hero-images").remove([image.storage_path])).error;
  if (storageError) throw new Error(`Image deleted, but storage cleanup failed: ${storageError.message}`);

  revalidatePath("/dashboard/hero-images");
  revalidatePath("/");
}

export async function toggleHeroImage(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("hero_images").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`Unable to update hero image: ${error.message}`);
  revalidatePath("/dashboard/hero-images");
  revalidatePath("/");
}
