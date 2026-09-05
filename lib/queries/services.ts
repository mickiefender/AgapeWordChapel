import { createClient } from "@/lib/supabase/server";
import type { Service, ServiceItem, ServiceAssignment, Member } from "@/types";

export type ServiceWithDetails = Service & {
  item_count: number;
  assignment_count: number;
};

export async function getServices(): Promise<ServiceWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").order("date", { ascending: false });
  const services = (data as Service[]) ?? [];

  const { data: items } = await supabase.from("service_items").select("service_id");
  const { data: assignments } = await supabase.from("service_assignments").select("service_id");

  const itemCounts: Record<string, number> = {};
  const assignmentCounts: Record<string, number> = {};
  for (const i of items ?? []) itemCounts[i.service_id] = (itemCounts[i.service_id] ?? 0) + 1;
  for (const a of assignments ?? []) assignmentCounts[a.service_id] = (assignmentCounts[a.service_id] ?? 0) + 1;

  return services.map((s) => ({
    ...s,
    item_count: itemCounts[s.id] ?? 0,
    assignment_count: assignmentCounts[s.id] ?? 0,
  }));
}

export async function getPublicServices(): Promise<Service[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("services")
    .select("id, name, date, start_time, end_time, notes, facebook_live_url, created_at, updated_at")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(`Unable to load service hours: ${error.message}`);
  return (data as Service[]) ?? [];
}

export async function getService(id: string): Promise<Service | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").eq("id", id).single();
  return (data as Service) ?? null;
}

export async function getServiceItems(serviceId: string): Promise<ServiceItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_items")
    .select("*")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: true });
  return (data as ServiceItem[]) ?? [];
}

export async function getServiceAssignments(serviceId: string): Promise<(ServiceAssignment & { member_name: string })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_assignments")
    .select("*")
    .eq("service_id", serviceId)
    .order("created_at", { ascending: false });
  const assignments = (data as ServiceAssignment[]) ?? [];

  const memberIds = assignments.map((a) => a.member_id).filter(Boolean) as string[];
  const memberNames: Record<string, string> = {};
  if (memberIds.length > 0) {
    const { data: members } = await supabase.from("members").select("id, first_name, last_name").in("id", memberIds);
    for (const m of members ?? []) memberNames[m.id] = `${m.first_name} ${m.last_name}`;
  }

  return assignments.map((a) => ({
    ...a,
    member_name: memberNames[a.member_id] ?? null,
  }));
}

export async function getAllMembers(): Promise<Pick<Member, "id" | "first_name" | "last_name">[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("members").select("id, first_name, last_name").order("first_name");
  return data ?? [];
}
