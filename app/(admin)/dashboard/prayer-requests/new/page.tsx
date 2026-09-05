import Link from "next/link";
import { HeartPulse, X } from "lucide-react";
import { PrayerRequestForm } from "@/components/prayer-requests/prayer-request-form";

export const dynamic = "force-dynamic";

export default async function NewPrayerRequestPage() {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:p-8">
      <Link href="/dashboard/prayer-requests" aria-label="Close add prayer request dialog" className="absolute inset-0 cursor-default" />
      <div role="dialog" aria-modal="true" aria-labelledby="add-prayer-request-title" className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lift">
        <div className="flex items-start justify-between border-b border-border/70 bg-muted/25 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700"><HeartPulse className="h-5 w-5" /></div>
            <div>
              <h1 id="add-prayer-request-title" className="text-lg font-semibold tracking-tight">Add prayer request</h1>
              <p className="mt-1 text-sm text-muted-foreground">Record a need so your care team can respond.</p>
            </div>
          </div>
          <Link href="/dashboard/prayer-requests" aria-label="Close" className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"><X className="h-5 w-5" /></Link>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-6 sm:px-7">
          <div className="mb-6 rounded-xl bg-sidebar p-4 text-sidebar-foreground">
            <p className="font-medium">Lead with care</p>
            <p className="mt-1 text-xs leading-5 text-sidebar-muted">Choose the right privacy level and keep the request updated as care progresses.</p>
          </div>
          <PrayerRequestForm />
        </div>
      </div>
    </div>
  );
}
