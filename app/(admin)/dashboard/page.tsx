import { getDashboardData } from "@/lib/queries/dashboard";
import { StatCard, PageHeader } from "@/components/ui/stat-card";
import { TrendChart, ParticipationBarChart, GrowthLegendChart } from "@/components/dashboard/charts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserPlus,
  CalendarCheck,
  CalendarDays,
  Clock,
  Wallet,
  ClipboardList,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusBadgeVariant: Record<string, "default" | "success" | "info" | "warning" | "secondary" | "destructive" | "outline"> = {
  active_member: "success",
  worker: "default",
  leader: "info",
  new_member: "warning",
  new_convert: "warning",
  visitor: "secondary",
  inactive: "destructive",
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { stats } = data;

  const givingGrowth =
    data.givingTrend.length >= 2
      ? (() => {
          const last = data.givingTrend[data.givingTrend.length - 1].value;
          const prev = data.givingTrend[data.givingTrend.length - 2].value;
          if (prev === 0) return null;
          return ((last - prev) / prev) * 100;
        })()
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="A summary of what's happening across Agape Word Chapel International."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/reports">
                <ClipboardList className="h-4 w-4" />
                Reports
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/members/new">
                <UserPlus className="h-4 w-4" />
                New Member
              </Link>
            </Button>
          </div>
        }
      />

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          description="across the church"
          iconTone="primary"
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          icon={UserCheck}
          trend="+2.1%"
          trendPositive
          description="this month"
          iconTone="emerald"
        />
        <StatCard
          title="New Members"
          value={stats.newMembers}
          icon={UserPlus}
          description="this month"
          iconTone="amber"
        />
        <StatCard
          title="Visitors"
          value={stats.visitors}
          icon={UserPlus}
          description="waiting to connect"
          iconTone="sky"
        />
      </div>

      {/* Engagement & giving stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Today's Attendance"
          value={stats.todayAttendance}
          icon={CalendarCheck}
          iconTone="primary"
        />
        <StatCard
          title="This Week's Attendance"
          value={stats.weekAttendance}
          icon={CalendarDays}
          description="this week"
          iconTone="emerald"
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={Clock}
          iconTone="amber"
        />
        <StatCard
          title="Giving"
          value={formatCurrency(stats.totalGiving)}
          icon={Wallet}
          trend={givingGrowth !== null ? `${givingGrowth >= 0 ? "+" : ""}${givingGrowth.toFixed(1)}%` : undefined}
          trendPositive={givingGrowth !== null ? givingGrowth >= 0 : true}
          description="total"
          iconTone="emerald"
        />
      </div>

      {/* Charts row 1 */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart
            title="Membership Growth"
            description="New members added per month"
            data={data.membershipGrowth}
            color="#b45309"
          />
        </div>
        <GrowthLegendChart
          title="Cell Group Participation"
          description="Total reported attendance by group"
          data={data.cellGroupAttendance}
        />
      </section>

      {/* Charts row 2 */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart
            title="Attendance Trends"
            description="Total check-ins per month"
            data={data.attendanceTrend}
            color="#0f766e"
          />
        </div>
        <ParticipationBarChart
          title="Department Participation"
          description="Members per department"
          data={data.departmentParticipation}
        />
      </section>

      {/* Charts row 3 */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart
            title="Visitor Growth"
            description="New visitors per month"
            data={data.visitorGrowth}
            color="#c2410c"
          />
        </div>
        <TrendChart
          title="Giving Trends"
          description="Total giving per month"
          data={data.givingTrend}
          color="#be185d"
          type="bar"
        />
      </section>

      {/* Lists */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Members */}
        <Card className="overflow-hidden lg:col-span-1">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">Recent Members</h3>
            </div>
            <Link
              href="/dashboard/members"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {data.recentMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <Users className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No members yet.</p>
              </div>
            ) : (
              data.recentMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-muted/40">
                  <Avatar
                    src={m.avatar_url}
                    firstName={m.name.split(" ")[0]}
                    lastName={m.name.split(" ")[1]}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(m.created_at)}</p>
                  </div>
                  <Badge variant={statusBadgeVariant[m.status] ?? "outline"}>
                    {m.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="overflow-hidden lg:col-span-1">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <CalendarDays className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">Upcoming Events</h3>
            </div>
            <Link
              href="/dashboard/events"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {data.upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No upcoming events.</p>
              </div>
            ) : (
              data.upcomingEvents.map((e) => {
                const date = new Date(e.start_date);
                return (
                  <div key={e.id} className="flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-muted/40">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-muted/50">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-base font-bold leading-none text-foreground">
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(e.start_date)}
                      </p>
                      {e.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {e.location}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
