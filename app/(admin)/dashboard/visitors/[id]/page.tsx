import Link from "next/link";
import { notFound } from "next/navigation";
import { getVisitor, getAssignedProfiles } from "@/lib/queries/visitors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Pencil, Mail, Phone, MapPin, UserPlus, Calendar, User, ArrowLeft } from "lucide-react";
import type { VisitorStatus } from "@/types";

const STATUS_LABELS: Record<VisitorStatus, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  connected: "Connected",
  joined: "Joined",
  not_interested: "Not Interested",
};

const STATUS_VARIANTS: Record<VisitorStatus, "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info"> = {
  new: "info",
  contacted: "secondary",
  follow_up: "warning",
  connected: "secondary",
  joined: "success",
  not_interested: "destructive",
};

const STATUS_DOT: Record<VisitorStatus, string> = {
  new: "bg-sky-500",
  contacted: "bg-amber-500",
  follow_up: "bg-amber-600",
  connected: "bg-primary",
  joined: "bg-emerald-500",
  not_interested: "bg-rose-500",
};

const SERVICE_LABELS: Record<string, string> = {
  sunday_service: "Sunday Service",
  midweek_service: "Midweek Service",
  bible_study: "Bible Study",
  prayer_meeting: "Prayer Meeting",
  event: "Event",
  children_ministry: "Children's Ministry",
  youth_ministry: "Youth Ministry",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "?";
}

export const dynamic = "force-dynamic";

export default async function VisitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visitor = await getVisitor(id);

  if (!visitor) {
    notFound();
  }

  const assignees = await getAssignedProfiles();
  const assigned = assignees.find((a) => a.id === visitor.assigned_to);

  const detailRows = [
    { label: "Phone", value: visitor.phone ?? "—", icon: Phone },
    { label: "Email", value: visitor.email ?? "—", icon: Mail },
    { label: "Location", value: visitor.location ?? "—", icon: MapPin },
    { label: "Invited by", value: visitor.invited_by ?? "—", icon: UserPlus },
  ];

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/visitors"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to visitors
        </Link>
      </div>

      {/* Hero */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              firstName={visitor.full_name.split(" ")[0]}
              lastName={visitor.full_name.split(" ")[1]}
              size="lg"
              className="h-16 w-16 text-2xl ring-2 ring-background shadow-soft"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{visitor.full_name}</h1>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={STATUS_VARIANTS[visitor.status] ?? "secondary"}>
                  <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", STATUS_DOT[visitor.status])} />
                  {STATUS_LABELS[visitor.status] ?? visitor.status}
                </Badge>
                <span>·</span>
                <span>Visited {formatDate(visitor.visit_date)}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/visitors/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {detailRows.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <row.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="truncate text-sm font-medium">{row.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">Visit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Service attended</p>
                  <p className="text-sm font-medium">
                    {visitor.service_attended ? SERVICE_LABELS[visitor.service_attended] ?? visitor.service_attended.replace(/_/g, " ") : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Assigned to</p>
                  <p className="text-sm font-medium">
                    {assigned ? `${assigned.first_name} ${assigned.last_name}` : "Unassigned"}
                  </p>
                </div>
              </div>
              {visitor.notes && (
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Notes</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground">{visitor.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Status Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current status</span>
                <Badge variant={STATUS_VARIANTS[visitor.status] ?? "secondary"}>
                  <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", STATUS_DOT[visitor.status])} />
                  {STATUS_LABELS[visitor.status] ?? visitor.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Visit date</span>
                <span className="text-sm font-medium">{formatDate(visitor.visit_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Registered</span>
                <span className="text-sm font-medium">{formatDate(visitor.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
