"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Send, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendSms, type SmsInput } from "@/actions/sms";
import type { SmsRecipient } from "@/lib/queries/members";

const gsmBasicCharacters = new Set(
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà",
);
const gsmExtensionCharacters = new Set("^{}\\[~]|€\f");

function countSmsSegments(message: string) {
  let gsmLength = 0;
  let isGsm = true;

  for (const character of message) {
    if (gsmBasicCharacters.has(character)) {
      gsmLength += 1;
    } else if (gsmExtensionCharacters.has(character)) {
      gsmLength += 2;
    } else {
      isGsm = false;
      break;
    }
  }

  if (isGsm) {
    return { encoding: "GSM-7", segments: gsmLength <= 160 ? 1 : Math.ceil(gsmLength / 153) };
  }

  const unicodeLength = message.length;
  return { encoding: "Unicode", segments: unicodeLength <= 70 ? 1 : Math.ceil(unicodeLength / 67) };
}

function normalizePhone(phone: string) {
  const normalized = phone.replace(/\D/g, "").replace(/^00/, "");
  return normalized.startsWith("0") ? `233${normalized.slice(1)}` : normalized;
}

export function BulkSmsComposer({
  members,
  initialMemberId,
  initialMessage,
}: {
  members: SmsRecipient[];
  initialMemberId?: string;
  initialMessage?: string;
}) {
  const [message, setMessage] = useState(initialMessage ?? "");
  const [audience, setAudience] = useState<"all" | "active" | "workers">("all");
  const [recipientType, setRecipientType] = useState<"group" | "member" | "manual">(initialMemberId ? "member" : "group");
  const [memberId, setMemberId] = useState(initialMemberId ?? "");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const estimatedRecipients = recipientType === "group"
    ? new Set(members
      .filter((member) => audience === "active"
        ? member.membership_status === "active_member"
        : audience === "workers"
          ? ["worker", "leader"].includes(member.membership_status)
          : true)
      .map((member) => normalizePhone(member.phone))
      .filter((normalized) => normalized.length >= 9)).size
    : recipientType === "member"
      ? Number(Boolean(memberId))
      : Number(Boolean(phone.trim()));
  const smsEstimate = message.trim() ? countSmsSegments(message.trim()) : null;
  const estimatedCredits = smsEstimate ? estimatedRecipients * smsEstimate.segments : 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    setFailed(false);
    const input: SmsInput = recipientType === "group"
      ? { recipientType, message, audience }
      : recipientType === "member"
        ? { recipientType, message, memberId }
        : { recipientType, message, phone };
    const result = await sendSms(input);
    setSending(false);
    if ("error" in result) {
      setFailed(true);
      return setStatus(result.error);
    }
    setStatus(`Message sent to ${result.sent} ${recipientType === "manual" ? "phone number" : `member${result.sent === 1 ? "" : "s"}`}.`);
    setMessage("");
    router.refresh();
  }

  return (
    <section className="mb-7 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      <div className="flex items-start gap-3 border-b border-border/70 bg-gradient-to-r from-primary/10 via-card to-card p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MessageSquareText className="h-5 w-5" /></div>
        <div><h2 className="font-semibold tracking-tight">Send an SMS</h2><p className="mt-1 text-sm text-muted-foreground">Send a group announcement, message an individual member, or enter a phone number.</p></div>
      </div>
      <form onSubmit={submit} className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_16rem]">
          <label className="space-y-1.5 text-sm font-medium">Message
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={500} required rows={3} placeholder="Write a concise announcement..." className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30" />
            <span className="block text-xs font-normal text-muted-foreground">{message.length}/500 characters</span>
          </label>
          <div className="space-y-3">
            <label className="block space-y-1.5 text-sm font-medium">Send to
              <select value={recipientType} onChange={(event) => setRecipientType(event.target.value as typeof recipientType)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30">
                <option value="group">A group of members</option><option value="member">An individual member</option><option value="manual">A manually entered number</option>
              </select>
            </label>
            {recipientType === "group" ? (
              <label className="block space-y-1.5 text-sm font-medium">Recipient group
                <select value={audience} onChange={(event) => setAudience(event.target.value as typeof audience)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30">
                  <option value="all">All members</option><option value="active">Active members</option><option value="workers">Workers & leaders</option>
                </select>
                <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground"><UsersRound className="h-3.5 w-3.5" />Only members with phone numbers</span>
              </label>
            ) : recipientType === "member" ? (
              <label className="block space-y-1.5 text-sm font-medium">Member
                <select value={memberId} onChange={(event) => setMemberId(event.target.value)} required className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30">
                  <option value="">Choose a member</option>
                  {members.map((member) => <option key={member.id} value={member.id}>{member.first_name} {member.last_name} · {member.phone}</option>)}
                </select>
                {members.length === 0 && <span className="block text-xs font-normal text-muted-foreground">No members with phone numbers are available.</span>}
              </label>
            ) : (
              <label className="block space-y-1.5 text-sm font-medium">Phone number
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required maxLength={32} placeholder="e.g. 024 123 4567 or +233 24 123 4567" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30" />
                <span className="block text-xs font-normal text-muted-foreground">Local Ghana numbers are sent with the +233 country code.</span>
              </label>
            )}
          </div>
        </div>
        {smsEstimate && (
          <p className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
            Estimated usage: {estimatedRecipients} recipient{estimatedRecipients === 1 ? "" : "s"} × {smsEstimate.segments} {smsEstimate.encoding} segment{smsEstimate.segments === 1 ? "" : "s"} = about {estimatedCredits} SMS credits. Arkesel charges per segment; carrier encoding may affect the final amount.
            {smsEstimate.encoding === "Unicode" && <span className="mt-1 block">This message contains Unicode punctuation and uses up to 67 characters per segment. Standard quotes and hyphens can reduce the SMS cost.</span>}
          </p>
        )}
        {status && <p className={`rounded-lg border p-3 text-sm ${failed ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-emerald-600/20 bg-emerald-50 text-emerald-700"}`}>{status}</p>}
        <div className="flex justify-end"><Button type="submit" disabled={sending || !message.trim() || (recipientType === "member" && !memberId) || (recipientType === "manual" && !phone.trim())}><Send className="h-4 w-4" />{sending ? "Sending..." : "Send SMS"}</Button></div>
      </form>
    </section>
  );
}
