"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const visitorSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required." }),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: "Enter a valid email." }).optional().nullable().or(z.literal("")),
  visit_date: z.string().optional().default(() => new Date().toISOString().slice(0, 10)),
  service_attended: z.string().optional().nullable(),
  invited_by: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z
    .enum(["new", "contacted", "follow_up", "connected", "joined", "not_interested"])
    .default("new"),
  assigned_to: z.string().optional().nullable(),
});

export type VisitorActionError = { error: string };

export async function createVisitor(formData: FormData): Promise<VisitorActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = visitorSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid visitor data." };
  }

  const { error } = await supabase.from("visitors").insert(parsed.data).select().single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/visitors");
  redirect("/dashboard/visitors");
}

export async function updateVisitor(id: string, formData: FormData): Promise<VisitorActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = visitorSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid visitor data." };
  }

  const { error } = await supabase.from("visitors").update(parsed.data).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/visitors");
  revalidatePath(`/dashboard/visitors/${id}`);
  redirect(`/dashboard/visitors/${id}`);
}

export async function deleteVisitor(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("visitors").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/visitors");
  redirect("/dashboard/visitors");
}
