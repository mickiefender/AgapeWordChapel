import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Megaphone, Pencil } from "lucide-react";
import type { Announcement } from "@/types";

export function AnnouncementTable({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) {
    return (
      <EmptyState
        icon={<Megaphone className="h-6 w-6" />}
        title="No announcements found"
        description="Create an announcement to communicate with your congregation."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Announcement</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Publish Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <Link href={`/dashboard/announcements/${a.id}`} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-primary">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <span className="font-medium hover:underline">{a.title}</span>
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{a.audience.replace(/_/g, " ")}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={a.published ? "default" : "secondary"}>
                  {a.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(a.publish_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/dashboard/announcements/${a.id}/edit`}
                  aria-label={`Edit ${a.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
