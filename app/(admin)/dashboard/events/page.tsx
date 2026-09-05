import Link from "next/link";
import { getEvents } from "@/lib/queries/events";
import { EventTable } from "@/components/events/event-table";
import { PageHeader } from "@/components/ui/stat-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPinned, Plus, TicketCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();
  const upcomingEvents = events.filter((event) => event.start_date >= new Date().toISOString().slice(0, 10)).length;
  const registrationEvents = events.filter((event) => event.registration_required).length;
  const totalCapacity = events.reduce((total, event) => total + (event.capacity ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Events"
        description="Plan and publish memorable gatherings for your church community."
        actions={
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4" />
              Add Event
            </Link>
          </Button>
        }
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total events" value={events.length} description="All planned gatherings" icon={CalendarDays} iconTone="primary" />
        <StatCard title="Upcoming" value={upcomingEvents} description="Future events on the calendar" icon={MapPinned} iconTone="emerald" />
        <StatCard title="Registration capacity" value={totalCapacity} description={`${registrationEvents} events require registration`} icon={TicketCheck} iconTone="violet" />
      </div>

      <EventTable events={events} />
    </div>
  );
}
