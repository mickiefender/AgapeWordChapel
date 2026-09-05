import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  MessageCircleHeart,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

function change(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function Signal({ value, label }: { value: number; label: string }) {
  const positive = value >= 0;
  return <span className={`inline-flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-700" : "text-rose-700"}`}>{positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{Math.abs(value).toFixed(1)}% {label}</span>;
}

export default async function InsightsPage() {
  await requireAdmin();
  const data = await getDashboardData();
  const { stats } = data;
  const latestMembership = data.membershipGrowth.at(-1)?.value ?? 0;
  const previousMembership = data.membershipGrowth.at(-2)?.value ?? 0;
  const latestAttendance = data.attendanceTrend.at(-1)?.value ?? 0;
  const previousAttendance = data.attendanceTrend.at(-2)?.value ?? 0;
  const latestGiving = data.givingTrend.at(-1)?.value ?? 0;
  const previousGiving = data.givingTrend.at(-2)?.value ?? 0;
  const largestDepartment = [...data.departmentParticipation].sort((a, b) => b.count - a.count)[0];
  const largestCellGroup = [...data.cellGroupAttendance].sort((a, b) => b.count - a.count)[0];
  const attentionItems = [
    stats.pendingFollowUps > 0 ? { icon: ClipboardList, tone: "amber", title: `${stats.pendingFollowUps} follow-up${stats.pendingFollowUps === 1 ? "" : "s"} need attention`, text: "Prioritize member care tasks before they become overdue.", href: "/dashboard/follow-ups", action: "Open follow-ups" } : null,
    stats.upcomingEvents === 0 ? { icon: CalendarCheck, tone: "sky", title: "No upcoming events scheduled", text: "Keep the church calendar visible and plan the next connection point.", href: "/dashboard/events", action: "Plan an event" } : null,
    stats.activeMembers === 0 ? { icon: Users, tone: "rose", title: "No active members recorded", text: "Review member statuses to keep engagement reporting accurate.", href: "/dashboard/members", action: "Review members" } : null,
  ].filter(Boolean) as { icon: typeof ClipboardList; tone: string; title: string; text: string; href: string; action: string }[];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader title="Insights" description="Turn church activity into clear priorities for ministry leaders." actions={<Button asChild variant="outline"><Link href="/dashboard/reports"><TrendingUp className="h-4 w-4" /> View reports</Link></Button>} />

      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-card to-violet-50/40">
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl"><Badge variant="default"><Sparkles className="mr-1 h-3.5 w-3.5" /> Ministry pulse</Badge><h2 className="mt-3 text-2xl font-bold tracking-tight">Your next best actions are clear.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Use these signals to focus leadership conversations, strengthen member care, and invest in the ministries creating the most connection.</p></div>
          <div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-xl bg-background/80 px-4 py-3"><p className="text-2xl font-bold">{stats.activeMembers}</p><p className="text-xs text-muted-foreground">Active members</p></div><div className="rounded-xl bg-background/80 px-4 py-3"><p className="text-2xl font-bold">{stats.weekAttendance}</p><p className="text-xs text-muted-foreground">Weekly check-ins</p></div><div className="rounded-xl bg-background/80 px-4 py-3"><p className="text-2xl font-bold">{stats.pendingFollowUps}</p><p className="text-xs text-muted-foreground">Care tasks</p></div></div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Membership momentum" value={latestMembership} description="New members this month" icon={Users} iconTone="primary" />
        <StatCard title="Attendance momentum" value={latestAttendance} description="Latest monthly check-ins" icon={CalendarCheck} iconTone="emerald" />
        <StatCard title="Giving momentum" value={money.format(latestGiving)} description="Latest monthly giving" icon={Wallet} iconTone="violet" />
        <StatCard title="Care workload" value={stats.pendingFollowUps} description="Pending follow-ups" icon={MessageCircleHeart} iconTone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Growth signal</CardTitle></CardHeader><CardContent><Signal value={change(latestMembership, previousMembership)} label="vs last month" /><p className="mt-3 text-sm text-muted-foreground">Membership growth is a useful indicator of connection and follow-up effectiveness.</p><Button asChild variant="link" className="mt-3 px-0"><Link href="/dashboard/members">Review membership <ArrowRight className="h-4 w-4" /></Link></Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-emerald-600" /> Engagement signal</CardTitle></CardHeader><CardContent><Signal value={change(latestAttendance, previousAttendance)} label="vs last month" /><p className="mt-3 text-sm text-muted-foreground">Attendance trends can reveal which services and groups need encouragement.</p><Button asChild variant="link" className="mt-3 px-0"><Link href="/dashboard/attendance">Explore attendance <ArrowRight className="h-4 w-4" /></Link></Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-4 w-4 text-violet-600" /> Stewardship signal</CardTitle></CardHeader><CardContent><Signal value={change(latestGiving, previousGiving)} label="vs last month" /><p className="mt-3 text-sm text-muted-foreground">Use giving patterns to guide transparent planning and responsible stewardship.</p><Button asChild variant="link" className="mt-3 px-0"><Link href="/dashboard/finance/reports">Review finance <ArrowRight className="h-4 w-4" /></Link></Button></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Ministry strengths</CardTitle></CardHeader><CardContent className="space-y-4">{largestDepartment ? <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4"><div><p className="text-sm text-muted-foreground">Most connected department</p><p className="mt-1 font-semibold">{largestDepartment.name}</p></div><span className="text-2xl font-bold text-primary">{largestDepartment.count}</span></div> : null}{largestCellGroup ? <div className="flex items-center justify-between rounded-lg bg-violet-50 p-4"><div><p className="text-sm text-muted-foreground">Leading cell group</p><p className="mt-1 font-semibold">{largestCellGroup.name}</p></div><span className="text-2xl font-bold text-violet-700">{largestCellGroup.count}</span></div> : null}{!largestDepartment && !largestCellGroup && <p className="text-sm text-muted-foreground">Add departments and cell group reports to see ministry strengths.</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-600" /> Recommended focus</CardTitle></CardHeader><CardContent className="space-y-3">{attentionItems.length === 0 ? <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /><div><p className="font-medium text-emerald-800">Everything looks on track</p><p className="mt-1 text-sm text-emerald-700">There are no urgent data signals requiring attention right now.</p></div></div> : attentionItems.map((item) => { const Icon = item.icon; return <div key={item.title} className="flex items-start gap-3 rounded-lg border p-4"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="font-medium">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.text}</p><Button asChild variant="link" size="sm" className="mt-1 h-auto px-0"><Link href={item.href}>{item.action} <ArrowRight className="h-3.5 w-3.5" /></Link></Button></div></div>; })}</CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-primary" /> Insight checklist</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-3"><div className="rounded-lg border p-4"><p className="font-medium">Connect</p><p className="mt-1 text-sm text-muted-foreground">Review visitors and new members who need a personal touch.</p><Button asChild variant="link" className="mt-2 px-0"><Link href="/dashboard/follow-ups">Open care queue <ArrowRight className="h-4 w-4" /></Link></Button></div><div className="rounded-lg border p-4"><p className="font-medium">Mobilize</p><p className="mt-1 text-sm text-muted-foreground">Use participation data to encourage departments and cell leaders.</p><Button asChild variant="link" className="mt-2 px-0"><Link href="/dashboard/duty-roster">View duty roster <ArrowRight className="h-4 w-4" /></Link></Button></div><div className="rounded-lg border p-4"><p className="font-medium">Steward</p><p className="mt-1 text-sm text-muted-foreground">Keep financial decisions grounded in reconciled, current records.</p><Button asChild variant="link" className="mt-2 px-0"><Link href="/dashboard/finance/reconciliation">Reconcile finance <ArrowRight className="h-4 w-4" /></Link></Button></div></CardContent></Card>
    </div>
  );
}
