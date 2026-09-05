import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/queries/admin-users";
import { PageHeader } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireSuperAdmin } from "@/lib/auth";
import { Pencil, User } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;
  const user = await getAdminUser(id);

  if (!user) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        description={user.email ?? "User"}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/admin-users/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            User Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Full Name</p>
              <p className="mt-1">{user.first_name} {user.last_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="mt-1">{user.email ?? "—"}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Role</p>
              <Badge variant={user.role === "super_admin" ? "default" : "secondary"} className="mt-1">
                {ROLE_LABELS[user.role as Role] ?? user.role}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Phone</p>
              <p className="mt-1">{user.phone ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/admin-users">
            <User className="h-4 w-4" />
            Back to Admin Users
          </Link>
        </Button>
      </div>
    </div>
  );
}
