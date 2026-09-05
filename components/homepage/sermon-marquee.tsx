import { Headphones, PlayCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomepageSermon } from "@/lib/queries/homepage";

function SermonCard({ sermon }: { sermon: HomepageSermon }) {
  const watchUrl = sermon.youtube_url || sermon.facebook_url || sermon.video_url || sermon.audio_url;
  const MediaIcon =
    sermon.audio_url && !sermon.video_url && !sermon.youtube_url && !sermon.facebook_url
      ? Headphones
      : sermon.video_url || sermon.youtube_url || sermon.facebook_url
        ? Video
        : PlayCircle;

  return (
    <article className="w-[min(78vw,300px)] shrink-0 overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm">
      <div className="relative aspect-[16/10] bg-muted">
        {sermon.image_url ? (
          <img src={sermon.image_url} alt={sermon.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
            <PlayCircle className="h-10 w-10" />
          </div>
        )}
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
          <MediaIcon className="h-3 w-3" />
          {sermon.audio_url && !sermon.video_url ? "Audio" : "Watch"}
        </span>
      </div>
      <div className="p-4">
        <p className="line-clamp-2 font-semibold">{sermon.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{sermon.speaker || "Agape Word Chapel"}</p>
        {sermon.categories?.[0] && (
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-primary">{sermon.categories[0]}</p>
        )}
        {watchUrl && (
          <Button className="mt-4 w-full" size="sm" asChild>
            <a href={watchUrl} target="_blank" rel="noreferrer">
              Watch sermon
            </a>
          </Button>
        )}
      </div>
    </article>
  );
}

export function SermonMarquee({ sermons }: { sermons: HomepageSermon[] }) {
  return (
    <div className="group relative mt-8 overflow-hidden" aria-label="Latest sermons">
      <div className="sermon-marquee-track flex w-max gap-5 pr-5 group-hover:[animation-play-state:paused]">
        {[...sermons, ...sermons].map((sermon, index) => (
          <SermonCard key={`${sermon.id}-${index}`} sermon={sermon} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card/45 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card/45 to-transparent" />
    </div>
  );
}
