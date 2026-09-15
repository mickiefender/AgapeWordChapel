"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addDepartmentGalleryImages } from "@/actions/department-gallery";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";

type Props = {
  departmentId: string;
  remainingSlots: number;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function DepartmentGalleryUploader({ departmentId, remainingSlots }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  const full = remainingSlots <= 0;

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    setError(null);

    const accepted: File[] = [];
    for (const file of Array.from(incoming)) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`${file.name} is larger than 10MB.`);
        continue;
      }
      accepted.push(file);
    }

    setFiles((current) => {
      const merged = [...current];
      for (const file of accepted) {
        const duplicate = merged.some(
          (existing) => existing.name === file.name && existing.size === file.size,
        );
        if (!duplicate) merged.push(file);
      }
      return merged.slice(0, Math.max(remainingSlots, 0));
    });
  }

  function removeFile(file: File) {
    setFiles((current) => current.filter((entry) => entry !== file));
  }

  function reset() {
    setFiles([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("gallery", file));

    const result = await addDepartmentGalleryImages(departmentId, formData);
    setUploading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    reset();
    router.refresh();
  }

  if (full) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground">
        This gallery is full. Remove a photo to free up space.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`rounded-xl border border-dashed p-4 transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border bg-muted/20"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Add photos to the gallery</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag images here or browse. PNG, JPG or WebP up to 10MB · {remainingSlots} slot
              {remainingSlots === 1 ? "" : "s"} left.
            </p>
          </div>
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
            <ImagePlus className="h-4 w-4" />
            Choose images
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => addFiles(event.target.files)}
            />
          </label>
        </div>

        {previews.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              {previews.map((preview) => (
                <div
                  key={`${preview.file.name}-${preview.file.size}`}
                  className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border"
                >
                  <img src={preview.url} alt={preview.file.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(preview.file)}
                    aria-label={`Remove ${preview.file.name} from the upload queue`}
                    className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/70 text-white transition-colors hover:bg-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" onClick={handleUpload} disabled={uploading}>
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {uploading
                  ? "Uploading..."
                  : `Upload ${previews.length} image${previews.length === 1 ? "" : "s"}`}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={reset} disabled={uploading}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
