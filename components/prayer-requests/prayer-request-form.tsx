"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createPrayerRequest, updatePrayerRequest, type PrayerRequestActionError } from "@/actions/prayer-requests";
import { PRAYER_STATUS_LABELS, type PrayerRequest } from "@/types";

export function PrayerRequestForm({ prayerRequest }: { prayerRequest?: PrayerRequest }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!prayerRequest;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEdit
      ? await updatePrayerRequest(prayerRequest.id, formData)
      : await createPrayerRequest(formData);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-7">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Prayer request details</h3>
          <p className="mt-1 text-xs text-muted-foreground">Capture the request clearly so it can be cared for thoughtfully.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="requester_name">Requester Name</Label>
          <Input
            id="requester_name"
            name="requester_name"
            defaultValue={prayerRequest?.requester_name ?? ""}
            placeholder="e.g. Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Prayer Request *</Label>
          <Textarea
            id="content"
            name="content"
            required
            defaultValue={prayerRequest?.content ?? ""}
            placeholder="What would you like us to pray for?"
            rows={5}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="privacy">Privacy</Label>
            <Select id="privacy" name="privacy" defaultValue={prayerRequest?.privacy ?? "public"}>
              <option value="private">Private</option>
              <option value="pastor_only">Pastor Only</option>
              <option value="prayer_team">Prayer Team</option>
              <option value="public">Public</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={prayerRequest?.status ?? "new"}>
              {Object.entries(PRAYER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-6 sm:flex-row">
        <Button type="submit">{isEdit ? "Save changes" : "Create prayer request"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
