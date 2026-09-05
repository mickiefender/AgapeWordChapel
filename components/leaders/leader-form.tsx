"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLeader, updateLeader } from "@/actions/leaders";
import type { Leader } from "@/types";

export function LeaderForm({ leader }: { leader?: Leader }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(leader?.image_url ?? null);
  const isEdit = Boolean(leader);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEdit ? await updateLeader(leader.id, formData) : await createLeader(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name *</Label>
          <Input id="name" name="name" required defaultValue={leader?.name ?? ""} placeholder="e.g. Rev. John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Position *</Label>
          <Input id="position" name="position" required defaultValue={leader?.position ?? ""} placeholder="e.g. Lead Pastor" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={leader?.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={leader?.phone ?? ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="photo">Leader photo</Label>
        <div className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 p-4">
          {photoPreview ? <img src={photoPreview} alt="Leader preview" className="h-20 w-20 rounded-xl object-cover ring-1 ring-border" /> : <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-xs text-primary">No photo</div>}
          <label className="inline-flex cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {photoPreview ? "Change photo" : "Choose photo"}
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setPhotoPreview(URL.createObjectURL(file));
              }}
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPG, or WebP up to 5MB.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Biography</Label>
        <Textarea id="bio" name="bio" rows={5} defaultValue={leader?.bio ?? ""} placeholder="Share a short introduction..." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sort_order">Display order</Label>
          <Input id="sort_order" name="sort_order" type="number" min="0" defaultValue={leader?.sort_order ?? 0} />
        </div>
        <label className="flex items-center gap-3 self-end rounded-lg border border-border/70 px-3 py-2.5 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={leader?.is_active ?? true} className="h-4 w-4 accent-primary" />
          Show on public website
        </label>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-5 sm:flex-row">
        <Button type="submit">{isEdit ? "Save changes" : "Add leader"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
