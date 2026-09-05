import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/queries/admin-users";
import { AdminUserForm } from "@/components/admin-users/admin-user-form";
import { PageHeader } from "@/components/ui/stat-card";
import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;
  const user = await getAdminUser(id);

  if (!user) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit User"
        description={`Update details for ${user.first_name} ${user.last_name}.`}
      />
      <div className="max-w-2xl rounded-xl border bg-card shadow-sm p-6">
        <AdminUserForm user={user} />
      </div>
    </div>
  );
}
