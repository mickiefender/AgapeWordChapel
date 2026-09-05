import { notFound } from "next/navigation";
import { getVisitor, getAssignedProfiles } from "@/lib/queries/visitors";
import { VisitorForm } from "@/components/visitors/visitor-form";
import { PageHeader } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function EditVisitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visitor = await getVisitor(id);

  if (!visitor) {
    notFound();
  }

  const assignees = await getAssignedProfiles();

  return (
    <div>
      <PageHeader
        title="Edit Visitor"
        description={`Update visitor details for ${visitor.full_name}.`}
      />
      <div className="max-w-2xl rounded-xl border bg-card shadow-sm p-6">
        <VisitorForm visitor={visitor} assignees={assignees} />
      </div>
    </div>
  );
}
