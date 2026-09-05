"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";

export function FacebookSermonEmbed({
  url,
  title,
  speaker,
  description,
  imageUrl,
}: {
  url: string;
  title: string;
  speaker: string | null;
  description: string | null;
  imageUrl: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const embedUrl = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">Facebook sermon</p>
      {!failed ? (
        <iframe
          title={`${title} on Facebook`}
          src={embedUrl}
          className="h-[560px] w-full rounded-xl border bg-muted/20"
          scrolling="no"
          allow="encrypted-media"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-muted/20">
          {imageUrl ? <img src={imageUrl} alt="" className="h-48 w-full object-cover" /> : <div className="flex h-32 items-center justify-center bg-primary/10 text-primary"><Play className="h-8 w-8" /></div>}
          <div className="p-5">
            <p className="font-semibold">{title}</p>
            {speaker && <p className="mt-1 text-sm text-muted-foreground">{speaker}</p>}
            {description && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#1877f2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#166fe5]">
        <ExternalLink className="h-4 w-4" /> Watch on Facebook
      </a>
    </div>
  );
}
