import { createClient } from "@/lib/supabase/server";
import type { Visitor, Profile } from "@/types";

export type VisitorFilters = {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type VisitorWithProfile = Visitor & {
  assigned_profile?: Pick<Profile, "id" | "first_name" | "last_name" | "role"> | null;
};

export type VisitorsResponse = {
  visitors: VisitorWithProfile[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getVisitors(filters: VisitorFilters = {}): Promise<VisitorsResponse> {
  const supabase = await createClient();
  const { search, status, page = 1, pageSize = 20 } = filters;

  let query = supabase
    .from("visitors")
    .select("*, assigned_profile:profiles!visitors_assigned_to_fkey(id, first_name, last_name, role)", { count: "exact" });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  if (status) query = query.eq("status", status);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    visitors: (data as VisitorWithProfile[]) ?? [],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getVisitor(id: string): Promise<Visitor | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("visitors").select("*").eq("id", id).single();
  return (data as Visitor) ?? null;
}

export type VisitorStats = {
  total: number;
  newThisMonth: number;
  needsFollowUp: number;
  joined: number;
};

export async function getVisitorStats(): Promise<VisitorStats> {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [totalRes, monthRes, followUpRes, joinedRes] = await Promise.all([
    supabase.from("visitors").select("id", { count: "exact", head: true }),
    supabase.from("visitors").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("visitors").select("id", { count: "exact", head: true }).in("status", ["new", "contacted", "follow_up"]),
    supabase.from("visitors").select("id", { count: "exact", head: true }).eq("status", "joined"),
  ]);

  return {
    total: totalRes.count ?? 0,
    newThisMonth: monthRes.count ?? 0,
    needsFollowUp: followUpRes.count ?? 0,
    joined: joinedRes.count ?? 0,
  };
}

export async function getAssignedProfiles(): Promise<Pick<Profile, "id" | "first_name" | "last_name" | "role">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role")
    .order("first_name", { ascending: true });
  return (data ?? []) as Pick<Profile, "id" | "first_name" | "last_name" | "role">[];
}
