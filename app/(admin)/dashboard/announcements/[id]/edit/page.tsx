import { notFound } from "next/navigation";
import { getAnnouncement } from "@/lib/queries/announcements";
import { AnnouncementForm } from "@/components/announcements/announcement-form";
import { PageHeader } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);

  if (!announcement) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Announcement"
        description={`Update details for ${announcement.title}.`}
      />
      <div className="max-w-2xl rounded-xl border bg-card shadow-sm p-6">
        <AnnouncementForm announcement={announcement} />
      </div>
    </div>
  );
}
