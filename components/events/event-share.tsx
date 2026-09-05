"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-7.4 8.5L23.2 22h-6.8l-5.3-6.9L4.9 22H1.8l7.9-9.1L.5 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.9L6.9 3.9H4.9L17.7 20Z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.44 15.05L2 22l5.1-1.55A9.94 9.94 0 1 0 12.04 2Zm5.8 14.14c-.24.68-1.4 1.32-1.93 1.36-.52.05-1.17.24-3.95-.82-3.35-1.34-5.48-4.77-5.65-5-.16-.22-1.35-1.8-1.35-3.43 0-1.63.86-2.43 1.16-2.76.3-.33.66-.41.88-.41h.63c.2 0 .47-.08.74.56.27.66.92 2.27 1 2.44.08.16.13.36.02.58-.1.22-.16.36-.32.55-.16.2-.34.44-.48.58-.16.16-.33.34-.14.66.19.33.85 1.4 1.83 2.27 1.26 1.12 2.32 1.47 2.65 1.63.33.16.52.14.71-.08.19-.22.82-.95 1.04-1.28.22-.33.44-.27.74-.16.3.11 1.9.9 2.23 1.06.33.16.55.25.63.38.08.14.08.8-.16 1.48Z" />
    </svg>
  );
}

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function TelegramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.94 4.04a1.5 1.5 0 0 0-1.55-.22L2.8 11.53c-.72.3-.66 1.33.09 1.55l4.6 1.4 1.75 5.4c.2.61.95.82 1.45.41l2.44-2 4.53 3.31c.55.4 1.33.09 1.48-.58l3.48-14.05c.09-.37-.02-.75-.28-1.03Zm-14.5 8.05 10.07-6.22c.19-.12.4.13.25.29l-7.6 7.9c-.3.31-.47.72-.5 1.15l-.21 2.4-1.9-5.42c-.12-.34-.02-.72.26-.94Z" />
    </svg>
  );
}

export function EventShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(`${title} ${url}`);

  const platforms = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FacebookIcon,
      className: "bg-[#1877f2] text-white",
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: XIcon,
      className: "bg-[#14171a] text-white",
    },
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${shareText}`,
      icon: WhatsAppIcon,
      className: "bg-[#25d366] text-white",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: LinkedInIcon,
      className: "bg-[#0a66c2] text-white",
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: TelegramIcon,
      className: "bg-[#229ed9] text-white",
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed — fall back to copy
        copyLink();
      }
    } else {
      copyLink();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Share this event</h3>
        <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-primary" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Share on ${platform.name}`}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-90 hover:scale-105 ${platform.className}`}
          >
            <platform.icon className="h-4 w-4" />
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy link"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={nativeShare}
          aria-label="Share"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
      {copied && <p className="text-xs font-medium text-emerald-600">Link copied to clipboard</p>}
    </div>
  );
}
