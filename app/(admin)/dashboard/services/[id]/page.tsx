import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getService,
  getServiceItems,
  getServiceAssignments,
  getAllMembers,
} from "@/lib/queries/services";
import {
  deleteServiceItem,
  deleteServiceAssignment,
} from "@/actions/services";
import { PageHeader } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ServiceItemForm } from "@/components/services/service-item-form";
import { ServiceAssignmentForm } from "@/components/services/service-assignment-form";
import { CalendarClock, ListMusic, Pencil, Trash2, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    notFound();
  }

  const [items, assignments, members] = await Promise.all([
    getServiceItems(id),
    getServiceAssignments(id),
    getAllMembers(),
  ]);

  return (
    <div>
      <PageHeader
        title={service.name}
        description={`${new Date(service.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}${service.start_time ? ` · ${service.start_time.slice(0, 5)}` : ""}`}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/services/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        }
      />

      {service.notes && (
        <div className="mb-6 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          {service.notes}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Service Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListMusic className="h-4 w-4" />
              Service Items ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <EmptyState
                icon={<ListMusic className="h-6 w-6" />}
                title="No items yet"
                description="Add items to build the order of service."
              />
            ) : (
              <ol className="space-y-2">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.start_time ? item.start_time.slice(0, 5) : "No time"}
                        {item.duration_minutes ? ` · ${item.duration_minutes} min` : ""}
                      </p>
                    </div>
                    <form action={deleteServiceItem.bind(null, id, item.id)}>
                      <button
                        type="submit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </li>
                ))}
              </ol>
            )}

            <ServiceItemForm serviceId={id} />
          </CardContent>
        </Card>

        {/* Service Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assignments ({assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignments.length === 0 ? (
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No assignments yet"
                description="Assign members to serve during this service."
              />
            ) : (
              <div className="space-y-2">
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold">
                      {a.member_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("") ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.member_name ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.role}
                        {a.notes ? ` · ${a.notes}` : ""}
                      </p>
                    </div>
                    <form action={deleteServiceAssignment.bind(null, id, a.id)}>
                      <button
                        type="submit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${a.member_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            <ServiceAssignmentForm serviceId={id} members={members} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/services">
            <CalendarClock className="h-4 w-4" />
            Back to Services
          </Link>
        </Button>
      </div>
    </div>
  );
}
