"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const cellGroupSchema = z.object({
  name: z.string().min(1, { message: "Group name is required." }),
  leader_id: z.string().optional().nullable(),
  assistant_leader_id: z.string().optional().nullable(),
  meeting_location: z.string().optional().nullable(),
  meeting_day: z.string().optional().nullable(),
  meeting_time: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type CellGroupActionError = { error: string };

export async function createCellGroup(formData: FormData): Promise<CellGroupActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = cellGroupSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid cell group data." };
  }

  const { error } = await supabase.from("cell_groups").insert(parsed.data).select().single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/cell-groups");
  redirect("/dashboard/cell-groups");
}

export async function updateCellGroup(id: string, formData: FormData): Promise<CellGroupActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = cellGroupSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid cell group data." };
  }

  const { error } = await supabase.from("cell_groups").update(parsed.data).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/cell-groups");
  revalidatePath(`/dashboard/cell-groups/${id}`);
  redirect(`/dashboard/cell-groups/${id}`);
}

export async function deleteCellGroup(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("cell_groups").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/cell-groups");
  redirect("/dashboard/cell-groups");
}
