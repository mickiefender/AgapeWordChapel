"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1, { message: "Service name is required." }),
  date: z.string().min(1, { message: "Date is required." }),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  facebook_live_url: z.string().url({ message: "Enter a valid Facebook live URL." }).optional().nullable(),
});

const serviceItemSchema = z.object({
  title: z.string().min(1, { message: "Item title is required." }),
  start_time: z.string().optional().nullable(),
  duration_minutes: z.coerce.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  sort_order: z.coerce.number().int().min(0).optional().nullable(),
});

const serviceAssignmentSchema = z.object({
  member_id: z.string().min(1, { message: "Member is required." }),
  role: z.string().min(1, { message: "Role is required." }),
  notes: z.string().optional().nullable(),
});

export type ServiceActionError = { error: string };

export async function createService(formData: FormData): Promise<ServiceActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = serviceSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid service data." };
  }

  const { error } = await supabase.from("services").insert(parsed.data).select().single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/services");
  redirect("/dashboard/services");
}

export async function updateService(id: string, formData: FormData): Promise<ServiceActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = serviceSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid service data." };
  }

  const { error } = await supabase.from("services").update(parsed.data).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/services");
  revalidatePath(`/dashboard/services/${id}`);
  redirect(`/dashboard/services/${id}`);
}

export async function deleteService(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/services");
  redirect("/dashboard/services");
}

export async function addServiceItem(serviceId: string, formData: FormData): Promise<ServiceActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  // Compute sort_order as one after the current max
  const { data: items } = await supabase
    .from("service_items")
    .select("sort_order")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextSortOrder = cleaned.sort_order ?? ((items?.[0]?.sort_order ?? -1) + 1);

  const parsed = serviceItemSchema.safeParse({ ...cleaned, sort_order: nextSortOrder });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid service item data." };
  }

  const { error } = await supabase.from("service_items").insert({
    ...parsed.data,
    service_id: serviceId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/services");
}

export async function updateServiceItem(serviceId: string, itemId: string, formData: FormData): Promise<ServiceActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = serviceItemSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid service item data." };
  }

  const { error } = await supabase.from("service_items").update(parsed.data).eq("id", itemId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/services");
}

export async function deleteServiceItem(serviceId: string, itemId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("service_items").delete().eq("id", itemId).eq("service_id", serviceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/services");
}

export async function addServiceAssignment(serviceId: string, formData: FormData): Promise<ServiceActionError | void> {
  await requireAdmin();

  const supabase = await createClient();

  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }

  const parsed = serviceAssignmentSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid service assignment data." };
  }

  const { error } = await supabase.from("service_assignments").insert({
    ...parsed.data,
    service_id: serviceId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/services");
}

export async function deleteServiceAssignment(serviceId: string, assignmentId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("service_assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("service_id", serviceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/services");
}
