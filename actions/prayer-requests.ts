"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const prayerRequestSchema = z.object({
  requester_name: z.string().optional().nullable(),
  member_id: z.string().optional().nullable(),
  content: z.string().min(1, { message: "Prayer request content is required." }),
  privacy: z.string().min(1, { message: "Privacy is required." }),
  status: z.string().min(1, { message: "Status is required." }),
});

export type PrayerRequestActionError = { error: string };

const publicPrayerRequestSchema = z.object({
  requester_name: z.string().max(120).optional().nullable(),
  content: z.string().trim().min(1, { message: "Prayer request content is required." }).max(5000),
});

function cleanFormData(formData: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return cleaned;
}

export async function submitPublicPrayerRequest(
  formData: FormData,
): Promise<PrayerRequestActionError | void> {
  const supabase = await createClient();
  const cleaned = cleanFormData(formData);
  const parsed = publicPrayerRequestSchema.safeParse(cleaned);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid prayer request." };
  }

  const { error } = await supabase.from("prayer_requests").insert({
    requester_name: parsed.data.requester_name,
    content: parsed.data.content,
    privacy: "private",
    status: "new",
  });

  if (error) return { error: "We could not submit your prayer request. Please try again." };

  revalidatePath("/dashboard/prayer-requests");
}

export async function createPrayerRequest(formData: FormData): Promise<PrayerRequestActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = prayerRequestSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid prayer request data." };
  }

  const { error } = await supabase.from("prayer_requests").insert(parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/prayer-requests");
  redirect("/dashboard/prayer-requests");
}

export async function updatePrayerRequest(id: string, formData: FormData): Promise<PrayerRequestActionError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = prayerRequestSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid prayer request data." };
  }

  const { error } = await supabase.from("prayer_requests").update(parsed.data).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/prayer-requests");
  revalidatePath(`/dashboard/prayer-requests/${id}`);
  redirect(`/dashboard/prayer-requests/${id}`);
}

export async function deletePrayerRequest(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("prayer_requests").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/prayer-requests");
  redirect("/dashboard/prayer-requests");
}
