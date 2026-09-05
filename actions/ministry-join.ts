"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import type { JoinRequestStatus } from "@/types";

const joinRequestSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Enter a valid email." }),
  phone: z.string().optional().nullable(),
  department_id: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

export type JoinRequestError = { error: string };

function cleanFormData(formData: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  if (cleaned.department_id === "none") cleaned.department_id = null;
  return cleaned;
}

export async function submitJoinRequest(formData: FormData): Promise<JoinRequestError | void> {
  const supabase = await createClient();
  const cleaned = cleanFormData(formData);

  const parsed = joinRequestSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const { error } = await supabase.from("ministry_join_requests").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/join-requests");
}

export async function approveJoinRequest(id: string): Promise<JoinRequestError | void> {
  return updateJoinRequestStatus(id, "approved");
}

export async function updateJoinRequestStatus(
  id: string,
  status: JoinRequestStatus,
): Promise<JoinRequestError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("ministry_join_requests").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/join-requests");
}

export async function deleteJoinRequest(id: string): Promise<JoinRequestError | void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("ministry_join_requests").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/join-requests");
}
