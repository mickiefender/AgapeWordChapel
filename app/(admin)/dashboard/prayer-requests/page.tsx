import Link from "next/link";
import { getPrayerRequests } from "@/lib/queries/prayer-requests";
import { PrayerRequestTable } from "@/components/prayer-requests/prayer-request-table";
import { PageHeader } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { HeartPulse, Plus, Sparkles } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function PrayerRequestsPage() {
  const prayerRequests = await getPrayerRequests();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Prayer Requests"
        description="Care for every request with focused follow-up and prayer."
        actions={
          <Button asChild>
            <Link href="/dashboard/prayer-requests/new">
              <Plus className="h-4 w-4" />
              Add Prayer Request
            </Link>
          </Button>
        }
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total requests" value={prayerRequests.length} description="All submitted requests" icon={HeartPulse} iconTone="rose" />
        <StatCard title="New requests" value={prayerRequests.filter((request) => request.status === "new").length} description="Waiting for attention" icon={Sparkles} iconTone="amber" />
        <StatCard title="In prayer" value={prayerRequests.filter((request) => request.status === "praying").length} description="Currently being covered" icon={HeartPulse} iconTone="primary" />
      </div>

      <PrayerRequestTable prayerRequests={prayerRequests} />
    </div>
  );
}
