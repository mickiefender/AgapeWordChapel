"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createEvent, updateEvent } from "@/actions/events";
import type { ChurchEvent } from "@/types";

export function EventForm({ event }: { event?: ChurchEvent }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(event?.image_url ?? null);
  const isEdit = !!event;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEdit
      ? await updateEvent(event.id, formData)
      : await createEvent(formData);

    if (result?.error) {
      setError(result.error);
    }
  }

  function handleImageChange(file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Event image must be 8MB or smaller.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Event image must be a valid image file.");
      return;
    }
    setError(null);
    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <form action={handleSubmit} className="space-y-7">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Event details</h3>
          <p className="mt-1 text-xs text-muted-foreground">Create a clear event listing for your church community.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Banner image</Label>
          <div className="overflow-hidden rounded-xl border border-dashed border-border bg-muted/20">
            {imagePreview && <img src={imagePreview} alt="Event banner preview" className="h-40 w-full object-cover" />}
            <label htmlFor="image" className="flex cursor-pointer items-center justify-center px-4 py-4 text-sm font-medium text-primary hover:bg-muted/40">
              {imagePreview ? "Choose a different image" : "Choose an image"}
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => handleImageChange(event.target.files?.[0])}
            />
          </div>
          <input type="hidden" name="image_url" value={event?.image_url ?? ""} />
          <p className="text-xs text-muted-foreground">PNG, JPG, or WebP up to 8MB.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={event?.title ?? ""}
            placeholder="e.g. Youth Conference, Christmas Service"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={event?.description ?? ""}
            placeholder="Describe the event…"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_type">Event Type</Label>
          <Input
            id="event_type"
            name="event_type"
            defaultValue={event?.event_type ?? ""}
            placeholder="e.g. Conference, Service, Outreach"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date *</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              required
              defaultValue={event?.start_date ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={event?.end_date ?? ""}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              name="start_time"
              type="time"
              defaultValue={event?.start_time ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              name="end_time"
              type="time"
              defaultValue={event?.end_time ?? ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={event?.location ?? ""}
            placeholder="e.g. Main Sanctuary"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min="0"
              defaultValue={event?.capacity ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration_required">Registration Required</Label>
            <Select
              id="registration_required"
              name="registration_required"
              defaultValue={event ? (event.registration_required ? "true" : "false") : "false"}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-6 sm:flex-row">
        <Button type="submit">{isEdit ? "Save changes" : "Create event"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
