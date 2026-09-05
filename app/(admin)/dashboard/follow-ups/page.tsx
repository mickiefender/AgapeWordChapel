import Link from "next/link";
import { getFollowUps, getFollowUpStats } from "@/lib/queries/follow-ups";
import { FollowUpTable } from "@/components/follow-ups/follow-up-table";
import { PageHeader, StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, ListTodo, Hourglass, AlarmClock, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const status = str(params.status) ?? "";
  const page = parseInt(str(params.page) ?? "1", 10);

  const [{ followUps, total, page: currentPage, pageSize }, stats] = await Promise.all([
    getFollowUps({ status, page }),
    getFollowUpStats(),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const pageHref = (p: number) =>
    `/dashboard/follow-ups?page=${p}${status ? `&status=${status}` : ""}`;

  return (
    <div>
      <PageHeader
        title="Follow-ups"
        description="Track outreach and care tasks across the church."
        actions={
          <Button asChild>
            <Link href="/dashboard/follow-ups/new">
              <Plus className="h-4 w-4" />
              New Follow-up
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={ListTodo}
          iconTone="primary"
          description="All follow-ups"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Hourglass}
          iconTone="amber"
          description="Awaiting action"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={AlarmClock}
          iconTone="rose"
          description="Past due date"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          iconTone="emerald"
          description="Finished"
        />
      </div>

      <Card className="mb-4 w-full p-4 shadow-soft">
        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select name="status" defaultValue={status} className="sm:w-56">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <div className="flex gap-2">
            <Button type="submit">Filter</Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/follow-ups">Clear</Link>
            </Button>
          </div>
        </form>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} follow-up{total !== 1 ? "s" : ""} found
        </p>
        {status && (
          <Link
            href="/dashboard/follow-ups"
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filters
          </Link>
        )}
      </div>

      <FollowUpTable followUps={followUps} />

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
