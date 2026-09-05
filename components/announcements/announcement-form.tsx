"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createAnnouncement, updateAnnouncement, type AnnouncementActionError } from "@/actions/announcements";
import type { Announcement } from "@/types";

export function AnnouncementForm({ announcement }: { announcement?: Announcement }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!announcement;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEdit
      ? await updateAnnouncement(announcement.id, formData)
      : await createAnnouncement(formData);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Announcement Details</h3>
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={announcement?.title ?? ""}
            placeholder="e.g. New Members Class"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            name="content"
            required
            defaultValue={announcement?.content ?? ""}
            placeholder="Write the announcement…"
            rows={5}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="audience">Audience</Label>
            <Select id="audience" name="audience" defaultValue={announcement?.audience ?? "everyone"}>
              <option value="everyone">Everyone</option>
              <option value="workers">Workers</option>
              <option value="youth">Youth</option>
              <option value="department">Department</option>
              <option value="cell_group">Cell Group</option>
              <option value="specific">Specific</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="published">Published</Label>
            <Select id="published" name="published" defaultValue={announcement ? (announcement.published ? "true" : "false") : "true"}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" name="image_url" defaultValue={announcement?.image_url ?? ""} placeholder="https://…" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video_url">Video URL</Label>
          <Input id="video_url" name="video_url" defaultValue={announcement?.video_url ?? ""} placeholder="https://…" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document_url">Document URL</Label>
          <Input id="document_url" name="document_url" defaultValue={announcement?.document_url ?? ""} placeholder="https://…" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="publish_date">Publish Date</Label>
            <Input id="publish_date" name="publish_date" type="datetime-local" defaultValue={announcement?.publish_date ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input id="expiry_date" name="expiry_date" type="datetime-local" defaultValue={announcement?.expiry_date ?? ""} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">{isEdit ? "Save changes" : "Create announcement"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
