"use client";

import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  images: string[];
  index: number;
  title: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

const ICON_BUTTON =
  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

export function GalleryLightbox({ images, index, title, onClose, onNavigate }: Props) {
  const hasPrevious = index > 0;
  const hasNext = index < images.length - 1;

  const step = useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next >= 0 && next < images.length) onNavigate(next);
    },
    [images.length, index, onNavigate],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, step]);

  const current = images[index];
  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} gallery image ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="Close image viewer"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <p className="truncate text-sm font-medium text-white/80">
          {title} · {index + 1} of {images.length}
        </p>
        <button type="button" aria-label="Close" onClick={onClose} className={ICON_BUTTON}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-16">
        {hasPrevious && (
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => step(-1)}
            className={`absolute left-2 sm:left-4 ${ICON_BUTTON}`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <img
          src={current}
          alt={`${title} gallery image ${index + 1}`}
          className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
        />

        {hasNext && (
          <button
            type="button"
            aria-label="Next image"
            onClick={() => step(1)}
            className={`absolute right-2 sm:right-4 ${ICON_BUTTON}`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
