"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createSermon, updateSermon, type SermonActionError } from "@/actions/sermons";
import type { Sermon } from "@/types";

export function SermonForm({ sermon }: { sermon?: Sermon }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!sermon;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEdit
      ? await updateSermon(sermon.id, formData)
      : await createSermon(formData);

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
          <h3 className="text-sm font-semibold">Sermon details</h3>
          <p className="mt-1 text-xs text-muted-foreground">Add the teaching details and media your church can revisit.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={sermon?.title ?? ""}
            placeholder="e.g. Walking in Faith"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="speaker">Speaker</Label>
          <Input
            id="speaker"
            name="speaker"
            defaultValue={sermon?.speaker ?? ""}
            placeholder="e.g. Pastor John"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={sermon?.description ?? ""}
            placeholder="Describe the sermon…"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scripture_references">Scripture References</Label>
          <Input
            id="scripture_references"
            name="scripture_references"
            defaultValue={(sermon?.scripture_references ?? []).join(", ")}
            placeholder="e.g. John 3:16, Romans 8:28"
          />
          <p className="text-xs text-muted-foreground">Separate multiple references with commas.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categories">Sermon category / type</Label>
          <Input
            id="categories"
            name="categories"
            defaultValue={(sermon?.categories ?? []).join(", ")}
            placeholder="e.g. Faith, Hope, Love"
          />
          <p className="text-xs text-muted-foreground">Separate multiple categories with commas.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={(sermon?.tags ?? []).join(", ")}
            placeholder="e.g. sunday, teaching, series"
          />
          <p className="text-xs text-muted-foreground">Separate multiple tags with commas.</p>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
          <p className="text-sm font-semibold">Sermon media</p>
          <p className="mt-1 text-xs text-muted-foreground">Select an image, audio recording, or video. Files can be up to 100MB.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {([
              ["image", "Picture", "image/png,image/jpeg,image/webp", sermon?.image_url],
              ["audio", "Audio", "audio/*", sermon?.audio_url],
              ["video", "Video", "video/*", sermon?.video_url],
            ] as [string, string, string, string | null | undefined][]).map(([name, label, accept, current]) => (
              <label key={name} className="cursor-pointer rounded-lg border bg-background p-3 text-sm font-medium hover:border-primary">
                <span className="block">{label}</span>
                <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">{current ? "File already attached" : "Choose file"}</span>
                <input name={name} type="file" accept={accept || undefined} className="mt-3 block w-full text-xs" />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audio_url">Audio URL</Label>
          <Input id="audio_url" name="audio_url" defaultValue={sermon?.audio_url ?? ""} placeholder="https://…" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video_url">Video URL</Label>
          <Input id="video_url" name="video_url" defaultValue={sermon?.video_url ?? ""} placeholder="https://…" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube_url">YouTube URL</Label>
          <Input id="youtube_url" name="youtube_url" type="url" defaultValue={sermon?.youtube_url ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebook_url">Facebook post URL</Label>
          <Input id="facebook_url" name="facebook_url" type="url" defaultValue={sermon?.facebook_url ?? ""} placeholder="https://www.facebook.com/.../posts/..." />
          <p className="text-xs text-muted-foreground">Paste a public Facebook post or video URL to link it to this sermon.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pdf_url">PDF URL</Label>
          <Input id="pdf_url" name="pdf_url" defaultValue={sermon?.pdf_url ?? ""} placeholder="https://…" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="published_date">Sermon Date *</Label>
          <Input
            id="published_date"
            name="published_date"
            type="date"
            required
            defaultValue={sermon?.published_date ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Publication status</Label>
          <Select id="status" name="status" defaultValue={sermon?.status ?? "unpublished"}>
            <option value="unpublished">Unpublished</option>
            <option value="published">Published</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-6 sm:flex-row">
        <Button type="submit">{isEdit ? "Save changes" : "Create sermon"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
