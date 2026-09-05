import { createClient } from "@/lib/supabase/server";

export type DutyRosterRow = {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string | null;
  memberId: string;
  memberName: string;
  role: string;
  notes: string | null;
};

export async function getDutyRoster(): Promise<DutyRosterRow[]> {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name, date, start_time")
    .order("date", { ascending: true });
  const serviceList = services ?? [];
  if (serviceList.length === 0) return [];

  const serviceIds = serviceList.map((service) => service.id);
  const { data: assignments } = await supabase
    .from("service_assignments")
    .select("id, service_id, member_id, role, notes")
    .in("service_id", serviceIds);
  const assignmentList = assignments ?? [];
  if (assignmentList.length === 0) return [];

  const memberIds = [...new Set(assignmentList.map((assignment) => assignment.member_id))];
  const { data: members } = await supabase
    .from("members")
    .select("id, first_name, last_name")
    .in("id", memberIds);

  const serviceMap = new Map(serviceList.map((service) => [service.id, service]));
  const memberMap = new Map(
    (members ?? []).map((member) => [member.id, `${member.first_name} ${member.last_name}`]),
  );

  return assignmentList
    .map((assignment) => {
      const service = serviceMap.get(assignment.service_id);
      const memberName = memberMap.get(assignment.member_id);
      if (!service || !memberName) return null;
      return {
        id: assignment.id,
        serviceId: service.id,
        serviceName: service.name,
        date: service.date,
        startTime: service.start_time,
        memberId: assignment.member_id,
        memberName,
        role: assignment.role,
        notes: assignment.notes,
      };
    })
    .filter((row): row is DutyRosterRow => row !== null);
}
