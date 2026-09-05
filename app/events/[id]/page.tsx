import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventShare } from "@/components/events/event-share";
import { getPublicEvent } from "@/lib/queries/events";
import type { ChurchEvent } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEvent(id);
  if (!event) {
    return { title: "Event Not Found" };
  }

  const description =
    event.description?.slice(0, 160) ??
    `Join us for ${event.title} at Agape Word Chapel International.`;

  return {
    title: event.title,
    description,
    alternates: {
      canonical: `/events/${event.id}`,
    },
    openGraph: {
      title: event.title,
      description,
      type: "article",
      url: `/events/${event.id}`,
      images: event.image_url ? [{ url: event.image_url }] : undefined,
    },
  };
}

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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 shadow-sm backdrop-blur">
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
              <Link href="/giving" className="hover:text-white">Give and support</Link>
              <Link href="/contact" className="hover:text-white">Prayer request</Link>
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

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function EventHero({ event }: { event: ChurchEvent }) {
  const time = formatEventTime(event.start_time);
  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-border/80 shadow-lift">
      <div className="relative aspect-[16/7] w-full overflow-hidden sm:aspect-[21/9]">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-amber-100 text-primary">
            <CalendarDays className="h-20 w-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
              {event.event_type || "Event"}
            </span>
            {event.registration_required && (
              <span className="rounded-md bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                Registration required
              </span>
            )}
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {event.title}
          </h1>
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
    </section>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getPublicEvent(id);

  if (!event) {
    notFound();
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;
  const shareUrl = `${origin}/events/${event.id}`;

  const time = formatEventTime(event.start_time);
  const endTime = formatEventTime(event.end_time);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All events
        </Link>

        <EventHero event={event} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div className="space-y-8">
            {event.description && (
              <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">About this event</h2>
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {event.description}
                </p>
              </section>
            )}

            {!event.description && (
              <section className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-primary/60" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  More details about this event will be shared soon.
                </p>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Event details</h3>
                <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="mt-5 space-y-4">
                <Fact
                  icon={CalendarDays}
                  label="Date"
                  value={`${formatEventDate(event.start_date)}${event.end_date ? ` – ${formatEventDate(event.end_date)}` : ""}`}
                />
                {time && (
                  <Fact
                    icon={Clock}
                    label="Time"
                    value={endTime ? `${time} – ${endTime}` : time}
                  />
                )}
                {event.location && (
                  <Fact icon={MapPin} label="Location" value={event.location} />
                )}
                {event.capacity != null && (
                  <Fact
                    icon={Users}
                    label="Capacity"
                    value={`${event.capacity} people`}
                  />
                )}
                <Fact
                  icon={Sparkles}
                  label="Registration"
                  value={event.registration_required ? "Required" : "Not required"}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
              <EventShare url={shareUrl} title={event.title} />
            </section>

            <section className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lift">
              <h3 className="text-lg font-bold tracking-tight">Plan your visit</h3>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/80">
                We would love to welcome you to worship with us. Come as you are and be part of the community.
              </p>
              <Button
                className="mt-5 w-full bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link href="/#contact">Plan your visit</Link>
              </Button>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
