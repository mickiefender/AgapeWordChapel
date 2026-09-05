"use server";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const smsSchema = z.object({
  message: z.string().trim().min(1, "Message is required.").max(500, "Message must be 500 characters or fewer."),
  audience: z.enum(["all", "active", "workers"]),
});

export type SmsActionResult = { error: string } | { success: true; sent: number };

function normalizePhone(phone: string): string {
  const normalized = phone.replace(/\D/g, "").replace(/^00/, "");
  if (normalized.startsWith("0")) return `233${normalized.slice(1)}`;
  if (normalized.startsWith("233")) return normalized;
  return normalized;
}

export async function sendBulkSms(input: {
  message: string;
  audience: "all" | "active" | "workers";
}): Promise<SmsActionResult> {
  const { user } = await requireAdmin();

  const parsed = smsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid SMS details." };

  const apiKey = process.env.ARKESEL_API_KEY;
  const sender = process.env.ARKESEL_SENDER_ID;
  if (!apiKey || !sender) return { error: "Arkesel is not configured. Add ARKESEL_API_KEY and ARKESEL_SENDER_ID to the server environment." };

  const supabase = await createClient();
  let query = supabase.from("members").select("phone").not("phone", "is", null);
  if (parsed.data.audience === "active") query = query.eq("membership_status", "active_member");
  if (parsed.data.audience === "workers") query = query.in("membership_status", ["worker", "leader"]);
  const { data: members, error } = await query;
  if (error) return { error: error.message };

  const phones = [...new Set((members ?? []).map((member) => normalizePhone(member.phone ?? "")).filter((phone) => phone.length >= 9))];
  if (phones.length === 0) return { error: "No members with valid phone numbers match this audience." };

  let response: Response;
  try {
    response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender,
        message: parsed.data.message,
        recipients: phones,
      }),
      cache: "no-store",
    });
  } catch {
    return { error: "Unable to reach Arkesel. Please try again." };
  }

  const responseText = await response.text();
  let providerMessage = responseText;
  try {
    const payload = JSON.parse(responseText) as { message?: string; detail?: string };
    providerMessage = payload.message ?? payload.detail ?? responseText;
  } catch {
    // Arkesel may return plain text for gateway errors.
  }
  const history = {
    message: parsed.data.message,
    audience: parsed.data.audience,
    status: response.ok && !/error|failed|invalid/i.test(providerMessage) ? "sent" : "failed",
    recipient_count: phones.length,
    provider_response: providerMessage.slice(0, 500),
    sent_by: user.id,
  } as const;
  const { error: historyError } = await supabase.from("sms_history").insert(history);
  if (historyError && !historyError.message.includes("sms_history")) {
    return { error: `Message provider responded, but SMS history could not be saved: ${historyError.message}` };
  }
  await logAudit({
    userId: user.id,
    action: "create",
    resource: "sms_campaign",
    metadata: { audience: parsed.data.audience, status: history.status, recipientCount: phones.length },
  });
  if (!response.ok) return { error: `Arkesel rejected the message (${response.status}): ${providerMessage.slice(0, 180)}` };
  if (/error|failed|invalid/i.test(providerMessage)) return { error: `Arkesel could not send the message: ${providerMessage.slice(0, 180)}` };

  return { success: true, sent: phones.length };
}
