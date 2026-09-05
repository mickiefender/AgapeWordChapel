"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createService, updateService } from "@/actions/services";
import type { Service } from "@/types";

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!service;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEdit
      ? await updateService(service.id, formData)
      : await createService(formData);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-7">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Service details</h3>
          <p className="mt-1 text-xs text-muted-foreground">Set the gathering schedule and add helpful notes.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Service Name *</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={service?.name ?? ""}
            placeholder="e.g. Sunday Service, Midweek Service"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={service?.date ?? ""}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              name="start_time"
              type="time"
              defaultValue={service?.start_time ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              name="end_time"
              type="time"
              defaultValue={service?.end_time ?? ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={service?.notes ?? ""}
            placeholder="Add any notes about this service…"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebook_live_url">Facebook live URL</Label>
          <Input
            id="facebook_live_url"
            name="facebook_live_url"
            type="url"
            defaultValue={service?.facebook_live_url ?? ""}
            placeholder="https://www.facebook.com/..."
          />
          <p className="text-xs text-muted-foreground">
            This link appears as “Watch live” while the service is in progress.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-6 sm:flex-row">
        <Button type="submit">{isEdit ? "Save changes" : "Create service"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
