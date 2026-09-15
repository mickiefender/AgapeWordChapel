import Link from "next/link";
import { notFound } from "next/navigation";
import { getAvailableDepartmentMembers, getDepartment, getDepartmentMembers } from "@/lib/queries/departments";
import { AddDepartmentMembers } from "@/components/departments/add-department-members";
import { DepartmentGalleryManager } from "@/components/departments/department-gallery-manager";
import { PageHeader } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pencil, Users, ExternalLink, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const department = await getDepartment(id);

  if (!department) {
    notFound();
  }

  const members = await getDepartmentMembers(id);
  const availableMembers = await getAvailableDepartmentMembers(id);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={department.name}
        description={department.description ?? "Church department"}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/ministries/${id}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                View page
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/departments/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mt-6">
        <DepartmentGalleryManager
          departmentId={department.id}
          departmentName={department.name}
          coverImage={department.image_url}
          gallery={department.gallery ?? []}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
        <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-semibold tracking-tight">Members</h3>
            <p className="mt-1 text-xs text-muted-foreground">{members.length} people in this department</p>
            {department.video_url ? (
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Video className="h-3.5 w-3.5 text-primary" />
                Featured video
              </span>
            ) : null}
          </div>
          <AddDepartmentMembers departmentId={id} members={availableMembers} />
        </div>
        {members.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No members yet"
            description="Use Add members to assign people to this department."
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
    </div>
  );
}
