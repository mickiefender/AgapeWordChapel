import { notFound } from "next/navigation";
import { getDepartment, getAllMembers } from "@/lib/queries/departments";
import { DepartmentForm } from "@/components/departments/department-form";
import { PageHeader } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const department = await getDepartment(id);

  if (!department) {
    notFound();
  }

  const members = await getAllMembers();

  return (
    <div>
      <PageHeader
        title="Edit Department"
        description={`Update details for ${department.name}.`}
      />
      <div className="max-w-2xl rounded-xl border bg-card shadow-sm p-6">
        <DepartmentForm department={department} members={members} />
      </div>
    </div>
  );
}
