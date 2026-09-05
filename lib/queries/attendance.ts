import { createClient } from "@/lib/supabase/server";
import type { AttendanceRecord } from "@/types";

export type AttendanceListItem = AttendanceRecord & {
  person_name: string;
  person_avatar_url: string | null;
  context_name: string | null;
};

export type AttendanceSummary = {
  records: AttendanceListItem[];
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
};

export type AttendanceMarkingOptions = {
  members: { id: string; first_name: string; last_name: string; email: string | null; avatar_url: string | null }[];
  services: { id: string; name: string }[];
  cellGroups: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  events: { id: string; name: string }[];
};

export async function getAttendanceMarkingOptions(): Promise<AttendanceMarkingOptions> {
  const supabase = await createClient();
  const [members, services, cellGroups, departments, events] = await Promise.all([
    supabase.from("members").select("id, first_name, last_name, email, avatar_url").order("first_name").order("last_name"),
    supabase.from("services").select("id, name").order("date", { ascending: false }).limit(100),
    supabase.from("cell_groups").select("id, name").order("name"),
    supabase.from("departments").select("id, name").order("name"),
    supabase.from("events").select("id, title").order("start_date", { ascending: false }).limit(100),
  ]);

  return {
    members: members.data ?? [],
    services: services.data ?? [],
    cellGroups: cellGroups.data ?? [],
    departments: departments.data ?? [],
    events: (events.data ?? []).map((event) => ({ id: event.id, name: event.title })),
  };
}

export async function getAttendanceSummary(): Promise<AttendanceSummary> {
  const supabase = await createClient();
  const { data: attendance, error } = await supabase
    .from("attendance")
    .select("*")
    .order("check_in_time", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (attendance as AttendanceRecord[]) ?? [];
  const memberIds = rows.map((row) => row.member_id).filter(Boolean) as string[];
  const visitorIds = rows.map((row) => row.visitor_id).filter(Boolean) as string[];
  const serviceIds = rows.map((row) => row.service_id).filter(Boolean) as string[];
  const cellGroupIds = rows.map((row) => row.cell_group_id).filter(Boolean) as string[];
  const departmentIds = rows.map((row) => row.department_id).filter(Boolean) as string[];
  const eventIds = rows.map((row) => row.event_id).filter(Boolean) as string[];

  const [members, visitors, services, cellGroups, departments, events] = await Promise.all([
    memberIds.length
      ? supabase.from("members").select("id, first_name, last_name, avatar_url").in("id", memberIds)
      : Promise.resolve({ data: [] }),
    visitorIds.length
      ? supabase.from("visitors").select("id, full_name").in("id", visitorIds)
      : Promise.resolve({ data: [] }),
    serviceIds.length
      ? supabase.from("services").select("id, name").in("id", serviceIds)
      : Promise.resolve({ data: [] }),
    cellGroupIds.length
      ? supabase.from("cell_groups").select("id, name").in("id", cellGroupIds)
      : Promise.resolve({ data: [] }),
    departmentIds.length
      ? supabase.from("departments").select("id, name").in("id", departmentIds)
      : Promise.resolve({ data: [] }),
    eventIds.length
      ? supabase.from("events").select("id, title").in("id", eventIds)
      : Promise.resolve({ data: [] }),
  ]);

  const people = new Map<string, string>();
  const avatars = new Map<string, string | null>();
  for (const member of members.data ?? []) {
    people.set(member.id, `${member.first_name} ${member.last_name}`);
    avatars.set(member.id, member.avatar_url ?? null);
  }
  for (const visitor of visitors.data ?? []) {
    people.set(visitor.id, visitor.full_name);
  }

  const contexts = new Map<string, string>();
  for (const service of services.data ?? []) contexts.set(service.id, service.name);
  for (const group of cellGroups.data ?? []) contexts.set(group.id, group.name);
  for (const department of departments.data ?? []) contexts.set(department.id, department.name);
  for (const event of events.data ?? []) contexts.set(event.id, event.title);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  const mondayOffset = (startOfToday.getDay() + 6) % 7;
  startOfWeek.setDate(startOfToday.getDate() - mondayOffset);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const records = rows.map((row) => {
    const personId = row.member_id ?? row.visitor_id;
    const contextId = row.service_id ?? row.cell_group_id ?? row.department_id ?? row.event_id;
    return {
      ...row,
      person_name: personId ? people.get(personId) ?? "Unknown person" : "Guest",
      person_avatar_url: personId ? avatars.get(personId) ?? null : null,
      context_name: contextId ? contexts.get(contextId) ?? null : null,
    };
  });

  return {
    records,
    total: rows.length,
    today: rows.filter((row) => new Date(row.check_in_time) >= startOfToday).length,
    thisWeek: rows.filter((row) => new Date(row.check_in_time) >= startOfWeek).length,
    thisMonth: rows.filter((row) => new Date(row.check_in_time) >= startOfMonth).length,
  };
}
