import { notFound } from "next/navigation";
import { getPrayerRequest } from "@/lib/queries/prayer-requests";
import { PrayerRequestForm } from "@/components/prayer-requests/prayer-request-form";
import { PageHeader } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function EditPrayerRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prayerRequest = await getPrayerRequest(id);

  if (!prayerRequest) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Prayer Request"
        description={`Update details for ${prayerRequest.requester_name ?? "this prayer request"}.`}
      />
      <div className="max-w-2xl rounded-xl border bg-card shadow-sm p-6">
        <PrayerRequestForm prayerRequest={prayerRequest} />
      </div>
    </div>
  );
}
