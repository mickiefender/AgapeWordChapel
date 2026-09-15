"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Loader2, Star, Trash2 } from "lucide-react";

type Props = {
  imageUrl: string;
  index: number;
  total: number;
  busy: boolean;
  disabled: boolean;
  onPreview: () => void;
  onSetCover: () => void;
  onMove: (direction: "earlier" | "later") => void;
  onRemove: () => void;
};

const ACTION_BUTTON =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-800 shadow-sm transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40";

export function DepartmentGalleryItem({
  imageUrl,
  index,
  total,
  busy,
  disabled,
  onPreview,
  onSetCover,
  onMove,
  onRemove,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border/80 bg-muted/30">
      <img
        src={imageUrl}
        alt={`Gallery image ${index + 1}`}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      )}

      {!busy && !confirming && (
        <>
          <button
            type="button"
            onClick={onPreview}
            aria-label={`Preview gallery image ${index + 1}`}
            className="absolute inset-0 cursor-zoom-in"
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <span className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-950/70 px-2 text-[11px] font-medium text-white">
              <Expand className="h-3.5 w-3.5" />
              View
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-slate-950/65 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <div className="pointer-events-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => onMove("earlier")}
                disabled={disabled || isFirst}
                aria-label="Move image earlier"
                title="Move earlier"
                className={ACTION_BUTTON}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onMove("later")}
                disabled={disabled || isLast}
                aria-label="Move image later"
                title="Move later"
                className={ACTION_BUTTON}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="pointer-events-auto flex items-center gap-1">
              <button
                type="button"
                onClick={onSetCover}
                disabled={disabled}
                aria-label="Use as cover image"
                title="Use as cover"
                className={ACTION_BUTTON}
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={disabled}
                aria-label="Remove this image"
                title="Remove image"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-white shadow-sm transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {confirming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 p-3 text-center">
          <p className="text-xs font-medium text-white">Remove this photo permanently?</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                onRemove();
              }}
              className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-destructive/90"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
