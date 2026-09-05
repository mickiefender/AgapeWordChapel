import Link from "next/link";
import { getMembers } from "@/lib/queries/members";
import { MemberTable } from "@/components/members/member-table";
import { PageHeader, StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserPlus,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const search = str(params.search) ?? "";
  const status = str(params.status) ?? "";
  const gender = str(params.gender) ?? "";
  const page = parseInt(str(params.page) ?? "1", 10);

  const { members, total, page: currentPage, pageSize } = await getMembers({
    search,
    status,
    gender,
    page,
  });

  const totalPages = Math.ceil(total / pageSize);

  const activeCount = members.filter((m) =>
    ["active_member", "worker", "leader"].includes(m.membership_status),
  ).length;

  const newThisMonth = members.filter((m) => {
    const now = new Date();
    const d = new Date(m.created_at ?? 0);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const buildQuery = (p: number) => {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (status) qs.set("status", status);
    if (gender) qs.set("gender", gender);
    qs.set("page", String(p));
    return `/dashboard/members?${qs.toString()}`;
  };

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage and track every person in your church's membership directory."
        actions={
          <Button asChild>
            <Link href="/dashboard/members/new">
              <Plus className="h-4 w-4" />
              Add Member
            </Link>
          </Button>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={total}
          icon={Users}
          description="in the directory"
          iconTone="primary"
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={UserCheck}
          description="on this page"
          iconTone="emerald"
        />
        <StatCard
          title="New This Month"
          value={newThisMonth}
          icon={UserPlus}
          description="on this page"
          iconTone="amber"
        />
        <StatCard
          title="On This Page"
          value={members.length}
          icon={Users}
          description={`page ${currentPage} of ${totalPages}`}
          iconTone="sky"
        />
      </div>

      {/* Filter bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <form method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by name, email, phone…"
                defaultValue={search}
                className="pl-9"
              />
            </div>
            <Select name="status" defaultValue={status}>
              <option value="">All statuses</option>
              <option value="visitor">Visitor</option>
              <option value="new_convert">New Convert</option>
              <option value="new_member">New Member</option>
              <option value="active_member">Active Member</option>
              <option value="worker">Worker</option>
              <option value="leader">Leader</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Select name="gender" defaultValue={gender}>
              <option value="">All genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Filter
              </Button>
              <Button variant="ghost" asChild aria-label="Clear filters" className="px-2">
                <Link href="/dashboard/members">
                  <X className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results meta + pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {from}–{to}
          </span>{" "}
          of <span className="font-medium text-foreground">{total}</span> members
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildQuery(currentPage - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildQuery(currentPage + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <MemberTable members={members} />
    </div>
  );
}
