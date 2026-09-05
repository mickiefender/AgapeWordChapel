import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Headphones,
  Sparkles,
  Video,
  Search,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { getPublishedSermons } from "@/lib/queries/sermons";
import type { Sermon } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sermons",
  description:
    "Watch and listen to powerful sermons and teachings from Agape Word Chapel International. Revisit messages that help you grow in faith.",
  alternates: {
    canonical: "/sermons",
  },
  openGraph: {
    title: "Sermons | Agape Word Chapel International",
    description:
      "Watch and listen to powerful sermons and teachings from Agape Word Chapel International.",
    url: "/sermons",
  },
};

const CATEGORY_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
];

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function TwitterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-7.4 8.5L23.2 22h-6.8l-5.3-6.9L4.9 22H1.8l7.9-9.1L.5 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.9L6.9 3.9H4.9L17.7 20Z" />
    </svg>
  );
}

function YoutubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23 7.2s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.1-1C16.7 3.6 12 3.6 12 3.6s-4.7 0-7.9.3c-.4.1-1.3.1-2.1 1-.7.7-.9 2.3-.9 2.3S.9 9.1.9 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.8.9 1.9.8 2.4 1 1.7.2 7.6.3 7.6.3s4.7 0 7.9-.4c.4-.1 1.3-.1 2.1-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8ZM9.7 15.1V8.2l6.2 3.5-6.2 3.4Z" />
    </svg>
  );
}

function watchUrl(sermon: Sermon): string | null {
  return sermon.youtube_url || sermon.facebook_url || sermon.video_url || sermon.audio_url || null;
}

function hasVideo(sermon: Sermon): boolean {
  return !!(sermon.youtube_url || sermon.facebook_url || sermon.video_url);
}

function formatDate(date: string | null): string {
  if (!date) return "Latest message";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function categoryLabel(sermon: Sermon, fallback = "Sermon") {
  return sermon.categories?.[0] ?? fallback;
}

function categoryColor(index: number) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

function getInitials(name: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "A";
}

function SermonThumb({ sermon, className = "" }: { sermon: Sermon; className?: string }) {
  if (sermon.image_url) {
    return (
      <img
        src={sermon.image_url}
        alt={sermon.title}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-amber-100 text-primary ${className}`}>
      <Sparkles className="h-10 w-10" />
    </div>
  );
}

function MediaBadge({ sermon }: { sermon: Sermon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
      {hasVideo(sermon) ? <Video className="h-3 w-3" /> : <Headphones className="h-3 w-3" />}
      {hasVideo(sermon) ? "Watch" : "Audio"}
    </span>
  );
}

function Header() {
  return (
    <header className="border-b border-border/70 bg-white">
      <div className="mx-auto flex min-h-[74px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="shrink-0 leading-none">
          <span className="flex items-center gap-2.5">
            <Image
              src="/Agape%20logo.png"
              alt="Agape Word Chapel logo"
              width={72}
              height={72}
              className="h-16 w-16 object-contain sm:h-[4.5rem] sm:w-[4.5rem]"
              priority
            />
            <span className="leading-none">
              <span className="block font-serif text-2xl italic tracking-tight text-primary sm:text-3xl">Agape</span>
              <span className="ml-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">Word Chapel</span>
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/80 lg:flex">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <Link href="/sermons" className="transition-colors hover:text-primary">Sermons</Link>
          <Link href="/ministries" className="transition-colors hover:text-primary">Ministries</Link>
          <Link href="/events" className="transition-colors hover:text-primary">Events</Link>
          <Link href="/about" className="transition-colors hover:text-primary">About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#search"
            aria-label="Search sermons"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Search className="h-4 w-4" />
          </a>
          <Button className="rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-wide shadow-sm hover:bg-primary/90" asChild>
            <Link href="/login">Watch Live</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function TrendingBar({ sermons }: { sermons: Sermon[] }) {
  const latest = sermons[0];
  return (
    <div className="border-b border-border/70 bg-card/60">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-2.5 text-xs sm:px-8">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-semibold uppercase tracking-wide text-primary-foreground">
          <Sparkles className="h-3 w-3" />
          Trending
        </span>
        {latest && (
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            <span className="font-medium text-foreground">Latest:</span> {latest.title}
          </span>
        )}
        <span className="hidden shrink-0 font-semibold uppercase tracking-wide text-muted-foreground sm:inline">
          {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date())}
        </span>
      </div>
    </div>
  );
}

function CategoryRow({ sermons }: { sermons: Sermon[] }) {
  const categories = new Map<string, Sermon>();
  for (const sermon of sermons) {
    const key = categoryLabel(sermon);
    if (!categories.has(key)) categories.set(key, sermon);
  }
  const items = Array.from(categories.entries()).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-5 border-b border-border/70 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([category, sermon], index) => (
        <Link
          key={category}
          href={watchUrl(sermon) ?? "#"}
          target={watchUrl(sermon) ? "_blank" : undefined}
          rel={watchUrl(sermon) ? "noreferrer" : undefined}
          className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
            <SermonThumb sermon={sermon} />
          </div>
          <div className="min-w-0">
            <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] ${categoryColor(index)}`}>
              {category}
            </span>
            <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
              {sermon.title}
            </h3>
            <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(sermon.published_date)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function FeaturedHero({ sermons }: { sermons: Sermon[] }) {
  const featured = sermons[0];
  const side = sermons.slice(1, 4);

  if (!featured) return null;

  const url = watchUrl(featured);

  return (
    <section className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
      <article className="group relative overflow-hidden rounded-3xl border border-border/80 shadow-lift">
        <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
          <SermonThumb sermon={featured} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
          <MediaBadge sermon={featured} />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="mb-3 flex flex-wrap gap-2">
              {(featured.categories ?? []).slice(0, 2).map((category, i) => (
                <span
                  key={category}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${categoryColor(i)}`}
                >
                  {category}
                </span>
              ))}
              {(!featured.categories || featured.categories.length === 0) && (
                <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${categoryColor(0)}`}>
                  {categoryLabel(featured)}
                </span>
              )}
            </div>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-4xl">
              {featured.title}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Link href={url ?? "#"} target={url ? "_blank" : undefined} rel={url ? "noreferrer" : undefined}>
                  {hasVideo(featured) ? <Video className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                  {hasVideo(featured) ? "Watch sermon" : "Listen now"}
                </Link>
              </Button>
              <span className="text-sm font-medium text-white/80">
                {featured.speaker || "Agape Word Chapel"}
              </span>
            </div>
          </div>
        </div>
      </article>

      <aside className="space-y-4">
        {side.map((sermon) => {
          const url = watchUrl(sermon);
          return (
            <Link
              key={sermon.id}
              href={url ?? "#"}
              target={url ? "_blank" : undefined}
              rel={url ? "noreferrer" : undefined}
              className="group flex gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                <SermonThumb sermon={sermon} />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${categoryColor(sermon.categories ? sermon.categories.length : 1)}`}>
                    {categoryLabel(sermon)}
                  </span>
                  <MediaBadge sermon={sermon} />
                </div>
                <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">
                  {sermon.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  {sermon.speaker || "Agape Word Chapel"} · {formatDate(sermon.published_date)}
                </p>
              </div>
            </Link>
          );
        })}
      </aside>
    </section>
  );
}

function TopStories({ sermons }: { sermons: Sermon[] }) {
  if (sermons.length === 0) return null;
  return (
    <section>
      <div className="mb-6 flex items-center gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Latest teachings</h2>
        <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-primary" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sermons.map((sermon, index) => {
          const url = watchUrl(sermon);
          return (
            <article key={sermon.id} className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lift">
              <div className="relative aspect-[16/10] overflow-hidden">
                <SermonThumb sermon={sermon} />
                <MediaBadge sermon={sermon} />
              </div>
              <div className="p-4">
                <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${categoryColor(index + 1)}`}>
                  {categoryLabel(sermon)}
                </span>
                <h3 className="mt-2.5 line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">
                  {sermon.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/70">By {sermon.speaker || "Agape Word Chapel"}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(sermon.published_date)}</p>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {hasVideo(sermon) ? "Watch" : "Listen"} <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StayConnected() {
  const socials = [
    { label: "Facebook", icon: FacebookIcon, className: "bg-[#1877f2] text-white" },
    { label: "Instagram", icon: InstagramIcon, className: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white" },
    { label: "Twitter / X", icon: TwitterIcon, className: "bg-[#14171a] text-white" },
    { label: "YouTube", icon: YoutubeIcon, className: "bg-[#ff0000] text-white" },
  ];
  return (
    <aside className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Stay connected</h3>
        <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-primary" />
      </div>
      <div className="mt-4 space-y-2.5">
        {socials.map((social) => (
          <a
            key={social.label}
            href="#"
            aria-label={social.label}
            className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition hover:opacity-90 ${social.className}`}
          >
            <social.icon className="h-4 w-4" />
            {social.label}
          </a>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-muted/60 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <MapPin className="h-3.5 w-3.5" /> Join us in person
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Agape Word Chapel International. We would love to welcome you to worship with us.
        </p>
      </div>
    </aside>
  );
}

function Archive({ sermons }: { sermons: Sermon[] }) {
  if (sermons.length === 0) return null;
  const lead = sermons[0];
  const list = sermons.slice(1, 5);
  const url = watchUrl(lead);

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr_0.55fr] xl:items-start">
      <div className="border-r border-border/70 pr-6 xl:col-span-3">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">More teachings</h2>
            <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          </div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Back home <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lift">
            <div className="relative aspect-[16/10] overflow-hidden">
              <SermonThumb sermon={lead} />
              <MediaBadge sermon={lead} />
            </div>
            <div className="p-5">
              <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${categoryColor(0)}`}>
                {categoryLabel(lead)}
              </span>
              <h3 className="mt-2.5 line-clamp-2 text-xl font-bold leading-snug text-foreground group-hover:text-primary">
                {lead.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {lead.description || "A life-giving message for spiritual growth and renewed hope."}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {lead.speaker || "Agape Word Chapel"} · {formatDate(lead.published_date)}
              </p>
              {url && (
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <a href={url} target="_blank" rel="noreferrer">
                    {hasVideo(lead) ? "Watch sermon" : "Listen now"} <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </article>

          <div className="space-y-4">
            {list.map((sermon, index) => {
              const itemUrl = watchUrl(sermon);
              return (
                <Link
                  key={sermon.id}
                  href={itemUrl ?? "#"}
                  target={itemUrl ? "_blank" : undefined}
                  rel={itemUrl ? "noreferrer" : undefined}
                  className="group flex gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                    <SermonThumb sermon={sermon} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${categoryColor(index + 2)}`}>
                      {categoryLabel(sermon)}
                    </span>
                    <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
                      {sermon.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {sermon.speaker || "Agape Word Chapel"} · {formatDate(sermon.published_date)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="xl:col-span-1 xl:border-l xl:border-border/70 xl:pl-6">
        <StayConnected />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/Agape%20logo.png" alt="Agape Word Chapel logo" width={52} height={52} className="h-12 w-12 object-contain" />
              <span>
                <span className="block text-lg font-semibold">Agape Word Chapel</span>
                <span className="text-xs uppercase tracking-[0.24em] text-white/50">International</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
              A welcoming church community helping people encounter God, grow in His Word and walk in purpose.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Explore</h3>
            <nav className="mt-4 grid gap-3 text-sm text-white/60">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/sermons" className="hover:text-white">Sermons</Link>
              <Link href="/ministries" className="hover:text-white">Ministries</Link>
              <Link href="/events" className="hover:text-white">Events</Link>
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Connect</h3>
            <nav className="mt-4 grid gap-3 text-sm text-white/60">
              <Link href="/giving" className="hover:text-white">Give and support</Link>
              <Link href="/contact" className="hover:text-white">Prayer request</Link>
              <Link href="/about" className="hover:text-white">About us</Link>
              <Link href="/contact" className="hover:text-white">Contact us</Link>
              <a href="mailto:joseandy3v@gmail.com" className="hover:text-white">joseandy3v@gmail.com</a>
              <a href="tel:0244643585" className="hover:text-white">0244643585 / 0571480435</a>
            </nav>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Agape Word Chapel International. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-white">Privacy policy</Link>
            <Link href="#" className="hover:text-white">Terms of use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default async function SermonsPage() {
  const sermons = await getPublishedSermons();
  const featured = sermons[0];
  const side = sermons.slice(1, 4);
  const topStories = sermons.slice(4, 8);
  const archive = sermons.slice(8);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <TrendingBar sermons={sermons} />

      <main className="mx-auto max-w-7xl space-y-12 px-5 py-10 sm:px-8 lg:py-12">
        <section>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Messages & teachings</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Sermons</h1>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Revisit powerful messages, sermons and teachings from Agape Word Chapel International.
            </p>
          </div>
          <CategoryRow sermons={sermons} />
        </section>

        {featured && <FeaturedHero sermons={sermons} />}

        {topStories.length > 0 && <TopStories sermons={topStories} />}

        {archive.length > 0 && <Archive sermons={archive} />}

        {!featured && (
          <section className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              No sermons published yet
            </p>
            <p className="mt-2 text-lg text-foreground">New messages will appear here as they are published.</p>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
