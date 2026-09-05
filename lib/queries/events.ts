import { createClient } from "@/lib/supabase/server";
import type { ChurchEvent } from "@/types";

export async function getEvents(): Promise<ChurchEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").order("start_date", { ascending: false });
  return (data as ChurchEvent[]) ?? [];
}

export async function getEvent(id: string): Promise<ChurchEvent | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).single();
  return (data as ChurchEvent) ?? null;
}

export async function getPublicEvents(): Promise<ChurchEvent[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("events")
    .select("*")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(24);
  return (data as ChurchEvent[]) ?? [];
}

export async function getPublicEvent(id: string): Promise<ChurchEvent | null> {
  return getEvent(id);
}
