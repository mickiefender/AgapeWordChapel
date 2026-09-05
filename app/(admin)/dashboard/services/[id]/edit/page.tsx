import { notFound } from "next/navigation";
import { getService } from "@/lib/queries/services";
import { ServiceForm } from "@/components/services/service-form";
import Link from "next/link";
import { CalendarClock, X } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:p-8">
      <Link
        href={`/dashboard/services/${id}`}
        aria-label="Close edit service dialog"
        className="absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-service-title"
        className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lift"
      >
        <div className="flex items-start justify-between border-b border-border/70 bg-muted/25 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h1 id="edit-service-title" className="text-lg font-semibold tracking-tight">
                Edit service
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the schedule and details for {service.name}.
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/services/${id}`}
            aria-label="Close"
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-6 sm:px-7">
          <div className="mb-6 rounded-xl bg-sidebar p-4 text-sidebar-foreground">
            <p className="font-medium">Keep the team aligned</p>
            <p className="mt-1 text-xs leading-5 text-sidebar-muted">
              Make schedule changes clear so everyone serving knows what to expect.
            </p>
          </div>
          <ServiceForm service={service} />
        </div>
      </div>
    </div>
  );
}
