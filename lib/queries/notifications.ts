import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types";

export async function getNotifications(): Promise<Notification[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return (data as Notification[]) ?? [];
}
