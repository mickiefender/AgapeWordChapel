import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  WalletCards,
} from "lucide-react";
import { getFinanceOverview } from "@/lib/queries/finance";
import { requireFinance } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 2,
});

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function FinancePage() {
  await requireFinance();
  const overview = await getFinanceOverview();
  const maxMonthValue = Math.max(...overview.monthlyTrend.flatMap((month) => [month.income, month.expenses]), 1);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Finance overview"
        description="A clear view of giving, spending, budgets, and the church’s current position."
        actions={
          <>
            <Button asChild>
              <Link href="/dashboard/finance/income">
                <ArrowDownLeft className="h-4 w-4" />
                Record income
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/finance/expenses">
                <ArrowUpRight className="h-4 w-4" />
                Manage expenses
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/finance/budgets">
                <CircleDollarSign className="h-4 w-4" />
                Manage budgets
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/finance/reconciliation">
                <BarChart3 className="h-4 w-4" />
                Reconcile
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/finance/reports">
                <BarChart3 className="h-4 w-4" />
                View reports
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total income" value={money.format(overview.totalIncome)} description="All recorded giving" icon={ArrowDownLeft} iconTone="emerald" />
        <StatCard title="Total expenses" value={money.format(overview.totalExpenses)} description="All recorded spending" icon={ArrowUpRight} iconTone="rose" />
        <StatCard title="Net balance" value={money.format(overview.balance)} description="Income less expenses" icon={WalletCards} iconTone={overview.balance >= 0 ? "primary" : "amber"} />
        <StatCard title="Active budget" value={money.format(overview.activeBudget)} description="Current budget allocation" icon={CircleDollarSign} iconTone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Six-month movement</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Income and expenses by month</p>
            </div>
            <Badge variant="outline"><CalendarDays className="mr-1 h-3.5 w-3.5" /> Last 6 months</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end gap-3 sm:gap-5">
              {overview.monthlyTrend.map((month) => (
                <div key={month.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end justify-center gap-1.5">
                    <div className="w-1/2 rounded-t-md bg-emerald-400" style={{ height: `${Math.max((month.income / maxMonthValue) * 100, month.income ? 4 : 1)}%` }} title={`Income ${money.format(month.income)}`} />
                    <div className="w-1/2 rounded-t-md bg-rose-300" style={{ height: `${Math.max((month.expenses / maxMonthValue) * 100, month.expenses ? 4 : 1)}%` }} title={`Expenses ${money.format(month.expenses)}`} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{month.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-400" />Income</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-rose-300" />Expenses</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This month</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Performance for the current month</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-4">
              <span className="text-sm font-medium text-emerald-800">Income</span>
              <span className="font-semibold text-emerald-800">{money.format(overview.currentMonthIncome)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-rose-50 p-4">
              <span className="text-sm font-medium text-rose-800">Expenses</span>
              <span className="font-semibold text-rose-800">{money.format(overview.currentMonthExpenses)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Monthly position</span>
                <span className="font-bold text-foreground">{money.format(overview.currentMonthIncome - overview.currentMonthExpenses)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { title: "Giving by category", items: overview.incomeByCategory, empty: "No giving has been recorded yet.", tone: "bg-emerald-400" },
          { title: "Spending by category", items: overview.expenseByCategory, empty: "No expenses have been recorded yet.", tone: "bg-rose-300" },
        ].map((section) => {
          const total = section.items.reduce((sum, item) => sum + item.value, 0);
          return (
            <Card key={section.title}>
              <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {section.items.length === 0 ? <p className="text-sm text-muted-foreground">{section.empty}</p> : section.items.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-medium">{titleCase(item.label)}</span>
                      <span className="text-muted-foreground">{money.format(item.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${section.tone}`} style={{ width: `${total ? (item.value / total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div><CardTitle>Recent activity</CardTitle><p className="mt-1 text-sm text-muted-foreground">The latest recorded financial entries</p></div>
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard/finance/transactions">View all <ChevronRight className="h-4 w-4" /></Link></Button>
        </CardHeader>
        <CardContent>
          {overview.activities.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No financial activity has been recorded yet.</div>
          ) : (
            <div className="divide-y">
              {overview.activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {activity.type === "income" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0"><p className="truncate text-sm font-medium">{activity.description}</p><p className="text-xs text-muted-foreground">{titleCase(activity.label)} · {activity.date}</p></div>
                  </div>
                  <span className={`shrink-0 text-sm font-semibold ${activity.type === "income" ? "text-emerald-700" : "text-rose-700"}`}>{activity.type === "income" ? "+" : "-"}{money.format(activity.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
