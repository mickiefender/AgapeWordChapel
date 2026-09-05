import { notFound } from "next/navigation";
import { getEvent } from "@/lib/queries/events";
import { EventForm } from "@/components/events/event-form";
import { PageHeader } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Event"
        description={`Update details for ${event.title}.`}
      />
      <div className="max-w-2xl rounded-xl border bg-card shadow-sm p-6">
        <EventForm event={event} />
      </div>
    </div>
  );
}
