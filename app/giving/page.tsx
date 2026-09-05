import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  HeartHandshake,
  MapPin,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Give and Support",
  description:
    "Give and support the ministry at Agape Word Chapel International. Learn about the ways you can give — bank transfer, mobile money, online and in person.",
  alternates: {
    canonical: "/giving",
  },
  openGraph: {
    title: "Give and Support | Agape Word Chapel International",
    description:
      "Give and support the ministry at Agape Word Chapel International.",
    url: "/giving",
  },
};

const paymentMethods = [
  {
    title: "Bank transfer",
    description: "Make a direct transfer or deposit using the church banking details.",
    icon: Building2,
    accent: "bg-amber-100 text-amber-800",
    details: [
      "Request the latest account details from the church office.",
      "Use your name and giving purpose as the payment reference.",
      "Send your confirmation to the church office after payment.",
    ],
  },
  {
    title: "Mobile money",
    description: "Give conveniently from your phone using your preferred mobile money service.",
    icon: Smartphone,
    accent: "bg-emerald-100 text-emerald-800",
    details: [
      "Contact the church office for the active mobile money number.",
      "Select the giving purpose before confirming your payment.",
      "Keep the transaction confirmation for your records.",
    ],
  },
  {
    title: "Online card giving",
    description: "Use a secure online payment link when one is available for your region.",
    icon: CreditCard,
    accent: "bg-sky-100 text-sky-800",
    details: [
      "Ask the church office for the current secure payment link.",
      "Check that the recipient is Agape Word Chapel before paying.",
      "Never share your card PIN or one-time password.",
    ],
  },
  {
    title: "Give in person",
    description: "You can also give during a service or visit the church office.",
    icon: Banknote,
    accent: "bg-violet-100 text-violet-800",
    details: [
      "Give during any worship service or church gathering.",
      "Envelope your giving and indicate the purpose clearly.",
      "Speak with a steward if you need a giving receipt.",
    ],
  },
];

export default function GivingPage() {
  return (
    <main className="min-h-screen bg-[#faf8f3] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[74px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
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
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/80 lg:flex">
            <Link href="/" className="transition-colors hover:text-primary">Home</Link>
            <Link href="/sermons" className="transition-colors hover:text-primary">Sermons</Link>
            <Link href="/ministries" className="transition-colors hover:text-primary">Ministries</Link>
            <Link href="/giving" className="text-primary">Give</Link>
          </nav>
          <Button className="rounded-sm bg-primary px-5 text-xs font-semibold uppercase tracking-wide" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </header>

      <section className="overflow-hidden bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to homepage
            </Link>
            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Give with purpose</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">Your generosity helps the ministry flourish.</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
              Every gift helps Agape Word Chapel serve families, share the Gospel, care for people, and create a place where lives can grow in faith.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#payment-methods" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                View payment methods <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link href="/#contact" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Contact the church
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-7 backdrop-blur-sm">
            <HeartHandshake className="h-10 w-10 text-primary" />
            <h2 className="mt-6 text-2xl font-semibold">Thank you for partnering with us.</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Please confirm payment details with the church office before sending money. This helps keep every gift secure and correctly recorded.
            </p>
          </div>
        </div>
      </section>

      <section id="payment-methods" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Ways to give</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Choose the payment method that works for you.</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Use one of the options below. For current account numbers, wallet numbers, and payment links, please contact the church office.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <article key={method.title} className="rounded-2xl border border-border/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${method.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">{method.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{method.description}</p>
                  </div>
                </div>
                <ul className="mt-6 grid gap-3 border-t border-border/70 pt-5 text-sm text-muted-foreground">
                  {method.details.map((detail) => (
                    <li key={detail} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/70 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Need payment details?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Our church office is happy to help.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Contact the church before making a transfer so you receive the correct and most up-to-date payment information.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/#contact" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Contact us <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
              Return home
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-white/60 sm:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Agape Word Chapel International.</p><Link href="/" className="hover:text-white">Home</Link></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6"><Link href="/about" className="hover:text-white">About us</Link><Link href="/ministries" className="hover:text-white">Ministries</Link><Link href="/sermons" className="hover:text-white">Sermons</Link><Link href="/events" className="hover:text-white">Events</Link><a href="mailto:joseandy3v@gmail.com" className="hover:text-white">joseandy3v@gmail.com</a><a href="tel:0244643585" className="hover:text-white">0244643585 / 0571480435</a></div>
        </div>
      </footer>
    </main>
  );
}
