import { createClient } from "@/lib/supabase/server";
import type { PrayerRequest } from "@/types";

export async function getPrayerRequests(): Promise<PrayerRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("prayer_requests").select("*").order("created_at", { ascending: false });
  return (data as PrayerRequest[]) ?? [];
}

export async function getPrayerRequest(id: string): Promise<PrayerRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("prayer_requests").select("*").eq("id", id).single();
  return (data as PrayerRequest) ?? null;
}
