import { PageHeader } from "@/components/ui/stat-card";
import { MemberForm } from "@/components/members/member-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Add Member",
};

export default function NewMemberPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Add Member" description="Create a new member record." />
      <Card>
        <CardContent className="p-6">
          <MemberForm />
        </CardContent>
      </Card>
    </div>
  );
}
