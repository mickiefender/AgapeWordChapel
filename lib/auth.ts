import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Role, Profile } from "@/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getProfile(userId?: string): Promise<Profile | null> {
  const supabase = await createClient();
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
  return (data as Profile) ?? null;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile || !roles.includes(profile.role)) {
    redirect("/dashboard");
  }
  return { user, profile };
}

export async function requireAdmin() {
  return requireRole(["super_admin", "pastor", "church_admin"]);
}

export async function requireSuperAdmin() {
  return requireRole(["super_admin"]);
}

export async function requireFinance() {
  return requireRole(["super_admin", "pastor", "church_admin", "finance_officer"]);
}

export async function requirePastor() {
  return requireRole(["super_admin", "pastor"]);
}
