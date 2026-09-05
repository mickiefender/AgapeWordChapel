import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowUpRight, Building2, MapPin, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicDepartments } from "@/lib/queries/departments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ministries",
  description:
    "Explore the ministries and departments at Agape Word Chapel International. Find a place to serve, connect and grow in faith.",
  alternates: {
    canonical: "/ministries",
  },
  openGraph: {
    title: "Ministries | Agape Word Chapel International",
    description:
      "Explore the ministries and departments at Agape Word Chapel International.",
    url: "/ministries",
  },
};

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
          <Link href="/events" className="transition-colors hover:text-primary">Events</Link>
          <Link href="/about" className="transition-colors hover:text-primary">About</Link>
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

export default async function MinistriesPage() {
  const departments = await getPublicDepartments();

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Find your place</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Our ministries</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            There is a place for everyone to serve, connect and grow. Explore each ministry to learn more and get involved.
          </p>
        </div>

        {departments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              No ministries yet
            </p>
            <p className="mt-2 text-lg text-foreground">Ministries will appear here as they are created.</p>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <article
                key={department.id}
                className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lift"
              >
                <Link href={`/ministries/${department.id}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {department.image_url ? (
                      <img
                        src={department.image_url}
                        alt={department.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-amber-100 text-primary">
                        <Building2 className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      Explore ministry <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary">
                      {department.name}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {department.description || "A community where you can serve, connect and grow."}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {department.meeting_time && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {department.meeting_time}
                        </span>
                      )}
                      {department.meeting_location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {department.meeting_location}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
