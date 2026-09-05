import { createClient } from "@/lib/supabase/server";
import type { FollowUp } from "@/types";

export type FollowUpFilters = {
  status?: string;
  page?: number;
  pageSize?: number;
};

export type FollowUpWithNames = FollowUp & {
  member_name: string | null;
  visitor_name: string | null;
  assignee_name: string | null;
};

export type FollowUpsResponse = {
  followUps: FollowUpWithNames[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getFollowUps(filters: FollowUpFilters = {}): Promise<FollowUpsResponse> {
  const supabase = await createClient();
  const { status, page = 1, pageSize = 20 } = filters;

  let query = supabase.from("follow_ups").select("*", { count: "exact" });

  if (status) query = query.eq("status", status);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const followUps = (data as FollowUp[]) ?? [];

  // Fetch related names
  const memberIds = followUps.map((f) => f.member_id).filter(Boolean) as string[];
  const visitorIds = followUps.map((f) => f.visitor_id).filter(Boolean) as string[];
  const assigneeIds = followUps.map((f) => f.assigned_to).filter(Boolean) as string[];

  const memberNames: Record<string, string> = {};
  const visitorNames: Record<string, string> = {};
  const assigneeNames: Record<string, string> = {};

  if (memberIds.length > 0) {
    const { data: members } = await supabase.from("members").select("id, first_name, last_name").in("id", memberIds);
    for (const m of members ?? []) memberNames[m.id] = `${m.first_name} ${m.last_name}`;
  }
  if (visitorIds.length > 0) {
    const { data: visitors } = await supabase.from("visitors").select("id, full_name").in("id", visitorIds);
    for (const v of visitors ?? []) visitorNames[v.id] = v.full_name;
  }
  if (assigneeIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, first_name, last_name").in("id", assigneeIds);
    for (const p of profiles ?? []) assigneeNames[p.id] = `${p.first_name} ${p.last_name}`;
  }

  const withNames: FollowUpWithNames[] = followUps.map((f) => ({
    ...f,
    member_name: f.member_id ? memberNames[f.member_id] ?? null : null,
    visitor_name: f.visitor_id ? visitorNames[f.visitor_id] ?? null : null,
    assignee_name: assigneeNames[f.assigned_to] ?? null,
  }));

  return {
    followUps: withNames,
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getFollowUp(id: string): Promise<FollowUp | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("follow_ups").select("*").eq("id", id).single();
  return (data as FollowUp) ?? null;
}

export type FollowUpStats = {
  total: number;
  pending: number;
  inProgress: number;
  overdue: number;
  completed: number;
};

export async function getFollowUpStats(): Promise<FollowUpStats> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [totalRes, pendingRes, inProgressRes, overdueRes, completedRes] = await Promise.all([
    supabase.from("follow_ups").select("id", { count: "exact", head: true }),
    supabase.from("follow_ups").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("follow_ups").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase
      .from("follow_ups")
      .select("id", { count: "exact", head: true })
      .lt("due_date", today)
      .not("status", "in", ["completed", "cancelled"]),
    supabase.from("follow_ups").select("id", { count: "exact", head: true }).eq("status", "completed"),
  ]);

  return {
    total: totalRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    inProgress: inProgressRes.count ?? 0,
    overdue: overdueRes.count ?? 0,
    completed: completedRes.count ?? 0,
  };
}

export async function getMembersForFollowUp() {
  const supabase = await createClient();
  const { data } = await supabase.from("members").select("id, first_name, last_name").order("first_name");
  return data ?? [];
}

export async function getVisitorsForFollowUp() {
  const supabase = await createClient();
  const { data } = await supabase.from("visitors").select("id, full_name").order("full_name");
  return data ?? [];
}

export async function getProfilesForFollowUp() {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, first_name, last_name, role").order("first_name");
  return data ?? [];
}
