import { createClient } from "@/lib/supabase/server";
import type { Leader } from "@/types";

export async function getLeaders(includeInactive = false): Promise<Leader[]> {
  const supabase = await createClient();
  let query = supabase.from("leaders").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true });

  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw new Error(`Unable to load leaders: ${error.message}`);
  return (data ?? []) as Leader[];
}

export async function getLeader(id: string): Promise<Leader | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leaders").select("*").eq("id", id).single();
  if (error && error.code !== "PGRST116") throw new Error(`Unable to load leader: ${error.message}`);
  return (data as Leader | null) ?? null;
}
