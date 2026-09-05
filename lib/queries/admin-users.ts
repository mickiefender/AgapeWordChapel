import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, Role } from "@/types";

export type AdminUser = Profile & { email: string | null };

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

  // Fetch emails for each user via the service-role admin client
  const emailMap: Record<string, string> = {};
  try {
    const { data: usersRes } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    for (const u of usersRes?.users ?? []) {
      emailMap[u.id] = u.email ?? "";
    }
  } catch {
    // Ignore email fetch errors — list still renders with null emails
  }

  return (profiles ?? []).map((p) => ({
    ...(p as Profile),
    email: emailMap[p.user_id] ?? null,
  }));
}

export async function getAdminUser(id: string): Promise<AdminUser | null> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!data) return null;

  let email: string | null = null;
  try {
    const { data: userRes } = await admin.auth.admin.getUserById((data as Profile).user_id);
    email = userRes?.user?.email ?? null;
  } catch {
    // ignore
  }

  return { ...(data as Profile), email };
}

export async function getAllRoles(): Promise<{ value: Role; label: string }[]> {
  return [
    { value: "super_admin", label: "Super Administrator" },
    { value: "pastor", label: "Pastor" },
    { value: "church_admin", label: "Church Administrator" },
    { value: "finance_officer", label: "Finance Officer" },
    { value: "department_leader", label: "Department Leader" },
    { value: "cell_leader", label: "Cell Leader" },
    { value: "worker", label: "Worker" },
    { value: "member", label: "Member" },
  ];
}
