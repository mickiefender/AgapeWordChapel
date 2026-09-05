import { createClient } from "@/lib/supabase/server";

export type HomepageService = {
  id: string;
  name: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  facebook_live_url: string | null;
};

export type HomepageSermon = {
  id: string;
  title: string;
  speaker: string | null;
  image_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
  published_date: string | null;
  categories: string[] | null;
};

export type HomepageEvent = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  location: string | null;
  image_url: string | null;
  registration_required: boolean;
};

export type HomepageDepartment = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  meeting_time: string | null;
  meeting_location: string | null;
};

export type HomepageAnnouncement = {
  id: string;
  title: string;
  content: string;
  publish_date: string;
  image_url: string | null;
};

export async function getHomepageContent() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [services, sermons, events, departments, announcements] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, date, start_time, end_time, notes, facebook_live_url")
      .gte("date", today)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(1),
    supabase
      .from("sermons")
      .select("id, title, speaker, image_url, audio_url, video_url, youtube_url, facebook_url, published_date, categories")
      .eq("status", "published")
      .order("published_date", { ascending: false, nullsFirst: false })
      .limit(4),
    supabase
      .from("events")
      .select("id, title, description, start_date, end_date, start_time, location, image_url, registration_required")
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(4),
    supabase
      .from("departments")
      .select("id, name, description, image_url, meeting_time, meeting_location")
      .order("name", { ascending: true })
      .limit(8),
    supabase
      .from("announcements")
      .select("id, title, content, publish_date, image_url")
      .eq("published", true)
      .lte("publish_date", new Date().toISOString())
      .or(`expiry_date.is.null,expiry_date.gte.${new Date().toISOString()}`)
      .order("publish_date", { ascending: false })
      .limit(3),
  ]);

  if (services.error) throw new Error(`Unable to load the next service: ${services.error.message}`);
  if (sermons.error) throw new Error(`Unable to load latest sermons: ${sermons.error.message}`);
  if (events.error) throw new Error(`Unable to load upcoming events: ${events.error.message}`);
  if (departments.error) throw new Error(`Unable to load ministries: ${departments.error.message}`);
  if (announcements.error) throw new Error(`Unable to load announcements: ${announcements.error.message}`);

  return {
    service: (services.data?.[0] as HomepageService | undefined) ?? null,
    sermons: (sermons.data ?? []) as HomepageSermon[],
    events: (events.data ?? []) as HomepageEvent[],
    departments: (departments.data ?? []) as HomepageDepartment[],
    announcements: (announcements.data ?? []) as HomepageAnnouncement[],
  };
}
