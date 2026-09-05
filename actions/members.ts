"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { randomUUID } from "crypto";

const memberSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required." }),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, { message: "Last name is required." }),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: "Enter a valid email." }).optional().nullable().or(z.literal("")),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  marital_status: z
    .enum(["single", "married", "engaged", "widowed", "divorced", "separated"])
    .optional()
    .nullable(),
  occupation: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  membership_date: z.string().optional().nullable(),
  membership_status: z
    .enum(["visitor", "new_convert", "new_member", "active_member", "worker", "leader", "inactive"])
    .default("visitor"),
  baptism_status: z.string().optional().nullable(),
  branch_location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
});

export type MemberActionError = { error: string };

async function uploadAvatar(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `avatars/${randomUUID()}.${ext}`;

  const admin = createAdminClient();

  // Ensure the public 'avatars' bucket exists.
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.some((b) => b.name === "avatars")) {
    await admin.storage.createBucket("avatars", { public: true });
  }

  const { error: uploadError } = await admin.storage.from("avatars").upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = admin.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

async function extractAvatarUrl(formData: FormData): Promise<string | null> {
  const avatar = formData.get("avatar");
  if (!(avatar instanceof File) || avatar.size === 0) return null;
  return uploadAvatar(avatar);
}

export async function createMember(formData: FormData): Promise<MemberActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  // Convert empty strings to null
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === "avatar") continue;
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = memberSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid member data." };
  }

  let avatarUrl: string | null = null;
  try {
    avatarUrl = await extractAvatarUrl(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to upload avatar." };
  }

  const { error } = await supabase
    .from("members")
    .insert({ ...parsed.data, avatar_url: avatarUrl })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}

export async function updateMember(id: string, formData: FormData): Promise<MemberActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === "avatar") continue;
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = memberSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid member data." };
  }

  let avatarUrl: string | null | undefined = undefined;
  try {
    const newAvatar = await extractAvatarUrl(formData);
    if (newAvatar) avatarUrl = newAvatar;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to upload avatar." };
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

  const { error } = await supabase.from("members").update(updateData).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/members");
  revalidatePath(`/dashboard/members/${id}`);
  redirect(`/dashboard/members/${id}`);
}

export async function deleteMember(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}
