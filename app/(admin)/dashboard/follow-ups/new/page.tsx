import { getMembersForFollowUp, getVisitorsForFollowUp, getProfilesForFollowUp } from "@/lib/queries/follow-ups";
import { FollowUpForm } from "@/components/follow-ups/follow-up-form";
import { PageHeader } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function NewFollowUpPage() {
  const [members, visitors, profiles] = await Promise.all([
    getMembersForFollowUp(),
    getVisitorsForFollowUp(),
    getProfilesForFollowUp(),
  ]);

  return (
    <div>
      <PageHeader
        title="New Follow-up"
        description="Create a follow-up task to track outreach and care."
      />
      <Card className="max-w-2xl p-6 shadow-soft">
        <FollowUpForm members={members} visitors={visitors} profiles={profiles} />
      </Card>
    </div>
  );
}
