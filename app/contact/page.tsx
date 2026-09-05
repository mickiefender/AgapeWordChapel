import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { getPublicServices } from "@/lib/queries/services";

const contactDetails = [
  { icon: Mail, label: "Email us", value: "joseandy3v@gmail.com", href: "mailto:joseandy3v@gmail.com" },
  { icon: Phone, label: "Call us", value: "0244643585 / 0571480435", href: "tel:0244643585" },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function formatTime(time: string | null) {
  if (!time) return "Time to be announced";
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes || 0, 0, 0);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function serviceTime(start: string | null, end: string | null) {
  const formattedStart = formatTime(start);
  return end ? `${formattedStart} – ${formatTime(end)}` : formattedStart;
}

export default async function ContactPage() {
  const services = await getPublicServices();

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[74px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/Agape%20logo.png" alt="Agape Word Chapel logo" width={72} height={72} className="h-16 w-16 object-contain" priority />
            <span className="leading-none"><span className="block font-serif text-2xl italic tracking-tight text-primary sm:text-3xl">Agape</span><span className="ml-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">Word Chapel</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/80 lg:flex">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/sermons" className="hover:text-primary">Sermons</Link>
            <Link href="/ministries" className="hover:text-primary">Ministries</Link>
            <Link href="/events" className="hover:text-primary">Events</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/giving" className="hover:text-primary">Give</Link>
          </nav>
          <Link href="/contact" className="hidden rounded-sm bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground lg:inline-flex">Contact us</Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">We are here for you</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Let&apos;s start a conversation.</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">Whether you have a question, need prayer, or would like to connect with our church family, we would love to hear from you.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Contact information</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Reach out anytime.</h2>
          <p className="mt-4 leading-7 text-muted-foreground">Our team is ready to listen, answer your questions, and help you find your next step at Agape Word Chapel International.</p>
          <div className="mt-8 space-y-4">
            {contactDetails.map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href} className="group flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 transition hover:border-primary/40 hover:shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                <span><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span><span className="mt-1 block text-sm font-medium group-hover:text-primary">{value}</span></span>
              </a>
            ))}
            <div className="rounded-xl border border-border/70 bg-card p-4">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Clock3 className="h-5 w-5" /></span>
                <span><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Service hours</span><span className="mt-1 block text-sm font-medium">Join us for an upcoming service</span></span>
              </div>
              <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
                {services.length > 0 ? services.map((service) => (
                  <div key={service.id} className="flex items-start gap-3 text-sm">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div><p className="font-semibold">{service.name}</p><p className="mt-0.5 text-muted-foreground">{formatDate(service.date)} · {serviceTime(service.start_time, service.end_time)}</p></div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">Service times will be posted here soon.</p>}
              </div>
            </div>
          </div>
          <div className="mt-8 rounded-2xl bg-primary p-6 text-primary-foreground">
            <div className="flex items-start gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0" /><div><p className="font-semibold">Visit our church family</p><p className="mt-2 text-sm leading-6 text-primary-foreground/80">Agape Word Chapel International welcomes you to worship, grow, and serve with us.</p></div></div>
          </div>
        </div>
        <ContactForm />
      </section>

      <footer className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-white/60 sm:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Agape Word Chapel International.</p><Link href="/" className="hover:text-white">Home</Link></div>
          <div className="flex flex-wrap gap-x-6 gap-y-2"><Link href="/about" className="hover:text-white">About us</Link><Link href="/ministries" className="hover:text-white">Ministries</Link><Link href="/sermons" className="hover:text-white">Sermons</Link><Link href="/events" className="hover:text-white">Events</Link><Link href="/giving" className="hover:text-white">Give and support</Link></div>
        </div>
      </footer>
    </main>
  );
}
