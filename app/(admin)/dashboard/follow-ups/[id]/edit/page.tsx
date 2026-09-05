import { notFound } from "next/navigation";
import { getFollowUp, getMembersForFollowUp, getVisitorsForFollowUp, getProfilesForFollowUp } from "@/lib/queries/follow-ups";
import { FollowUpForm } from "@/components/follow-ups/follow-up-form";
import { PageHeader } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EditFollowUpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const followUp = await getFollowUp(id);

  if (!followUp) {
    notFound();
  }

  const [members, visitors, profiles] = await Promise.all([
    getMembersForFollowUp(),
    getVisitorsForFollowUp(),
    getProfilesForFollowUp(),
  ]);

  return (
    <div>
      <PageHeader
        title="Edit Follow-up"
        description="Update the details of this follow-up task."
      />
      <Card className="max-w-2xl p-6 shadow-soft">
        <FollowUpForm followUp={followUp} members={members} visitors={visitors} profiles={profiles} />
      </Card>
    </div>
  );
}
