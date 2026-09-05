import { EventForm } from "@/components/events/event-form";
import Link from "next/link";
import { CalendarDays, X } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:p-8">
      <Link href="/dashboard/events" aria-label="Close add event dialog" className="absolute inset-0 cursor-default" />
      <div role="dialog" aria-modal="true" aria-labelledby="add-event-title" className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lift">
        <div className="flex items-start justify-between border-b border-border/70 bg-muted/25 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="h-5 w-5" /></div>
            <div>
              <h1 id="add-event-title" className="text-lg font-semibold tracking-tight">Add event</h1>
              <p className="mt-1 text-sm text-muted-foreground">Create a gathering your community can remember.</p>
            </div>
          </div>
          <Link href="/dashboard/events" aria-label="Close" className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"><X className="h-5 w-5" /></Link>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-6 sm:px-7">
          <div className="mb-6 rounded-xl bg-sidebar p-4 text-sidebar-foreground">
            <p className="font-medium">Make it inviting</p>
            <p className="mt-1 text-xs leading-5 text-sidebar-muted">Add a banner image, clear schedule, and location so people know what to expect.</p>
          </div>
          <EventForm />
        </div>
      </div>
    </div>
  );
}
