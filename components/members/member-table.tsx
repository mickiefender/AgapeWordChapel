import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Pencil, Eye, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MEMBER_STATUS_LABELS, type Member, type MemberStatus } from "@/types";

const statusVariant: Record<MemberStatus, "default" | "success" | "info" | "warning" | "secondary" | "destructive" | "outline"> = {
  visitor: "secondary",
  new_convert: "warning",
  new_member: "info",
  active_member: "success",
  worker: "default",
  leader: "info",
  inactive: "destructive",
};

export function MemberTable({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="No members found"
        description="Try adjusting your search or filters to find the member you're looking for."
        className="rounded-xl border-solid border-border/80 bg-card shadow-card"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-card">
      <Table>
        <TableHeader className="border-b border-border bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-12 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Member
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Phone
            </TableHead>
            <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
              Joined
            </TableHead>
            <TableHead className="h-12 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow
              key={m.id}
              className="group border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
            >
              <TableCell className="px-6 py-4">
                <Link href={`/dashboard/members/${m.id}`} className="flex items-center gap-3">
                  <Avatar src={m.avatar_url} firstName={m.first_name} lastName={m.last_name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {m.first_name} {m.last_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.email ?? "No email on file"}
                    </p>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[m.membership_status] ?? "outline"} className="whitespace-nowrap">
                  {MEMBER_STATUS_LABELS[m.membership_status] ?? m.membership_status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  {m.phone ?? "—"}
                </span>
              </TableCell>
              <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground md:table-cell">
                {m.membership_date ? formatDate(m.membership_date) : "—"}
              </TableCell>
              <TableCell className="py-4 pr-6">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/dashboard/members/${m.id}`}
                    aria-label={`View ${m.first_name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/members/${m.id}/edit`}
                    aria-label={`Edit ${m.first_name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-accent-foreground"
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
