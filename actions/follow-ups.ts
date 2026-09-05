"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth";
import { z } from "zod";

const followUpSchema = z.object({
  member_id: z.string().optional().nullable(),
  visitor_id: z.string().optional().nullable(),
  assigned_to: z.string().min(1, { message: "Assignee is required." }),
  task: z.string().min(1, { message: "Task is required." }),
  due_date: z.string().optional().nullable(),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .default("pending"),
});

export type FollowUpActionError = { error: string };

export async function createFollowUp(formData: FormData): Promise<FollowUpActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = followUpSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid follow-up data." };
  }

  const { error } = await supabase.from("follow_ups").insert(parsed.data).select().single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/follow-ups");
  redirect("/dashboard/follow-ups");
}

export async function updateFollowUp(id: string, formData: FormData): Promise<FollowUpActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = followUpSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid follow-up data." };
  }

  const { error } = await supabase.from("follow_ups").update(parsed.data).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/follow-ups");
  redirect("/dashboard/follow-ups");
}

export async function deleteFollowUp(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("follow_ups").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/follow-ups");
  redirect("/dashboard/follow-ups");
}

export async function completeFollowUp(id: string): Promise<void> {
  await requireUser();

  const supabase = await createClient();
  const { error } = await supabase.from("follow_ups").update({ status: "completed" }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/follow-ups");
}
