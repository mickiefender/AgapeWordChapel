import { createClient } from "@/lib/supabase/server";
import type { CellGroup, Member } from "@/types";

export type CellGroupWithDetails = CellGroup & {
  leader_name: string | null;
  assistant_name: string | null;
  member_count: number;
};

export async function getCellGroups(): Promise<CellGroupWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("cell_groups").select("*").order("name", { ascending: true });
  const groups = (data as CellGroup[]) ?? [];

  const leaderIds = groups.flatMap((g) => [g.leader_id, g.assistant_leader_id]).filter(Boolean) as string[];
  const memberNames: Record<string, string> = {};
  if (leaderIds.length > 0) {
    const { data: members } = await supabase.from("members").select("id, first_name, last_name").in("id", leaderIds);
    for (const m of members ?? []) memberNames[m.id] = `${m.first_name} ${m.last_name}`;
  }

  const { data: groupMembers } = await supabase.from("cell_group_members").select("cell_group_id");
  const memberCounts: Record<string, number> = {};
  for (const gm of groupMembers ?? []) {
    memberCounts[gm.cell_group_id] = (memberCounts[gm.cell_group_id] ?? 0) + 1;
  }

  return groups.map((g) => ({
    ...g,
    leader_name: g.leader_id ? memberNames[g.leader_id] ?? null : null,
    assistant_name: g.assistant_leader_id ? memberNames[g.assistant_leader_id] ?? null : null,
    member_count: memberCounts[g.id] ?? 0,
  }));
}

export async function getCellGroup(id: string): Promise<CellGroup | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("cell_groups").select("*").eq("id", id).single();
  return (data as CellGroup) ?? null;
}

export async function getCellGroupMembers(groupId: string): Promise<(Member & { role: string | null; joined_at: string })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cell_group_members")
    .select("*, member:members(*)")
    .eq("cell_group_id", groupId)
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
