import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, HeartHandshake, Quote, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLeaders } from "@/lib/queries/leaders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Agape Word Chapel International — our story, what we believe, and the people who lead our church family. Discover where you belong.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Agape Word Chapel International",
    description:
      "Learn about Agape Word Chapel International — our story, what we believe, and our leadership.",
    url: "/about",
  },
};

export default async function AboutPage() {
  const leaders = await getLeaders();

  return (
    <main className="min-h-screen bg-[#faf8f3] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[74px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/Agape%20logo.png" alt="Agape Word Chapel logo" width={72} height={72} className="h-16 w-16 object-contain sm:h-[4.5rem] sm:w-[4.5rem]" priority />
            <span className="leading-none"><span className="block font-serif text-2xl italic tracking-tight text-primary sm:text-3xl">Agape</span><span className="ml-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">Word Chapel</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/80 lg:flex">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/sermons" className="hover:text-primary">Sermons</Link>
            <Link href="/ministries" className="hover:text-primary">Ministries</Link>
            <Link href="/about" className="text-primary">About</Link>
            <Link href="/giving" className="hover:text-primary">Give</Link>
          </nav>
          <Button asChild className="rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-wide"><Link href="/#contact">Visit us</Link></Button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,184,109,0.25),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">About Agape Word Chapel</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">A church where people encounter God and discover purpose.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">We are a Christ-centered family committed to the Word of God, genuine community, and a life of service. Everyone is welcome to grow, belong, and serve with us.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ministries" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Find your place <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/sermons" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Explore our messages</Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-sm">
            <Quote className="h-10 w-10 text-primary" />
            <p className="mt-6 text-2xl font-semibold leading-tight">“The place where love builds, faith grows, and purpose comes alive.”</p>
            <p className="mt-5 text-sm uppercase tracking-[0.2em] text-white/50">Our heart as a church family</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary/10 p-8 sm:p-12">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/15" />
          <HeartHandshake className="relative h-12 w-12 text-primary" />
          <p className="relative mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-primary">What we believe</p>
          <h2 className="relative mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Faith that reaches beyond Sunday.</h2>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Our story</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Built on love, shaped by the Word.</h2>
          <p className="mt-5 leading-8 text-muted-foreground">Agape Word Chapel International exists to help people know Jesus, grow in spiritual maturity, and live out their God-given calling. Through worship, teaching, prayer, and practical care, we seek to be a faithful presence in our community.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              ["01", "Encounter", "Make room for people to meet with God."],
              ["02", "Grow", "Build a life rooted in Scripture and prayer."],
              ["03", "Serve", "Use your gifts to bless people and community."],
            ].map(([number, title, text]) => <div key={number} className="rounded-xl border border-border/70 bg-white p-4"><p className="text-xs font-bold text-primary">{number}</p><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Meet the team</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Our leadership</h2><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Meet the people who serve our church family with humility, wisdom, and care.</p></div>
            <UsersRound className="hidden h-10 w-10 text-primary/40 sm:block" />
          </div>
          {leaders.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center"><Sparkles className="mx-auto h-8 w-8 text-primary" /><p className="mt-4 font-semibold">Leadership profiles are coming soon.</p></div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {leaders.map((leader) => <article key={leader.id} className="overflow-hidden rounded-2xl border border-border/80 bg-[#faf8f3] shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="aspect-[4/3] bg-primary/10">{leader.image_url ? <img src={leader.image_url} alt={leader.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl font-serif text-primary/50">{leader.name.charAt(0)}</div>}</div>
                <div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{leader.position}</p><h3 className="mt-2 text-xl font-bold">{leader.name}</h3>{leader.bio && <p className="mt-3 line-clamp-4 text-sm leading-7 text-muted-foreground">{leader.bio}</p>}</div>
              </article>)}
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
          <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/70">Come as you are</p><h2 className="mt-2 text-3xl font-bold tracking-tight">There is a place for you at Agape.</h2></div>
          <Button variant="secondary" asChild><Link href="/ministries">Explore ministries <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="bg-slate-950 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-white/60 sm:px-8"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Agape Word Chapel International.</p><Link href="/" className="hover:text-white">Home</Link></div><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6"><Link href="/ministries" className="hover:text-white">Ministries</Link><Link href="/sermons" className="hover:text-white">Sermons</Link><Link href="/events" className="hover:text-white">Events</Link><Link href="/giving" className="hover:text-white">Give and support</Link><a href="mailto:joseandy3v@gmail.com" className="hover:text-white">joseandy3v@gmail.com</a><a href="tel:0244643585" className="hover:text-white">0244643585 / 0571480435</a></div></div></footer>
    </main>
  );
}
