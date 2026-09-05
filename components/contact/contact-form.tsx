"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { submitContactMessage, type ContactMessageActionError } from "@/actions/contact-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await submitContactMessage(new FormData(event.currentTarget)) as ContactMessageActionError | void;
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      {submitted ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">Your email is ready</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Thank you for reaching out. Your message has been sent to our church team and will be reviewed by an administrator.</p>
          <Button type="button" variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
            Send another message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Send a message</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">How can we help?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Complete the form and your message will be sent securely to our church team.</p>
          </div>
          {error && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Your name *</Label>
              <Input id="contact-name" name="name" required placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email address *</Label>
              <Input id="contact-email" name="email" type="email" required placeholder="you@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-subject">Subject *</Label>
            <Input id="contact-subject" name="subject" required placeholder="How can we serve you?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Message *</Label>
            <Textarea id="contact-message" name="message" required rows={7} placeholder="Write your message here..." />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            {submitting ? "Sending..." : "Send message"} <ArrowUpRight className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
