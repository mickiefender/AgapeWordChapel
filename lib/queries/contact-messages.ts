import { createClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/types";

export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Unable to load contact messages: ${error.message}`);
  return (data as ContactMessage[]) ?? [];
}
