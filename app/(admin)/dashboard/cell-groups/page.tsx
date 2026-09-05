import Link from "next/link";
import { getCellGroups } from "@/lib/queries/cell-groups";
import { CellGroupTable } from "@/components/cell-groups/cell-group-table";
import { PageHeader } from "@/components/ui/stat-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Network, Plus, UsersRound, UserRoundCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CellGroupsPage() {
  const cellGroups = await getCellGroups();
  const totalMembers = cellGroups.reduce((total, group) => total + group.member_count, 0);
  const groupsWithLeaders = cellGroups.filter((group) => group.leader_id).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Cell Groups"
        description="Coordinate discipleship, fellowship, and care across your small groups."
        actions={
          <Button asChild>
            <Link href="/dashboard/cell-groups/new">
              <Plus className="h-4 w-4" />
              Add Cell Group
            </Link>
          </Button>
        }
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total groups"
          value={cellGroups.length}
          description="Active cell groups"
          icon={Network}
          iconTone="primary"
        />
        <StatCard
          title="People connected"
          value={totalMembers}
          description="Across all cell groups"
          icon={UsersRound}
          iconTone="emerald"
        />
        <StatCard
          title="With a leader"
          value={groupsWithLeaders}
          description={`${cellGroups.length - groupsWithLeaders} still need a leader`}
          icon={UserRoundCheck}
          iconTone="violet"
        />
      </div>

      <CellGroupTable cellGroups={cellGroups} />
    </div>
  );
}
