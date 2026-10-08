import { createClient } from "@/lib/supabase/server";

export type SmsAudience = "all" | "active" | "workers" | "individual_member" | "manual_number";

export type SmsHistoryEntry = {
  id: string;
  message: string;
  audience: SmsAudience;
  status: "sent" | "failed";
  recipientCount: number;
  providerResponse: string | null;
  createdAt: string;
};

export async function getSmsHistory(): Promise<SmsHistoryEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sms_history")
    .select("id, message, audience, status, recipient_count, provider_response, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (error.message.includes("sms_history")) {
      throw new Error("SMS history is not enabled in the database. Apply supabase/migrations/0009_sms_history.sql, then reload this page.");
    }
    throw new Error(`Unable to load SMS history: ${error.message}`);
  }

  return (data ?? []).map((entry) => ({
    id: entry.id,
    message: entry.message,
    audience: entry.audience,
    status: entry.status,
    recipientCount: entry.recipient_count,
    providerResponse: entry.provider_response,
    createdAt: entry.created_at,
  }));
}
