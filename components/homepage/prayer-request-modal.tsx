"use client";

import { useState } from "react";
import { HeartHandshake, X } from "lucide-react";
import { submitPublicPrayerRequest, type PrayerRequestActionError } from "@/actions/prayer-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PrayerRequestModal() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = (await submitPublicPrayerRequest(formData)) as PrayerRequestActionError | void;

    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  function close() {
    setOpen(false);
    setError(null);
    setSubmitted(false);
    setSubmitting(false);
  }

  return (
    <>
      <Button type="button" className="mt-7" onClick={() => setOpen(true)}>
        Submit a prayer request <HeartHandshake className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <button type="button" aria-label="Close prayer request form" className="absolute inset-0" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prayer-request-title"
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lift"
          >
            <div className="flex items-start justify-between border-b border-border/70 px-5 py-4">
              <div>
                <h2 id="prayer-request-title" className="text-lg font-semibold tracking-tight">Submit a prayer request</h2>
                <p className="mt-1 text-sm text-muted-foreground">Our prayer team will receive this request privately.</p>
              </div>
              <button type="button" aria-label="Close" onClick={close} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-5">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <p className="font-semibold">Your prayer request has been received.</p>
                  <p className="mt-2 text-sm text-emerald-800">Thank you for allowing us to stand with you in prayer.</p>
                </div>
                <div className="mt-5 flex justify-end">
                  <Button type="button" onClick={close}>Close</Button>
                </div>
              </div>
            ) : (
              <form action={handleSubmit} className="space-y-5 p-5">
                {error && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="public-prayer-name">Name (optional)</Label>
                  <Input id="public-prayer-name" name="requester_name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="public-prayer-content">How can we pray for you? *</Label>
                  <Textarea id="public-prayer-content" name="content" required rows={6} placeholder="Share your prayer request..." />
                </div>
                <div className="flex justify-end gap-2 border-t border-border/70 pt-5">
                  <Button type="button" variant="outline" onClick={close}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit request"}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
