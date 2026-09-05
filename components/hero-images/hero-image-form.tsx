"use client";

import { useState } from "react";
import { createHeroImage } from "@/actions/hero-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function HeroImageForm() {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createHeroImage(formData);
    if (result?.error) setError(result.error);
    else {
      const form = document.getElementById("hero-image-form") as HTMLFormElement | null;
      form?.reset();
      setPreview(null);
    }
  }

  return (
    <form id="hero-image-form" action={handleSubmit} className="space-y-5">
      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="image">Hero image *</Label>
        <div className="overflow-hidden rounded-xl border border-dashed border-border bg-muted/20">
          {preview && <img src={preview} alt="Hero preview" className="h-44 w-full object-cover" />}
          <label htmlFor="image" className="flex cursor-pointer items-center justify-center px-4 py-4 text-sm font-medium text-primary hover:bg-muted/40">
            {preview ? "Choose a different image" : "Choose an image"}
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            required
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPG, or WebP up to 10MB.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Internal title</Label>
        <Input id="title" name="title" placeholder="e.g. Sunday worship welcome" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration_seconds">Display duration</Label>
          <Select id="duration_seconds" name="duration_seconds" defaultValue="5">
            {[3, 5, 8, 10, 15, 20, 30, 60].map((seconds) => (
              <option key={seconds} value={seconds}>{seconds} seconds</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="is_active">Publish on homepage</Label>
          <Select id="is_active" name="is_active" defaultValue="true">
            <option value="true">Yes, show it</option>
            <option value="false">No, keep it hidden</option>
          </Select>
        </div>
      </div>
      <Button type="submit">Upload hero image</Button>
    </form>
  );
}
