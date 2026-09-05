import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: "Member" | "Visitor" | "Event" | "Sermon" | "Announcement" | "Department";
  href: string;
};

export async function searchDashboard(query: string): Promise<SearchResult[]> {
  const value = query.trim().replace(/[(),]/g, " ");
  if (value.length < 2) return [];

  const supabase = await createClient();
  const pattern = `%${value}%`;
  const [members, visitors, events, sermons, announcements, departments] = await Promise.all([
    supabase.from("members").select("id, first_name, last_name, email, phone, membership_status").or(`first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`).limit(12),
    supabase.from("visitors").select("id, full_name, phone, status").or(`full_name.ilike.${pattern},phone.ilike.${pattern}`).limit(8),
    supabase.from("events").select("id, title, location, start_date").or(`title.ilike.${pattern},location.ilike.${pattern}`).limit(8),
    supabase.from("sermons").select("id, title, speaker, description").or(`title.ilike.${pattern},speaker.ilike.${pattern},description.ilike.${pattern}`).limit(8),
    supabase.from("announcements").select("id, title, content").or(`title.ilike.${pattern},content.ilike.${pattern}`).limit(8),
    supabase.from("departments").select("id, name, description").or(`name.ilike.${pattern},description.ilike.${pattern}`).limit(8),
  ]);

  const errors = [members, visitors, events, sermons, announcements, departments].filter((result) => result.error);
  if (errors.length > 0) throw new Error(`Search failed: ${errors[0].error?.message}`);

  return [
    ...(members.data ?? []).map((item) => ({ id: item.id, title: `${item.first_name} ${item.last_name}`, subtitle: item.email || item.phone || item.membership_status, type: "Member" as const, href: `/dashboard/members/${item.id}` })),
    ...(visitors.data ?? []).map((item) => ({ id: item.id, title: item.full_name, subtitle: item.phone || item.status, type: "Visitor" as const, href: `/dashboard/visitors/${item.id}` })),
    ...(events.data ?? []).map((item) => ({ id: item.id, title: item.title, subtitle: item.location || item.start_date, type: "Event" as const, href: `/dashboard/events/${item.id}` })),
    ...(sermons.data ?? []).map((item) => ({ id: item.id, title: item.title, subtitle: item.speaker || "Sermon", type: "Sermon" as const, href: `/dashboard/sermons/${item.id}` })),
    ...(announcements.data ?? []).map((item) => ({ id: item.id, title: item.title, subtitle: item.content.slice(0, 90), type: "Announcement" as const, href: `/dashboard/announcements/${item.id}` })),
    ...(departments.data ?? []).map((item) => ({ id: item.id, title: item.name, subtitle: item.description || "Department", type: "Department" as const, href: `/dashboard/departments/${item.id}` })),
  ];
}
