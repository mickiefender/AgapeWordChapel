import { CalendarCheck2, CalendarClock, ListChecks, UsersRound } from "lucide-react";
import { getDutyRoster } from "@/lib/queries/duty-roster";
import { DutyRosterTable } from "@/components/duty-roster/duty-roster-table";
import { PageHeader, StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DutyRosterPage() {
  const rows = await getDutyRoster();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = rows.filter((row) => row.date >= today);
  const serviceCount = new Set(upcoming.map((row) => row.serviceId)).size;
  const roleCount = new Set(rows.map((row) => row.role.toLowerCase())).size;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Duty Roster"
        description="Keep every service covered with a clear, dependable schedule."
        actions={
          <Button asChild>
            <Link href="/dashboard/services">
              <CalendarClock className="h-4 w-4" />
              Manage services
            </Link>
          </Button>
        }
      />
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Upcoming assignments" value={upcoming.length} description="Duties still ahead" icon={CalendarCheck2} iconTone="primary" />
        <StatCard title="Scheduled services" value={serviceCount} description="Services with coverage" icon={CalendarClock} iconTone="emerald" />
        <StatCard title="People serving" value={new Set(upcoming.map((row) => row.memberId)).size} description="Unique upcoming servants" icon={UsersRound} iconTone="violet" />
        <StatCard title="Duty roles" value={roleCount} description="Roles represented in roster" icon={ListChecks} iconTone="amber" />
      </div>
      <DutyRosterTable rows={rows} />
    </div>
  );
}
