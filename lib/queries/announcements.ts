import { createClient } from "@/lib/supabase/server";
import type { Announcement } from "@/types";

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("announcements").select("*").order("publish_date", { ascending: false });
  return (data as Announcement[]) ?? [];
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("announcements").select("*").eq("id", id).single();
  return (data as Announcement) ?? null;
}
