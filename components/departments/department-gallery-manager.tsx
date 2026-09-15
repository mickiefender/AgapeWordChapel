"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  clearDepartmentCoverImage,
  moveDepartmentGalleryImage,
  removeDepartmentGalleryImage,
  setDepartmentCoverImage,
} from "@/actions/department-gallery";
import { Button } from "@/components/ui/button";
import { DepartmentGalleryItem } from "@/components/departments/department-gallery-item";
import { DepartmentGalleryUploader } from "@/components/departments/department-gallery-uploader";
import { GalleryLightbox } from "@/components/departments/gallery-lightbox";
import { Crown, ImageIcon, Loader2, Pencil, X } from "lucide-react";

type Props = {
  departmentId: string;
  departmentName: string;
  coverImage: string | null;
  gallery: string[];
};

/** Keep in sync with MAX_GALLERY_IMAGES in actions/department-gallery.ts */
const MAX_GALLERY_IMAGES = 30;

const EMPTY_GALLERY: string[] = [];

export function DepartmentGalleryManager({ departmentId, departmentName, coverImage, gallery }: Props) {
  const router = useRouter();
  const images = gallery ?? EMPTY_GALLERY;
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const remainingSlots = Math.max(MAX_GALLERY_IMAGES - images.length, 0);

  async function run(key: string, action: () => Promise<{ error: string } | { success: true }>) {
    if (busyKey) return;
    setBusyKey(key);
    setError(null);

    const result = await action();
    setBusyKey(null);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
        <div>
          <h3 className="font-semibold tracking-tight">Gallery</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {images.length} photo{images.length === 1 ? "" : "s"} on this ministry's public page.
            Hover a photo to reorder, set it as the cover, or remove it.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/departments/${departmentId}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit details
          </Link>
        </Button>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-start gap-4 rounded-xl border border-border/70 bg-muted/20 p-4">
          <div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            {coverImage ? (
              <img src={coverImage} alt={`${departmentName} cover`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-[200px] flex-1">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <Crown className="h-4 w-4 text-primary" />
              Cover image
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {coverImage
                ? "Shown at the top of the public ministry page."
                : "No cover image set yet. Use the star on any gallery photo to promote it."}
            </p>
            {coverImage && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                disabled={busyKey !== null}
                onClick={() => run("cover:remove", () => clearDepartmentCoverImage(departmentId))}
              >
                {busyKey === "cover:remove" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Remove cover
              </Button>
            )}
          </div>
        </div>

        <DepartmentGalleryUploader departmentId={departmentId} remainingSlots={remainingSlots} />

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
              <ImageIcon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold">No gallery photos yet</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Photos you add here appear in the gallery on the public ministry page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((imageUrl, index) => (
              <DepartmentGalleryItem
                key={`${imageUrl}-${index}`}
                imageUrl={imageUrl}
                index={index}
                total={images.length}
                busy={busyKey !== null}
                disabled={busyKey !== null}
                onPreview={() => setLightboxIndex(index)}
                onSetCover={() =>
                  run(`cover:${imageUrl}`, () => setDepartmentCoverImage(departmentId, imageUrl))
                }
                onMove={(direction) =>
                  run(`move:${imageUrl}`, () =>
                    moveDepartmentGalleryImage(departmentId, imageUrl, direction),
                  )
                }
                onRemove={() =>
                  run(`remove:${imageUrl}`, () => removeDepartmentGalleryImage(departmentId, imageUrl))
                }
              />
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && images[lightboxIndex] && (
        <GalleryLightbox
          images={images}
          index={lightboxIndex}
          title={departmentName}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
