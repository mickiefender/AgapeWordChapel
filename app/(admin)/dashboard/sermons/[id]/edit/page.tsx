import { notFound } from "next/navigation";
import { getSermon } from "@/lib/queries/sermons";
import { SermonForm } from "@/components/sermons/sermon-form";
import { PageHeader } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function EditSermonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sermon = await getSermon(id);

  if (!sermon) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Sermon"
        description={`Update details for ${sermon.title}.`}
      />
      <div className="max-w-2xl rounded-xl border bg-card shadow-sm p-6">
        <SermonForm sermon={sermon} />
      </div>
    </div>
  );
}
