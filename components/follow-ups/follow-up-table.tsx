import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList, Pencil, CheckCircle2, AlarmClock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { FollowUpWithNames } from "@/lib/queries/follow-ups";
import { completeFollowUp } from "@/actions/follow-ups";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info"> = {
  pending: "warning",
  in_progress: "info",
  completed: "success",
  cancelled: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-500",
  in_progress: "bg-sky-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

function isOverdue(f: FollowUpWithNames) {
  if (!f.due_date) return false;
  if (f.status === "completed" || f.status === "cancelled") return false;
  return new Date(f.due_date) < new Date(new Date().toDateString());
}

function getInitials(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "?";
}

export function FollowUpTable({ followUps }: { followUps: FollowUpWithNames[] }) {
  if (followUps.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-6 w-6" />}
        title="No follow-ups found"
        description="Create a follow-up task to track outreach and care."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[28%]">Task</TableHead>
            <TableHead>Related To</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {followUps.map((f) => {
            const overdue = isOverdue(f);
            const relatedName = f.member_name ?? f.visitor_name ?? null;
            return (
              <TableRow key={f.id} className="group transition-colors hover:bg-accent/40">
                <TableCell>
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        overdue ? "bg-rose-50 text-rose-600" : "bg-accent text-primary",
                      )}
                    >
                      {overdue ? <AlarmClock className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{f.task}</p>
                      {overdue && (
                        <p className="text-xs font-medium text-rose-600">Overdue</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {relatedName ? (
                    <span className="inline-flex items-center gap-2">
                      <Avatar firstName={relatedName.split(" ")[0]} lastName={relatedName.split(" ")[1]} size="sm" />
                      <span className="text-sm font-medium">{relatedName}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {f.assignee_name ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                        {getInitials(f.assignee_name)}
                      </span>
                      {f.assignee_name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {f.due_date ? (
                    <span className={cn("text-sm", overdue ? "font-semibold text-rose-600" : "text-muted-foreground")}>
                      {formatDate(f.due_date)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[f.status] ?? "secondary"}>
                    <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", STATUS_DOT[f.status])} />
                    {STATUS_LABELS[f.status] ?? f.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {f.status !== "completed" && (
                      <form action={completeFollowUp.bind(null, f.id)}>
                        <button
                          type="submit"
                          aria-label="Mark as completed"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/dashboard/follow-ups/${f.id}/edit`}
                      aria-label="Edit follow-up"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
