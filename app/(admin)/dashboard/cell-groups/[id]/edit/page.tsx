import { notFound } from "next/navigation";
import { getCellGroup, getAllMembers } from "@/lib/queries/cell-groups";
import { CellGroupForm } from "@/components/cell-groups/cell-group-form";
import { PageHeader } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function EditCellGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cellGroup = await getCellGroup(id);

  if (!cellGroup) {
    notFound();
  }

  const members = await getAllMembers();

  return (
    <div>
      <PageHeader
        title="Edit Cell Group"
        description={`Update details for ${cellGroup.name}.`}
      />
      <div className="max-w-2xl rounded-xl border bg-card shadow-sm p-6">
        <CellGroupForm cellGroup={cellGroup} members={members} />
      </div>
    </div>
  );
}
