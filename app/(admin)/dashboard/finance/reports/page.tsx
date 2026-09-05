import Link from "next/link";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, BarChart3, CalendarDays, WalletCards } from "lucide-react";
import { requireFinance } from "@/lib/auth";
import { getFinanceReport } from "@/lib/queries/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard } from "@/components/ui/stat-card";
import { PrintReportButton } from "@/components/finance/print-report-button";

export const dynamic = "force-dynamic";
const money = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function FinanceReportsPage({ searchParams }: { searchParams: Promise<{ start?: string; end?: string }> }) {
  await requireFinance();
  const params = await searchParams;
  const report = await getFinanceReport(params.start, params.end);
  const maxMonth = Math.max(...report.monthly.flatMap((month) => [month.income, month.expenses]), 1);

  return (
    <div className="mx-auto max-w-7xl space-y-7 print:max-w-none print:space-y-4">
      <PageHeader title="Finance reports" description="Review financial performance across a selected reporting period." actions={<div className="flex gap-2 print:hidden"><Button asChild variant="outline"><Link href="/dashboard/finance"><ArrowLeft className="h-4 w-4" /> Finance overview</Link></Button><PrintReportButton /></div>} />
      <Card className="print:hidden"><CardContent className="p-5"><form className="flex flex-col gap-4 sm:flex-row sm:items-end"><label className="flex-1 space-y-1.5 text-sm font-medium">From<Input name="start" type="date" defaultValue={report.startDate} /></label><label className="flex-1 space-y-1.5 text-sm font-medium">To<Input name="end" type="date" defaultValue={report.endDate} /></label><Button type="submit"><CalendarDays className="h-4 w-4" /> Generate report</Button></form></CardContent></Card>
      <div className="hidden print:block"><h1 className="text-2xl font-bold">Agape Word Chapel International</h1><p className="text-sm text-muted-foreground">Finance report: {report.startDate} to {report.endDate}</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Income" value={money.format(report.income)} description={`${report.donationCount} giving entries`} icon={ArrowDownLeft} iconTone="emerald" />
        <StatCard title="Approved expenses" value={money.format(report.expenses)} description={`${report.expenseCount} approved entries`} icon={ArrowUpRight} iconTone="rose" />
        <StatCard title="Net position" value={money.format(report.net)} description="Income less approved expenses" icon={WalletCards} iconTone={report.net >= 0 ? "primary" : "amber"} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Monthly performance</CardTitle><p className="mt-1 text-sm text-muted-foreground">Income and approved expenses</p></div><Badge variant="outline"><BarChart3 className="mr-1 h-3.5 w-3.5" /> GHS</Badge></CardHeader><CardContent><div className="flex h-56 items-end gap-2 sm:gap-4">{report.monthly.map((month) => <div key={month.label} className="flex min-w-0 flex-1 flex-col items-center gap-2"><div className="flex h-44 w-full items-end justify-center gap-1"><div className="w-1/2 rounded-t bg-emerald-400" style={{ height: `${Math.max((month.income / maxMonth) * 100, month.income ? 4 : 1)}%` }} /><div className="w-1/2 rounded-t bg-rose-300" style={{ height: `${Math.max((month.expenses / maxMonth) * 100, month.expenses ? 4 : 1)}%` }} /></div><span className="truncate text-[11px] text-muted-foreground">{month.label}</span></div>)}</div><div className="mt-4 flex gap-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-400" />Income</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-rose-300" />Expenses</span></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Income by category</CardTitle></CardHeader><CardContent className="space-y-4">{report.incomeByCategory.length === 0 ? <p className="text-sm text-muted-foreground">No income recorded for this period.</p> : report.incomeByCategory.slice(0, 6).map((item) => <div key={item.label} className="flex items-center justify-between gap-4"><span className="text-sm font-medium">{titleCase(item.label)}</span><span className="text-sm font-semibold text-emerald-700">{money.format(item.value)}</span></div>)}</CardContent></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Expense categories</CardTitle></CardHeader><CardContent className="space-y-4">{report.expensesByCategory.length === 0 ? <p className="text-sm text-muted-foreground">No approved expenses recorded for this period.</p> : report.expensesByCategory.slice(0, 8).map((item) => <div key={item.label} className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"><span className="text-sm font-medium">{titleCase(item.label)}</span><span className="text-sm font-semibold text-rose-700">{money.format(item.value)}</span></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Report notes</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>Income is calculated from recorded donations in the selected period.</p><p>Expenses include approved entries only, keeping pending requests out of financial performance totals.</p><p>Use the print action to save or share a clean PDF copy of this report.</p></CardContent></Card>
      </div>
    </div>
  );
}
