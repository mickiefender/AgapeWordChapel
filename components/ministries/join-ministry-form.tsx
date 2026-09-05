"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { UserPlus, X } from "lucide-react";
import { submitJoinRequest, type JoinRequestError } from "@/actions/ministry-join";

type Ministry = { id: string; name: string };

export function JoinMinistryForm({
  ministries,
  defaultMinistryId,
  variant = "default",
  triggerClassName = "",
}: {
  ministries: Ministry[];
  defaultMinistryId: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = (await submitJoinRequest(formData)) as JoinRequestError | void;
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setSuccess(true);
  }

  function resetState() {
    setOpen(false);
    setSuccess(false);
    setError(null);
    setSubmitting(false);
  }

  return (
    <>
      <Button type="button" variant={variant} className={triggerClassName} onClick={() => {
        setOpen(true);
        setSuccess(false);
        setError(null);
      }}>
        <UserPlus className="h-4 w-4" />
        Connect with us
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close join ministry form"
            className="absolute inset-0 cursor-default"
            onClick={resetState}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-ministry-title"
            className="relative z-10 flex max-h-[min(680px,calc(100vh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lift"
          >
            <div className="flex items-start justify-between border-b border-border/70 px-5 py-4">
              <div>
                <h2 id="join-ministry-title" className="text-lg font-semibold tracking-tight">Join a ministry</h2>
                <p className="mt-1 text-sm text-muted-foreground">Tell us which ministry you would like to join.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={resetState}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="px-5 py-6">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <p className="text-sm font-semibold">Your request was submitted successfully.</p>
                  <p className="mt-2 text-sm text-emerald-800">Our team will review your interest and get back to you soon.</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button type="button" onClick={resetState}>Close</Button>
                </div>
              </div>
            ) : (
              <form action={handleSubmit} className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-inset ring-destructive/20">
                    <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="join-name">Full name *</Label>
                    <Input id="join-name" name="name" required placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="join-email">Email *</Label>
                    <Input id="join-email" name="email" type="email" required placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="join-phone">Phone</Label>
                    <Input id="join-phone" name="phone" placeholder="Optional" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="join-department">Ministry *</Label>
                    <Select id="join-department" name="department_id" defaultValue={defaultMinistryId}>
                      {ministries.map((ministry) => (
                        <option key={ministry.id} value={ministry.id}>{ministry.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="join-message">Message (optional)</Label>
                    <Textarea id="join-message" name="message" rows={3} placeholder="Tell us a bit about yourself…" />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-border/70 pt-5">
                  <Button type="button" variant="outline" onClick={resetState}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
