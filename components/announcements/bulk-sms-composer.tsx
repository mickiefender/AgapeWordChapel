"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Send, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendBulkSms } from "@/actions/sms";

export function BulkSmsComposer() {
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"all" | "active" | "workers">("all");
  const [status, setStatus] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    setFailed(false);
    const result = await sendBulkSms({ message, audience });
    setSending(false);
    if ("error" in result) {
      setFailed(true);
      return setStatus(result.error);
    }
    setStatus(`Message sent to ${result.sent} member${result.sent === 1 ? "" : "s"}.`);
    setMessage("");
    router.refresh();
  }

  return (
    <section className="mb-7 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      <div className="flex items-start gap-3 border-b border-border/70 bg-gradient-to-r from-primary/10 via-card to-card p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MessageSquareText className="h-5 w-5" /></div>
        <div><h2 className="font-semibold tracking-tight">Send an SMS announcement</h2><p className="mt-1 text-sm text-muted-foreground">Reach members directly through Arkesel.</p></div>
      </div>
      <form onSubmit={submit} className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <label className="space-y-1.5 text-sm font-medium">Message
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={500} required rows={3} placeholder="Write a concise announcement..." className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30" />
            <span className="block text-xs font-normal text-muted-foreground">{message.length}/500 characters</span>
          </label>
          <label className="space-y-1.5 text-sm font-medium">Recipients
            <select value={audience} onChange={(event) => setAudience(event.target.value as typeof audience)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30">
              <option value="all">All members</option><option value="active">Active members</option><option value="workers">Workers & leaders</option>
            </select>
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground"><UsersRound className="h-3.5 w-3.5" />Only members with phone numbers</span>
          </label>
        </div>
        {status && <p className={`rounded-lg border p-3 text-sm ${failed ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-emerald-600/20 bg-emerald-50 text-emerald-700"}`}>{status}</p>}
        <div className="flex justify-end"><Button type="submit" disabled={sending || !message.trim()}><Send className="h-4 w-4" />{sending ? "Sending..." : "Send SMS"}</Button></div>
      </form>
    </section>
  );
}
