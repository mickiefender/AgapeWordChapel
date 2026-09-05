import Link from "next/link";
import { getServices } from "@/lib/queries/services";
import { ServiceTable } from "@/components/services/service-table";
import { PageHeader } from "@/components/ui/stat-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { CalendarClock, ListChecks, Plus, UsersRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await getServices();
  const totalItems = services.reduce((total, service) => total + service.item_count, 0);
  const totalAssignments = services.reduce((total, service) => total + service.assignment_count, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Service Planner"
        description="Plan gatherings, service orders, and duty assignments with confidence."
        actions={
          <Button asChild>
            <Link href="/dashboard/services/new">
              <Plus className="h-4 w-4" />
              Add Service
            </Link>
          </Button>
        }
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Planned services"
          value={services.length}
          description="Upcoming and completed gatherings"
          icon={CalendarClock}
          iconTone="primary"
        />
        <StatCard
          title="Order items"
          value={totalItems}
          description="Across all service plans"
          icon={ListChecks}
          iconTone="violet"
        />
        <StatCard
          title="Duty assignments"
          value={totalAssignments}
          description="People scheduled to serve"
          icon={UsersRound}
          iconTone="emerald"
        />
      </div>

      <ServiceTable services={services} />
    </div>
  );
}
