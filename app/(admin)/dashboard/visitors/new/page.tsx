import { getAssignedProfiles } from "@/lib/queries/visitors";
import { VisitorForm } from "@/components/visitors/visitor-form";
import { PageHeader } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function NewVisitorPage() {
  const assignees = await getAssignedProfiles();

  return (
    <div>
      <PageHeader
        title="Add Visitor"
        description="Register a new visitor to Agape Word Chapel International."
      />
      <div className="max-w-2xl rounded-xl border bg-card shadow-sm p-6">
        <VisitorForm assignees={assignees} />
      </div>
    </div>
  );
}
