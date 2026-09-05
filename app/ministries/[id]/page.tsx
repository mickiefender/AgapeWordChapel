import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Clock, MapPin, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JoinMinistryForm } from "@/components/ministries/join-ministry-form";
import { getDepartment, getPublicDepartments } from "@/lib/queries/departments";

export const dynamic = "force-dynamic";

function getVideoEmbed(url: string | null): { type: "youtube" | "facebook" | "file" | "other"; src: string } | null {
  if (!url) return null;
  const youtube = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]+)/,
  );
  if (youtube) return { type: "youtube", src: `https://www.youtube.com/embed/${youtube[1]}` };
  if (/facebook\.com\/.+\/videos\//.test(url)) {
    return { type: "facebook", src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}` };
  }
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return { type: "file", src: url };
  return { type: "other", src: url };
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

export default async function MinistryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [department, departments] = await Promise.all([getDepartment(id), getPublicDepartments()]);

  if (!department) {
    notFound();
  }

  const videoEmbed = getVideoEmbed(department.video_url);
  const gallery = department.gallery ?? [];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Link
          href="/ministries"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All ministries
        </Link>

        {/* Hero */}
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-border/80 shadow-lift">
          <div className="relative aspect-[16/7] w-full overflow-hidden sm:aspect-[21/9]">
            {department.image_url ? (
              <img src={department.image_url} alt={department.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-amber-100 text-primary">
                <Building2 className="h-20 w-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
                  Ministry
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">{department.name}</h1>
              {department.description && (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                  {department.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div className="space-y-8">
            {videoEmbed && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Watch</h2>
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-card">
                  {videoEmbed.type === "youtube" || videoEmbed.type === "facebook" ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={videoEmbed.src}
                        title={`${department.name} video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                  ) : videoEmbed.type === "file" ? (
                    <video controls className="aspect-video h-full w-full">
                      <source src={videoEmbed.src} />
                    </video>
                  ) : (
                    <div className="flex aspect-video items-center justify-center">
                      <Button variant="outline" className="rounded-full bg-white/10 text-white hover:bg-white/20" asChild>
                        <a href={department.video_url!} target="_blank" rel="noreferrer">
                          <Sparkles className="h-4 w-4" /> Open video
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {gallery.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Gallery</h2>
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {gallery.map((image, index) => (
                    <div key={`${image}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-border/80">
                      <img
                        src={image}
                        alt={`${department.name} gallery ${index + 1}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {department.description && (
              <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">About this ministry</h2>
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{department.description}</p>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Quick facts</h3>
                <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="mt-5 space-y-4">
                {department.meeting_time && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Meets</p>
                      <p className="text-sm font-medium">{department.meeting_time}</p>
                    </div>
                  </div>
                )}
                {department.meeting_location && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{department.meeting_location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Leader</p>
                    <p className="text-sm font-medium">{department.leader_id ? "Assigned leader" : "To be announced"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">Ministry</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lift">
              <h3 className="text-lg font-bold tracking-tight">Want to get involved?</h3>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/80">
                Reach out to learn more about {department.name} and how you can serve.
              </p>
              <JoinMinistryForm
                ministries={departments.map(({ id: ministryId, name }) => ({ id: ministryId, name }))}
                defaultMinistryId={department.id}
                variant="secondary"
                triggerClassName="mt-5 w-full bg-background text-foreground hover:bg-background/90"
              />
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
