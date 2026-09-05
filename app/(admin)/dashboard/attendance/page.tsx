import { getAttendanceMarkingOptions, getAttendanceSummary } from "@/lib/queries/attendance";
import { AttendanceTable } from "@/components/attendance/attendance-table";
import { MarkAttendance } from "@/components/attendance/mark-attendance";
import { PageHeader, StatCard } from "@/components/ui/stat-card";
import { CalendarCheck, CalendarDays, Clock3, UsersRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const summary = await getAttendanceSummary();
  const options = await getAttendanceMarkingOptions();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Attendance"
        description="Track participation across services, groups, departments, and events."
        actions={<MarkAttendance options={options} />}
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today"
          value={summary.today}
          description="Check-ins today"
          icon={CalendarCheck}
          iconTone="primary"
        />
        <StatCard
          title="This week"
          value={summary.thisWeek}
          description="Since Monday"
          icon={CalendarDays}
          iconTone="emerald"
        />
        <StatCard
          title="This month"
          value={summary.thisMonth}
          description="Current month"
          icon={Clock3}
          iconTone="violet"
        />
        <StatCard
          title="Recent records"
          value={summary.total}
          description="Latest 500 check-ins"
          icon={UsersRound}
          iconTone="sky"
        />
      </div>

      <AttendanceTable records={summary.records} />
    </div>
  );
}
