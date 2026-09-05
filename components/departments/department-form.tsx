"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createDepartment, updateDepartment } from "@/actions/departments";
import { Upload, ImageIcon } from "lucide-react";
import type { Department } from "@/types";

type MemberOption = { id: string; first_name: string; last_name: string };

export function DepartmentForm({ department, members }: { department?: Department; members: MemberOption[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(department?.image_url ?? null);
  const [galleryCount, setGalleryCount] = useState(0);
  const isEdit = !!department;

  const existingGallery = JSON.stringify(department?.gallery ?? []);

  function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  }

  function handleGalleryChange(event: React.ChangeEvent<HTMLInputElement>) {
    setGalleryCount(event.target.files?.length ?? 0);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEdit
      ? await updateDepartment(department.id, formData)
      : await createDepartment(formData);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-7">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Department details</h3>
          <p className="mt-1 text-xs text-muted-foreground">Give this ministry a clear identity and point of contact.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required defaultValue={department?.name ?? ""} placeholder="e.g. Choir, Media, Ushers" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={department?.description ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="leader_id">Leader</Label>
          <Select id="leader_id" name="leader_id" defaultValue={department?.leader_id ?? ""}>
            <option value="">Select leader…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Public page media</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            These photos and video appear on this ministry's public page.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
          <p className="text-sm font-semibold">Cover image</p>
          <p className="mt-1 text-xs text-muted-foreground">A clear cover photo shown at the top of the page.</p>
          <div className="mt-3 flex items-center gap-4">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-16 w-24 rounded-lg object-cover ring-1 ring-border"
              />
            )}
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
              <Upload className="h-4 w-4" />
              {coverPreview ? "Change cover" : "Upload cover"}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleCoverChange}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
          <p className="text-sm font-semibold">Gallery images</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {department?.gallery?.length ?? 0} existing image{(department?.gallery?.length ?? 0) === 1 ? "" : "s"}
            {galleryCount > 0 ? ` · ${galleryCount} new selected` : ""}. New images are added to the page gallery.
          </p>
          <label className="mt-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
            <ImageIcon className="h-4 w-4" />
            Add images
            <input
              type="file"
              name="gallery"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="sr-only"
            />
          </label>
          <input type="hidden" name="existing_gallery" value={existingGallery} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video_url">Featured video URL</Label>
          <Input
            id="video_url"
            name="video_url"
            type="url"
            defaultValue={department?.video_url ?? ""}
            placeholder="YouTube, Facebook, or a direct video link"
          />
          <p className="text-xs text-muted-foreground">Paste a link to a video that should be featured on the page.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Meeting information</h3>
          <p className="mt-1 text-xs text-muted-foreground">When and where this ministry gathers.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="meeting_time">Meeting time</Label>
            <Input
              id="meeting_time"
              name="meeting_time"
              defaultValue={department?.meeting_time ?? ""}
              placeholder="e.g. Sundays after service"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting_location">Meeting location</Label>
            <Input
              id="meeting_location"
              name="meeting_location"
              defaultValue={department?.meeting_location ?? ""}
              placeholder="e.g. Main auditorium"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-6 sm:flex-row">
        <Button type="submit">{isEdit ? "Save changes" : "Create department"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
