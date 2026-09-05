import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/types";

export type MemberFilters = {
  search?: string;
  status?: string;
  gender?: string;
  department?: string;
  cellGroup?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type MembersResponse = {
  members: Member[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getMembers(filters: MemberFilters = {}): Promise<MembersResponse> {
  const supabase = await createClient();
  const {
    search,
    status,
    gender,
    department,
    cellGroup,
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    pageSize = 20,
  } = filters;

  // Resolve related member IDs for department / cell group filters first
  let relatedIds: string[] | null = null;
  if (department) {
    const { data } = await supabase
      .from("department_members")
      .select("member_id")
      .eq("department_id", department);
    relatedIds = (data ?? []).map((d) => d.member_id);
  }
  if (cellGroup) {
    const { data } = await supabase
      .from("cell_group_members")
      .select("member_id")
      .eq("cell_group_id", cellGroup);
    relatedIds = (data ?? []).map((d) => d.member_id);
  }

  let query = supabase.from("members").select("*", { count: "exact" });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  if (status) query = query.eq("membership_status", status);
  if (gender) query = query.eq("gender", gender);
  if (relatedIds !== null) {
    // If related IDs resolve empty, we want zero results, not "all"
    query = relatedIds.length > 0 ? query.in("id", relatedIds) : query.in("id", [""]);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    members: (data as Member[]) ?? [],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getMember(id: string): Promise<Member | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("members").select("*").eq("id", id).single();
  return (data as Member) ?? null;
}

export async function getMemberJourney(memberId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("member_journeys")
    .select("*")
    .eq("member_id", memberId)
    .order("occurred_at", { ascending: false });
  return data ?? [];
}

export async function getMemberAttendance(memberId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("*, services(name), cell_groups(name), departments(name), events(title)")
    .eq("member_id", memberId)
    .order("check_in_time", { ascending: false })
    .limit(20);
  return data ?? [];
}
