import Link from "next/link";
import { notFound } from "next/navigation";
import { getCellGroup, getCellGroupMembers } from "@/lib/queries/cell-groups";
import { PageHeader } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Network, Pencil, Users, MapPin, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CellGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cellGroup = await getCellGroup(id);

  if (!cellGroup) {
    notFound();
  }

  const members = await getCellGroupMembers(id);

  return (
    <div>
      <PageHeader
        title={cellGroup.name}
        description="Cell group details"
        actions={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/cell-groups/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="text-sm font-semibold">Members ({members.length})</h3>
          </div>
          {members.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No members yet"
              description="Add members to this cell group from the member management page."
            />
          ) : (
            <div className="divide-y">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-6 py-3">
                  <Avatar src={m.avatar_url} firstName={m.first_name} lastName={m.last_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {m.first_name} {m.last_name}
                    </p>
                    {m.role && <p className="text-xs text-muted-foreground">{m.role}</p>}
                  </div>
                  {m.membership_status && (
                    <Badge variant="secondary">{m.membership_status.replace(/_/g, " ")}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Group Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{cellGroup.meeting_location ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Meeting</p>
                  <p className="text-sm font-medium">
                    {cellGroup.meeting_day ?? "—"} {cellGroup.meeting_time ? `· ${cellGroup.meeting_time}` : ""}
                  </p>
                </div>
              </div>
              {cellGroup.description && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{cellGroup.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
