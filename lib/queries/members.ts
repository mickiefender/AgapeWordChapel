import { createClient } from "@/lib/supabase/server";
import type { Member, MemberStatus } from "@/types";

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

export type SmsRecipient = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  membership_status: MemberStatus;
};

export async function getSmsRecipients(): Promise<SmsRecipient[]> {
  const supabase = await createClient();
  const pageSize = 1000;
  const recipients: SmsRecipient[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("members")
      .select("id, first_name, last_name, phone, membership_status")
      .not("phone", "is", null)
      .order("first_name")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Unable to load SMS recipients: ${error.message}`);

    const page = (data ?? []).filter((member): member is SmsRecipient => typeof member.phone === "string" && member.phone.trim() !== "");
    recipients.push(...page);
    if ((data ?? []).length < pageSize) return recipients;
  }
}

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
