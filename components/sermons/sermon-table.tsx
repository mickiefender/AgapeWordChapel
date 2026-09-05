"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, FileAudio, FileVideo, Pencil, Search, SlidersHorizontal } from "lucide-react";
import type { Sermon } from "@/types";

export function SermonTable({ sermons }: { sermons: Sermon[] }) {
  const [query, setQuery] = useState("");
  const [media, setMedia] = useState("all");
  const filtered = useMemo(() => sermons.filter((sermon) => {
    const value = query.toLowerCase().trim();
    const matchesQuery = !value || [sermon.title, sermon.speaker ?? "", ...(sermon.categories ?? []), ...(sermon.tags ?? [])].join(" ").toLowerCase().includes(value);
    const matchesMedia = media === "all" || (media === "video" ? !!sermon.video_url : media === "audio" ? !!sermon.audio_url : !!sermon.image_url);
    return matchesQuery && matchesMedia;
  }), [media, query, sermons]);

  if (!sermons.length) return <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No sermons found" description="Add a sermon to share teachings and resources." />;

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 className="font-semibold">Sermon library</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} of {sermons.length} sermons</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sermons..." aria-label="Search sermons" className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-64" /></label>
          <label className="relative"><SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><select value={media} onChange={(event) => setMedia(event.target.value)} aria-label="Filter sermons by media" className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-40"><option value="all">All media</option><option value="video">Video</option><option value="audio">Audio</option><option value="image">Picture</option></select></label>
        </div>
      </div>
      <div className="divide-y divide-border/70">
        {filtered.length ? filtered.map((sermon) => (
          <div key={sermon.id} className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:px-6">
            <Link href={`/dashboard/sermons/${sermon.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">{sermon.image_url ? <img src={sermon.image_url} alt="" className="h-full w-full object-cover" /> : <BookOpen className="h-5 w-5" />}</div>
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{sermon.title}</p><p className="mt-1 truncate text-xs text-muted-foreground">{sermon.speaker ?? "No speaker"}{sermon.published_date ? ` · ${new Date(sermon.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}</p></div>
            </Link>
            <div className="flex items-center gap-2"><Badge variant="secondary">{sermon.categories?.[0] ?? "Uncategorized"}</Badge>{sermon.audio_url && <FileAudio className="h-4 w-4 text-muted-foreground" aria-label="Audio attached" />}{sermon.video_url && <FileVideo className="h-4 w-4 text-muted-foreground" aria-label="Video attached" />}<Link href={`/dashboard/sermons/${sermon.id}/edit`} aria-label={`Edit ${sermon.title}`} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"><Pencil className="h-4 w-4" /></Link></div>
          </div>
        )) : <p className="p-10 text-center text-sm text-muted-foreground">No sermons match your filters.</p>}
      </div>
    </section>
  );
}
