"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroImage } from "@/lib/queries/hero-images";

export function HeroCarousel({ images }: { images: HeroImage[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const duration = Math.max(1, images[index]?.duration_seconds ?? 5) * 1000;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % images.length), duration);
    return () => window.clearTimeout(timer);
  }, [images, index]);

  if (images.length === 0) return null;
  const current = images[index] ?? images[0];
  const showControls = images.length > 1;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
      {images.map((image, imageIndex) => (
        <img
          key={image.id}
          src={image.image_url}
          alt={image.title ?? "Agape Word Chapel"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${imageIndex === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/20" />
      {showControls && (
        <>
          <button
            type="button"
            aria-label="Previous hero image"
            onClick={() => setIndex((currentIndex) => (currentIndex - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next hero image"
            onClick={() => setIndex((currentIndex) => (currentIndex + 1) % images.length)}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      <span className="sr-only">Showing {current.title ?? `hero image ${index + 1}`}.</span>
    </div>
  );
}
