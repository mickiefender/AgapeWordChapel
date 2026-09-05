import Link from "next/link";
import { getAdminUsers } from "@/lib/queries/admin-users";
import { AdminUserTable } from "@/components/admin-users/admin-user-table";
import { PageHeader } from "@/components/ui/stat-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { requireSuperAdmin } from "@/lib/auth";
import { KeyRound, Plus, ShieldCheck, UsersRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireSuperAdmin();
  const users = await getAdminUsers();
  const superAdmins = users.filter((user) => user.role === "super_admin").length;
  const otherAdmins = users.length - superAdmins;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Admin Users"
        description="Manage access, roles, and permissions across your team."
        actions={
          <Button asChild>
            <Link href="/dashboard/admin-users/new">
              <Plus className="h-4 w-4" />
              Add User
            </Link>
          </Button>
        }
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total users"
          value={users.length}
          description="People with dashboard access"
          icon={UsersRound}
          iconTone="primary"
        />
        <StatCard
          title="Super administrators"
          value={superAdmins}
          description="Full system access"
          icon={ShieldCheck}
          iconTone="violet"
        />
        <StatCard
          title="Team administrators"
          value={otherAdmins}
          description="Role-based access"
          icon={KeyRound}
          iconTone="emerald"
        />
      </div>

      <AdminUserTable users={users} />
    </div>
  );
}
