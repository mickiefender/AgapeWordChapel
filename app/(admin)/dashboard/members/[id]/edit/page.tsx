import { notFound } from "next/navigation";
import { getMember } from "@/lib/queries/members";
import { PageHeader } from "@/components/ui/stat-card";
import { MemberForm } from "@/components/members/member-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Edit Member",
};

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Edit Member"
        description={`Update ${member.first_name} ${member.last_name}'s record.`}
      />
      <Card>
        <CardContent className="p-6">
          <MemberForm member={member} />
        </CardContent>
      </Card>
    </div>
  );
}
