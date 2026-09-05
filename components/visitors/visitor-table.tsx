import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Pencil, ArrowUpRight, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { VisitorStatus } from "@/types";
import type { VisitorWithProfile } from "@/lib/queries/visitors";

const STATUS_LABELS: Record<VisitorStatus, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  connected: "Connected",
  joined: "Joined",
  not_interested: "Not Interested",
};

const STATUS_BADGE_VARIANTS: Record<
  VisitorStatus,
  "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info"
> = {
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "?";
}

function formatService(service: string | null) {
  if (!service) return "—";
  return service.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function VisitorTable({ visitors }: { visitors: VisitorWithProfile[] }) {
  if (visitors.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="No visitors found"
        description="Try adjusting your search or filters, or add a new visitor to get started."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[26%]">Visitor</TableHead>
            <TableHead>Visit Date</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.map((v) => (
            <TableRow
              key={v.id}
              className="group transition-colors hover:bg-accent/40"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar firstName={v.full_name.split(" ")[0]} lastName={v.full_name.split(" ")[1]} size="sm" />
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/visitors/${v.id}`}
                      className="flex items-center gap-1 font-medium text-foreground transition-colors group-hover:text-primary"
                    >
                      <span className="truncate">{v.full_name}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    {v.email && (
                      <p className="truncate text-xs text-muted-foreground">{v.email}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(v.visit_date)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatService(v.service_attended)}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE_VARIANTS[v.status as VisitorStatus] ?? "secondary"}>
                  <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", STATUS_DOT[v.status as VisitorStatus])} />
                  {STATUS_LABELS[v.status as VisitorStatus] ?? v.status}
                </Badge>
              </TableCell>
              <TableCell>
                {v.assigned_profile ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground"
                    >
                      {getInitials(`${v.assigned_profile.first_name} ${v.assigned_profile.last_name}`)}
                    </span>
                    {v.assigned_profile.first_name} {v.assigned_profile.last_name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/dashboard/visitors/${v.id}`}
                    aria-label={`View ${v.full_name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/visitors/${v.id}/edit`}
                    aria-label={`Edit ${v.full_name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
