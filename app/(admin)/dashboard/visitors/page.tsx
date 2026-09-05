import Link from "next/link";
import { getVisitors, getVisitorStats } from "@/lib/queries/visitors";
import { VisitorTable } from "@/components/visitors/visitor-table";
import { PageHeader, StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Search, Users, UserPlus, CalendarClock, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const search = str(params.search) ?? "";
  const status = str(params.status) ?? "";
  const page = parseInt(str(params.page) ?? "1", 10);

  const [{ visitors, total, page: currentPage, pageSize }, stats] = await Promise.all([
    getVisitors({ search, status, page }),
    getVisitorStats(),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long" });
  const pageHref = (p: number) =>
    `/dashboard/visitors?page=${p}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`;

  return (
    <div>
      <PageHeader
        title="Visitors"
        description="Track and follow up with guests who visit Agape Word Chapel International."
        actions={
          <Button asChild>
            <Link href="/dashboard/visitors/new">
              <Plus className="h-4 w-4" />
              Add Visitor
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Visitors"
          value={stats.total}
          icon={Users}
          iconTone="primary"
          description="All time"
        />
        <StatCard
          title="New This Month"
          value={stats.newThisMonth}
          icon={UserPlus}
          iconTone="sky"
          description={`In ${monthLabel}`}
        />
        <StatCard
          title="Needs Follow-up"
          value={stats.needsFollowUp}
          icon={CalendarClock}
          iconTone="amber"
          description="New, contacted or follow-up"
        />
        <StatCard
          title="Joined"
          value={stats.joined}
          icon={UserCheck}
          iconTone="emerald"
          description="Became members"
        />
      </div>

      <Card className="mb-4 w-full p-4 shadow-soft">
        <form method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Search by name, email, phone…"
              defaultValue={search}
              className="pl-9"
            />
          </div>
          <Select name="status" defaultValue={status}>
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="follow_up">Follow-up</option>
            <option value="connected">Connected</option>
            <option value="joined">Joined</option>
            <option value="not_interested">Not Interested</option>
          </Select>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 sm:flex-none">
              Filter
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/visitors">Clear</Link>
            </Button>
          </div>
        </form>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} visitor{total !== 1 ? "s" : ""} found
        </p>
        {(search || status) && (
          <Link
            href="/dashboard/visitors"
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filters
          </Link>
        )}
      </div>

      <VisitorTable visitors={visitors} />

      {totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={pageHref(currentPage - 1)}>Previous</Link>
              </Button>
            )}
            {currentPage < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={pageHref(currentPage + 1)}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
