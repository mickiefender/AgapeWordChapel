import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock, MapPin, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getPublicEvents } from "@/lib/queries/events";
import type { ChurchEvent } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upcoming Events",
  description:
    "See upcoming events, services, conferences and gatherings at Agape Word Chapel International. Mark your calendar and join us.",
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "Upcoming Events | Agape Word Chapel International",
    description:
      "See upcoming events, services, conferences and gatherings at Agape Word Chapel International.",
    url: "/events",
  },
};

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatEventTime(time: string | null) {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  const date = new Date();
  date.setHours(h, m ?? 0, 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
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
          <Link href="/events" className="text-primary">Events</Link>
          <Link href="/#about" className="transition-colors hover:text-primary">About</Link>
        </nav>
        <Button className="rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-wide shadow-sm hover:bg-primary/90" asChild>
          <Link href="/login">Watch Live</Link>
        </Button>
      </div>
    </header>
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
              <Link href="/about" className="hover:text-white">About us</Link>
              <Link href="/sermons" className="hover:text-white">Sermons</Link>
              <Link href="/ministries" className="hover:text-white">Ministries</Link>
              <Link href="/events" className="hover:text-white">Events</Link>
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Connect</h3>
            <nav className="mt-4 grid gap-3 text-sm text-white/60">
              <Link href="/contact" className="hover:text-white">Prayer request</Link>
              <Link href="/giving" className="hover:text-white">Give</Link>
              <Link href="/giving" className="hover:text-white">Give and support</Link>
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

function EventThumb({ event }: { event: ChurchEvent }) {
  if (event.image_url) {
    return (
      <img
        src={event.image_url}
        alt={event.title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-amber-100 text-primary">
      <CalendarDays className="h-12 w-12" />
    </div>
  );
}

function DateBadge({ date }: { date: string }) {
  const d = new Date(`${date}T12:00:00`);
  return (
    <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-white/95 px-3 py-1.5 text-center shadow-sm backdrop-blur">
      <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
        {d.toLocaleDateString("en-US", { month: "short" })}
      </span>
      <span className="text-lg font-bold leading-none text-foreground">{d.getDate()}</span>
    </div>
  );
}

function FeaturedEvent({ event }: { event: ChurchEvent }) {
  const time = formatEventTime(event.start_time);
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border/80 shadow-lift">
      <Link href={`/events/${event.id}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
          <EventThumb event={event} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
                {event.event_type || "Upcoming"}
              </span>
              {event.registration_required && (
                <span className="rounded-md bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                  Registration required
                </span>
              )}
            </div>
            <h2 className="max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-4xl">
              {event.title}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatEventDate(event.start_date)}
                {event.end_date ? ` – ${formatEventDate(event.end_date)}` : ""}
              </span>
              {time && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {time}
                </span>
              )}
              {event.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function EventCard({ event }: { event: ChurchEvent }) {
  const time = formatEventTime(event.start_time);
  return (
    <article className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/events/${event.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <EventThumb event={event} />
          <DateBadge date={event.start_date} />
          {event.registration_required && (
            <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              Registration required
            </span>
          )}
        </div>
        <div className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            {event.event_type || "Event"}
          </span>
          <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-foreground group-hover:text-primary">
            {event.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {event.description || "Join us for this upcoming gathering and be part of the community."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {event.location}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default async function EventsPage() {
  const events = await getPublicEvents();
  const featured = events[0];
  const rest = events.slice(1);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Mark your calendar</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Upcoming events</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Join us for special services, conferences and gatherings. There is always something happening at Agape
            Word Chapel International.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              No events scheduled yet
            </p>
            <p className="mt-2 text-lg text-foreground">Upcoming events will appear here as they are announced.</p>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        ) : (
          <>
            <FeaturedEvent event={featured} />
            {rest.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
