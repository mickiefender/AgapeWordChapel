import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveHeroImages } from "@/lib/queries/hero-images";
import { HeroCarousel } from "@/components/hero-images/hero-carousel";
import { getHomepageContent } from "@/lib/queries/homepage";
import { NextService } from "@/components/homepage/next-service";
import { SermonMarquee } from "@/components/homepage/sermon-marquee";
import { AnnouncementTicker } from "@/components/homepage/announcement-ticker";
import { PrayerRequestModal } from "@/components/homepage/prayer-request-modal";
import { MobilePublicNav } from "@/components/layout/mobile-public-nav";
import { ArrowUpRight, CalendarDays, Megaphone } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agape Word Chapel International",
  description:
    "Welcome to Agape Word Chapel International — a Christ-centred church family where you can encounter God, grow in His Word and discover your purpose. Explore sermons, ministries, events and more.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Agape Word Chapel International",
    description:
      "A Christ-centred church family where you can encounter God, grow in His Word and discover your purpose.",
    url: "/",
  },
};

export default async function Home() {
  const heroImages = await getActiveHeroImages();
  const { service, sermons, events, departments, announcements } = await getHomepageContent();

  return (
    <div className="min-h-screen bg-background font-sans">
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
            <Link href="/ministries" className="transition-colors hover:text-primary">Ministries</Link>
            <Link href="/sermons" className="transition-colors hover:text-primary">Sermons</Link>
            <Link href="/events" className="transition-colors hover:text-primary">Events</Link>
            <Link href="/contact" className="transition-colors hover:text-primary">Contact us</Link>
            <Link href="/about" className="transition-colors hover:text-primary">About</Link>
          </nav>
          <Button className="hidden rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-wide shadow-sm hover:bg-primary/90 lg:inline-flex" asChild>
            <Link href="/giving">Donate Now</Link>
          </Button>
          <MobilePublicNav />
        </div>
      </header>

      <section id="home" className="relative h-[clamp(300px,58vh,760px)] min-h-[300px] max-h-[760px] overflow-hidden sm:h-[calc(100vh-80px)] sm:min-h-[460px]">
        <HeroCarousel images={heroImages} />
        {!heroImages.length && <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-background" />}
      </section>

      <AnnouncementTicker />

      {service && <NextService service={service} />}

      <section className="bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
          <div className="relative min-h-72 overflow-hidden rounded-2xl bg-muted shadow-card sm:min-h-96">
            {heroImages[0] ? <img src={heroImages[0].image_url} alt="Agape Word Chapel community" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-primary/20 to-amber-100" />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Welcome to Agape</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">A place to grow in faith and community.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">At Agape Word Chapel International, we are committed to helping people encounter God, grow in His Word, and walk in their God-given purpose.</p>
            <Button className="mt-7" variant="outline" asChild><Link href="/about">Learn more about us <ArrowUpRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      {sermons.length > 0 && (
        <section className="border-y border-border/70 bg-card/45">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Listen and watch</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Latest sermons</h2></div><Button variant="ghost" asChild><Link href="/sermons">View all sermons <ArrowUpRight className="h-4 w-4" /></Link></Button></div>
            <SermonMarquee sermons={sermons} />
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Mark your calendar</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Upcoming events</h2></div><Button variant="ghost" asChild><Link href="/events">View all events <ArrowUpRight className="h-4 w-4" /></Link></Button></div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {events.map((event) => <article key={event.id} className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"><div className="aspect-[16/9] bg-muted">{event.image_url ? <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-primary"><CalendarDays className="h-9 w-9" /></div>}</div><div className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-primary">{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${event.start_date}T12:00:00`))}</p><h3 className="mt-2 line-clamp-2 font-semibold">{event.title}</h3><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.description || event.location || "Join us for this upcoming gathering."}</p><p className="mt-3 text-xs text-muted-foreground">{event.location || "Agape Word Chapel International"}{event.registration_required ? " • Registration required" : ""}</p></div></article>)}
            </div>
          </div>
        </section>
      )}

      {departments.length > 0 && (
        <section className="border-y border-border/70 bg-card/45">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Find your place</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Our ministries</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {departments.map((department) => (
                <Link
                  key={department.id}
                  href={`/ministries/${department.id}`}
                  className="group overflow-hidden rounded-xl border border-border/80 bg-background transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    {department.image_url ? (
                      <img
                        src={department.image_url}
                        alt={department.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary">
                        <UsersRound className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold group-hover:text-primary">{department.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {department.description || "A community where you can serve, connect and grow."}
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:underline">
                      Connect with us <ArrowUpRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-16">
          <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/70">Daily encouragement</p><h2 className="mt-3 text-3xl font-bold tracking-tight">“Trust in the Lord with all your heart.”</h2><p className="mt-3 text-primary-foreground/75">Proverbs 3:5</p></div>
          <Button variant="secondary" className="w-fit bg-background text-foreground hover:bg-background/90" asChild><Link href="/sermons">Explore the Word <ArrowUpRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Stay informed</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Church announcements</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {announcements.map((announcement) => <article key={announcement.id} className="rounded-xl border border-border/80 bg-card p-5 shadow-sm"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary"><Megaphone className="h-4 w-4" />{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(announcement.publish_date))}</div><h3 className="mt-4 font-semibold">{announcement.title}</h3><p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">{announcement.content}</p><Link href={`/dashboard/announcements/${announcement.id}`} className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Read more <ArrowUpRight className="ml-1 h-4 w-4" /></Link></article>)}
            </div>
          </div>
        </section>
      )}

      <section
        className="relative overflow-hidden border-y border-border/70 bg-slate-950 text-white"
        style={{
          backgroundImage: heroImages.length
            ? `url("${heroImages[1]?.image_url ?? heroImages[0]?.image_url}")`
            : undefined,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Pastoral care</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Need prayer?</h2><p className="mt-4 max-w-xl leading-7 text-white/80">You do not have to go through it alone. Share your prayer request and allow our prayer team to stand with you.</p><PrayerRequestModal /></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"><p className="text-lg font-semibold">Give and support the ministry</p><p className="mt-2 text-sm leading-6 text-white/75">Your generosity helps us serve families, reach people with the Gospel and advance God's work.</p><Button variant="secondary" className="mt-5" asChild><Link href="/giving">Give now</Link></Button></div>
        </div>
      </section>

      <section className="bg-card/45">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-20">
          <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Plan your visit</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Your first time at Agape?</h2><p className="mt-4 max-w-lg leading-7 text-muted-foreground">We are excited to welcome you. Come as you are, meet our community and discover a place to belong.</p><Button className="mt-6" asChild><Link href="#contact">Plan your visit</Link></Button></div>
          <div id="contact" className="rounded-2xl border border-border/80 bg-background p-6"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Join us</p><div className="mt-5 space-y-4 text-sm text-muted-foreground"><p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" />Agape Word Chapel International</p><p className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" />Contact the church office for service details</p><p className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" />We would love to hear from you</p></div></div>
        </div>
      </section>

      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <Image src="/Agape%20logo.png" alt="Agape Word Chapel logo" width={58} height={58} className="h-14 w-14 object-contain" />
                <span><span className="block text-lg font-semibold">Agape Word Chapel</span><span className="text-xs uppercase tracking-[0.24em] text-white/50">International</span></span>
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-7 text-white/60">A welcoming church community helping people encounter God, grow in His Word and walk in purpose.</p>
              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=100063542140662"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Agape Word Chapel on Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current"><path d="M13.5 21v-8h2.75l.42-3h-3.17V8.08c0-.87.24-1.46 1.5-1.46h1.8V3.94c-.31-.04-1.37-.14-2.6-.14-2.57 0-4.33 1.57-4.33 4.46V10H7.1v3h2.77v8h3.63Z" /></svg>
                </a>
                <a href="#" aria-label="Agape Word Chapel on Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" /></svg>
                </a>
                <a href="#" aria-label="Agape Word Chapel on YouTube" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff0000] text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current"><path d="M21.58 7.19a2.98 2.98 0 0 0-2.1-2.1C17.63 4.58 12 4.58 12 4.58s-5.63 0-7.48.51a2.98 2.98 0 0 0-2.1 2.1C1.91 9.04 1.91 12 1.91 12s0 2.96.51 4.81a2.98 2.98 0 0 0 2.1 2.1c1.85.51 7.48.51 7.48.51s5.63 0 7.48-.51a2.98 2.98 0 0 0 2.1-2.1c.51-1.85.51-4.81.51-4.81s0-2.96-.51-4.81ZM10 15.5v-7l6 3.5-6 3.5Z" /></svg>
                </a>
              </div>
            </div>
            <div><h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Explore</h2><nav className="mt-5 grid gap-3 text-sm text-white/60"><Link href="/" className="hover:text-white">Home</Link><Link href="/about" className="hover:text-white">About us</Link><Link href="/ministries" className="hover:text-white">Ministries</Link><Link href="/sermons" className="hover:text-white">Sermons</Link><Link href="/events" className="hover:text-white">Events</Link></nav></div>
            <div><h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Connect</h2><nav className="mt-5 grid gap-3 text-sm text-white/60"><Link href="/giving" className="hover:text-white">Give and support</Link><Link href="/contact" className="hover:text-white">Prayer request</Link><Link href="/contact" className="hover:text-white">Contact us</Link><a href="mailto:joseandy3v@gmail.com" className="hover:text-white">joseandy3v@gmail.com</a><a href="tel:0244643585" className="hover:text-white">0244643585 / 0571480435</a></nav></div>
            <div><h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Visit us</h2><div className="mt-5 space-y-3 text-sm leading-6 text-white/60"><p>Agape Word Chapel International</p><p>We would love to welcome you to worship with us.</p><Link href="/#contact" className="inline-flex font-semibold text-primary hover:text-white">Plan your visit <ArrowUpRight className="ml-1 h-4 w-4" /></Link></div></div>
          </div>
          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row"><p>© {new Date().getFullYear()} Agape Word Chapel International. All rights reserved.</p><div className="flex gap-5"><Link href="#" className="hover:text-white">Privacy policy</Link><Link href="#" className="hover:text-white">Terms of use</Link></div></div>
        </div>
      </footer>
    </div>
  );
}
