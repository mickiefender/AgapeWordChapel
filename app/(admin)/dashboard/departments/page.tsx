import Link from "next/link";
import { getDepartments } from "@/lib/queries/departments";
import { DepartmentTable } from "@/components/departments/department-table";
import { PageHeader } from "@/components/ui/stat-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, UsersRound, UserRoundCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const departments = await getDepartments();
  const totalMembers = departments.reduce((total, department) => total + department.member_count, 0);
  const departmentsWithLeaders = departments.filter((department) => department.leader_id).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Departments"
        description="Organize your church ministries, leaders, and teams."
        actions={
          <Button asChild>
            <Link href="/dashboard/departments/new">
              <Plus className="h-4 w-4" />
              Add Department
            </Link>
          </Button>
        }
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total departments"
          value={departments.length}
          description="Active ministry teams"
          icon={Building2}
          iconTone="primary"
        />
        <StatCard
          title="People serving"
          value={totalMembers}
          description="Across all departments"
          icon={UsersRound}
          iconTone="emerald"
        />
        <StatCard
          title="With a leader"
          value={departmentsWithLeaders}
          description={`${departments.length - departmentsWithLeaders} still need a leader`}
          icon={UserRoundCheck}
          iconTone="violet"
        />
      </div>

      <DepartmentTable departments={departments} />
    </div>
  );
}
