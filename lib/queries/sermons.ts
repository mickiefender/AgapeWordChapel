import { createClient } from "@/lib/supabase/server";
import type { Sermon } from "@/types";

export async function getSermons(): Promise<Sermon[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("sermons").select("*").order("published_date", { ascending: false, nullsFirst: false });
  return (data as Sermon[]) ?? [];
}

export async function getPublishedSermons(): Promise<Sermon[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select("*")
    .eq("status", "published")
    .order("published_date", { ascending: false, nullsFirst: false });

  return (data as Sermon[]) ?? [];
}

export async function getSermon(id: string): Promise<Sermon | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("sermons").select("*").eq("id", id).single();
  return (data as Sermon) ?? null;
}
