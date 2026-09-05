import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Users,
  UserPlus,
  Wallet,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries/dashboard";
import { TrendChart, ParticipationBarChart, GrowthLegendChart } from "@/components/dashboard/charts";
import { PrintReportButton } from "@/components/finance/print-report-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/utils";

const money = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requireAdmin();
  const data = await getDashboardData();
  const { stats } = data;
  const attendanceAverage = data.attendanceTrend.length
    ? Math.round(data.attendanceTrend.reduce((sum, item) => sum + item.value, 0) / data.attendanceTrend.length)
    : 0;
  const givingAverage = data.givingTrend.length
    ? data.givingTrend.reduce((sum, item) => sum + item.value, 0) / data.givingTrend.length
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-7 print:max-w-none print:space-y-4">
      <PageHeader
        title="Church reports"
        description="A professional snapshot of membership, engagement, attendance, and giving."
        actions={
          <div className="flex gap-2 print:hidden">
            <Button asChild variant="outline">
              <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
            </Button>
            <PrintReportButton />
          </div>
        }
      />

      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">Agape Word Chapel International</h1>
        <p className="text-sm text-muted-foreground">Church activity report · Generated {formatDate(new Date())}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total members" value={stats.totalMembers} description={`${stats.activeMembers} active members`} icon={Users} iconTone="primary" />
        <StatCard title="Attendance this week" value={stats.weekAttendance} description={`${stats.todayAttendance} checked in today`} icon={CalendarCheck} iconTone="emerald" />
        <StatCard title="New members" value={stats.newMembers} description="Added this month" icon={UserPlus} iconTone="amber" />
        <StatCard title="Total giving" value={money.format(stats.totalGiving)} description="Recorded giving" icon={Wallet} iconTone="violet" />
      </div>

      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge variant="default">Executive summary</Badge>
            <h2 className="mt-3 text-xl font-bold tracking-tight">Your church is growing with purpose.</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              There are {stats.activeMembers} active members, {stats.workers} workers, and {stats.pendingFollowUps} follow-ups currently needing attention.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-xl bg-background/70 px-4 py-3"><p className="text-2xl font-bold">{stats.workers}</p><p className="text-xs text-muted-foreground">Workers</p></div>
            <div className="rounded-xl bg-background/70 px-4 py-3"><p className="text-2xl font-bold">{stats.upcomingEvents}</p><p className="text-xs text-muted-foreground">Upcoming events</p></div>
            <div className="rounded-xl bg-background/70 px-4 py-3"><p className="text-2xl font-bold">{stats.activeCellGroups}</p><p className="text-xs text-muted-foreground">Cell groups</p></div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><TrendChart title="Membership growth" description="New members added over the last six months" data={data.membershipGrowth} color="#b45309" /></div>
        <Card>
          <CardHeader><CardTitle>Key indicators</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div><div className="mb-2 flex justify-between text-sm"><span className="text-muted-foreground">Average monthly attendance</span><strong>{attendanceAverage}</strong></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.min(attendanceAverage, 100)}%` }} /></div></div>
            <div><div className="mb-2 flex justify-between text-sm"><span className="text-muted-foreground">Average monthly giving</span><strong>{money.format(givingAverage)}</strong></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-violet-500" style={{ width: `${givingAverage ? 72 : 0}%` }} /></div></div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3"><span className="text-sm text-amber-800">Follow-ups pending</span><strong className="text-amber-800">{stats.pendingFollowUps}</strong></div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><TrendChart title="Attendance trends" description="Monthly check-ins across services and church activities" data={data.attendanceTrend} color="#0f766e" /></div>
        <GrowthLegendChart title="Cell group participation" description="Reported attendance by group" data={data.cellGroupAttendance} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><TrendChart title="Giving trends" description="Recorded giving by month" data={data.givingTrend} color="#7c3aed" type="bar" /></div>
        <ParticipationBarChart title="Department participation" description="Members assigned to departments" data={data.departmentParticipation} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-primary" /> Upcoming events</CardTitle><Button asChild variant="ghost" size="sm"><Link href="/dashboard/events">View all</Link></Button></CardHeader>
          <CardContent>{data.upcomingEvents.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming events.</p> : <div className="divide-y">{data.upcomingEvents.map((event) => <div key={event.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="font-medium">{event.title}</p><p className="text-xs text-muted-foreground">{event.location || "Church campus"}</p></div><Badge variant="outline">{formatDate(event.start_date)}</Badge></div>)}</div>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" /> Follow-up workload</CardTitle><Button asChild variant="ghost" size="sm"><Link href="/dashboard/follow-ups">Manage</Link></Button></CardHeader>
          <CardContent>{data.pendingFollowUps.length === 0 ? <p className="text-sm text-muted-foreground">No pending follow-ups.</p> : <div className="divide-y">{data.pendingFollowUps.map((followUp) => <div key={followUp.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="font-medium">{followUp.task}</p><p className="text-xs text-muted-foreground">{followUp.member_name || "Unassigned member"}</p></div><span className="text-xs text-muted-foreground">{followUp.due_date ? formatDate(followUp.due_date) : "No due date"}</span></div>)}</div>}</CardContent>
        </Card>
      </section>

      <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground print:hidden">
        <span>Need detailed financial analysis?</span>
        <Button asChild variant="link"><Link href="/dashboard/finance/reports">Open finance reports <ArrowUpRight className="h-4 w-4" /></Link></Button>
      </div>
    </div>
  );
}
