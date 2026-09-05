"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth";
import { z } from "zod";
import type { Role } from "@/types";

const createUserSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  first_name: z.string().min(1, { message: "First name is required." }),
  last_name: z.string().min(1, { message: "Last name is required." }),
  role: z.enum([
    "super_admin",
    "pastor",
    "church_admin",
    "finance_officer",
    "department_leader",
    "cell_leader",
    "worker",
    "member",
  ]),
  phone: z.string().optional().nullable(),
});

const updateUserSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }),
  first_name: z.string().min(1, { message: "First name is required." }),
  last_name: z.string().min(1, { message: "Last name is required." }),
  role: z.enum([
    "super_admin",
    "pastor",
    "church_admin",
    "finance_officer",
    "department_leader",
    "cell_leader",
    "worker",
    "member",
  ]),
  phone: z.string().optional().nullable(),
});

export type AdminUserActionError = { error: string };

function cleanFormData(formData: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(formData.entries());
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return cleaned;
}

export async function createAdminUser(formData: FormData): Promise<AdminUserActionError | void> {
  await requireSuperAdmin();

  const cleaned = cleanFormData(formData);
  const parsed = createUserSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid user data." };
  }

  const admin = createAdminClient();

  // Create the auth user. The handle_new_user() trigger creates the profile
  // from user_metadata (first_name, last_name, role).
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      role: parsed.data.role,
    },
  });

  if (error) return { error: error.message };

  // Update phone if provided (profiles.phone isn't set by the trigger)
  const supabase = await createClient();
  if (data.user && parsed.data.phone) {
    await supabase.from("profiles").update({ phone: parsed.data.phone }).eq("user_id", data.user.id);
  }

  revalidatePath("/dashboard/admin-users");
  redirect("/dashboard/admin-users");
}

export async function updateAdminUser(id: string, formData: FormData): Promise<AdminUserActionError | void> {
  await requireSuperAdmin();

  const supabase = await createClient();
  const admin = createAdminClient();

  const cleaned = cleanFormData(formData);
  const parsed = updateUserSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid user data." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!profile) return { error: "User not found." };

  // Update auth user email if changed
  if (parsed.data.email) {
    const { error: authError } = await admin.auth.admin.updateUserById(profile.user_id, {
      email: parsed.data.email,
    });
    if (authError) return { error: authError.message };
  }

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      role: parsed.data.role as Role,
      phone: parsed.data.phone ?? null,
    })
    .eq("id", id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/dashboard/admin-users");
  revalidatePath(`/dashboard/admin-users/${id}`);
  redirect(`/dashboard/admin-users/${id}`);
}

export async function deleteAdminUser(id: string): Promise<void> {
  await requireSuperAdmin();

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!profile) throw new Error("User not found.");

  const { error } = await admin.auth.admin.deleteUser(profile.user_id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin-users");
  redirect("/dashboard/admin-users");
}
