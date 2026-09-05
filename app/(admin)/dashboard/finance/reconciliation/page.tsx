import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert, Link2Off, RefreshCcw } from "lucide-react";
import { requireFinance } from "@/lib/auth";
import { getReconciliationData } from "@/lib/queries/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";
const money = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

export default async function ReconciliationPage() {
  await requireFinance();
  const data = await getReconciliationData();
  const incomeDifference = data.donationTotal - data.linkedIncomeTotal;
  const expenseDifference = data.expenseTotal - data.linkedExpenseTotal;
  const balanced = incomeDifference === 0 && expenseDifference === 0;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader title="Reconciliation" description="Compare recorded giving and approved expenses with the transaction ledger." actions={<Button asChild variant="outline"><Link href="/dashboard/finance"><ArrowLeft className="h-4 w-4" /> Finance overview</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Income difference" value={money.format(incomeDifference)} description="Donations less linked transactions" icon={incomeDifference === 0 ? CheckCircle2 : CircleAlert} iconTone={incomeDifference === 0 ? "emerald" : "amber"} />
        <StatCard title="Expense difference" value={money.format(expenseDifference)} description="Approved expenses less ledger entries" icon={expenseDifference === 0 ? CheckCircle2 : CircleAlert} iconTone={expenseDifference === 0 ? "emerald" : "amber"} />
        <StatCard title="Reconciliation status" value={balanced ? "Balanced" : "Review needed"} description={balanced ? "All totals match" : "Unmatched entries require attention"} icon={RefreshCcw} iconTone={balanced ? "emerald" : "rose"} />
      </div>
      <Card className={balanced ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40"}>
        <CardContent className="flex items-start gap-3 p-5">
          {balanced ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <CircleAlert className="mt-0.5 h-5 w-5 text-amber-600" />}
          <div><p className="font-semibold">{balanced ? "Ledger is balanced" : "Reconciliation needs review"}</p><p className="mt-1 text-sm text-muted-foreground">This view is read-only and identifies entries that are not connected to a transaction record.</p></div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        {[{ title: "Unmatched giving", entries: data.unmatchedDonations, empty: "All donations are linked.", color: "text-emerald-700" }, { title: "Unmatched approved expenses", entries: data.unmatchedExpenses, empty: "All approved expenses are linked.", color: "text-rose-700" }].map((section) => (
          <Card key={section.title}><CardHeader><CardTitle className="flex items-center justify-between">{section.title}<Badge variant="outline"><Link2Off className="mr-1 h-3.5 w-3.5" /> {section.entries.length}</Badge></CardTitle></CardHeader><CardContent>{section.entries.length === 0 ? <p className="text-sm text-muted-foreground">{section.empty}</p> : <div className="divide-y">{section.entries.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="font-medium">{entry.category}</p><p className="text-xs text-muted-foreground">{entry.date}</p></div><span className={`font-semibold ${section.color}`}>{money.format(entry.amount)}</span></div>)}</div>}</CardContent></Card>
        ))}
      </div>
    </div>
  );
}
