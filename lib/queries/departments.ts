import { createClient } from "@/lib/supabase/server";
import type { Department, Member } from "@/types";

export type DepartmentWithDetails = Department & {
  leader_name: string | null;
  member_count: number;
};

export type PublicDepartment = Pick<
  Department,
  | "id"
  | "name"
  | "description"
  | "image_url"
  | "gallery"
  | "video_url"
  | "meeting_time"
  | "meeting_location"
  | "leader_id"
>;

export async function getDepartments(): Promise<DepartmentWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("departments").select("*").order("name", { ascending: true });
  const departments = (data as Department[]) ?? [];

  const leaderIds = departments.map((d) => d.leader_id).filter(Boolean) as string[];
  const leaderNames: Record<string, string> = {};
  if (leaderIds.length > 0) {
    const { data: leaders } = await supabase.from("members").select("id, first_name, last_name").in("id", leaderIds);
    for (const l of leaders ?? []) leaderNames[l.id] = `${l.first_name} ${l.last_name}`;
  }

  const { data: deptMembers } = await supabase.from("department_members").select("department_id");
  const memberCounts: Record<string, number> = {};
  for (const dm of deptMembers ?? []) {
    memberCounts[dm.department_id] = (memberCounts[dm.department_id] ?? 0) + 1;
  }

  return departments.map((d) => ({
    ...d,
    leader_name: d.leader_id ? leaderNames[d.leader_id] ?? null : null,
    member_count: memberCounts[d.id] ?? 0,
  }));
}

export async function getDepartment(id: string): Promise<Department | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("departments").select("*").eq("id", id).single();
  return (data as Department) ?? null;
}

export async function getPublicDepartments(): Promise<PublicDepartment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("departments")
    .select(
      "id, name, description, image_url, gallery, video_url, meeting_time, meeting_location, leader_id",
    )
    .order("name", { ascending: true });
  return (data ?? []) as PublicDepartment[];
}

export async function getDepartmentMembers(departmentId: string): Promise<(Member & { role: string | null; joined_at: string })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("department_members")
    .select("*, member:members(*)")
    .eq("department_id", departmentId)
    .order("joined_at", { ascending: false });

  return (data ?? []).map((dm: any) => ({
    ...(dm.member as Member),
    role: dm.role ?? null,
    joined_at: dm.joined_at,
  }));
}

export async function getAllMembers(): Promise<Pick<Member, "id" | "first_name" | "last_name">[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("members").select("id, first_name, last_name").order("first_name");
  return data ?? [];
}

export async function getAvailableDepartmentMembers(
  departmentId: string,
): Promise<Pick<Member, "id" | "first_name" | "last_name" | "email" | "avatar_url">[]> {
  const supabase = await createClient();
  const { data: assigned } = await supabase
    .from("department_members")
    .select("member_id")
    .eq("department_id", departmentId);
  const assignedIds = (assigned ?? []).map((member) => member.member_id);

  let query = supabase
    .from("members")
    .select("id, first_name, last_name, email, avatar_url")
    .order("first_name")
    .order("last_name");

  if (assignedIds.length > 0) {
    query = query.not("id", "in", `(${assignedIds.join(",")})`);
  }

  const { data } = await query;
  return data ?? [];
}
