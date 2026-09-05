import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/queries/events";
import { PageHeader } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Pencil, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={event.title}
        description={event.location ?? "Church event"}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/events/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {event.image_url && (
          <Card className="overflow-hidden lg:row-span-2">
            <img
              src={event.image_url}
              alt={`${event.title} banner`}
              className="h-64 w-full object-cover sm:h-80 lg:h-full lg:min-h-[28rem]"
            />
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Start</p>
                <p className="mt-1">
                  {new Date(event.start_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {event.start_time ? ` · ${event.start_time.slice(0, 5)}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">End</p>
                <p className="mt-1">
                  {event.end_date
                    ? new Date(event.end_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                  {event.end_time ? ` · ${event.end_time.slice(0, 5)}` : ""}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Location</p>
              <p className="mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {event.location ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Capacity</p>
              <p className="mt-1 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {event.capacity ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Event Type</p>
              <p className="mt-1">{event.event_type ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Registration</p>
              <Badge variant={event.registration_required ? "default" : "secondary"} className="mt-1">
                {event.registration_required ? "Registration Required" : "No Registration"}
              </Badge>
            </div>
            {event.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{event.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/events">
            <CalendarDays className="h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>
    </div>
  );
}
