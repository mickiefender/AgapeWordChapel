import Link from "next/link";
import { ArrowLeft, Check, CircleAlert, Clock3, Plus, ReceiptText, X } from "lucide-react";
import { createExpense, reviewExpense } from "@/actions/finance";
import { requireFinance } from "@/lib/auth";
import { getExpenseRegister } from "@/lib/queries/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";
const money = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

function today() {
  return new Date().toISOString().slice(0, 10);
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const config = {
    pending: { label: "Pending review", variant: "warning" as const, icon: Clock3 },
    approved: { label: "Approved", variant: "success" as const, icon: Check },
    rejected: { label: "Rejected", variant: "destructive" as const, icon: CircleAlert },
  }[status];
  const Icon = config.icon;
  return <Badge variant={config.variant}><Icon className="mr-1 h-3.5 w-3.5" />{config.label}</Badge>;
}

export default async function ExpensesPage() {
  await requireFinance();
  const expenses = await getExpenseRegister();
  const pending = expenses.filter((expense) => expense.approvalStatus === "pending");
  const approvedTotal = expenses.filter((expense) => expense.approvalStatus === "approved").reduce((sum, expense) => sum + expense.amount, 0);
  const pendingTotal = pending.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Expenses & approvals"
        description="Capture spending requests and keep approval decisions visible to the finance team."
        actions={<Button asChild variant="outline"><Link href="/dashboard/finance"><ArrowLeft className="h-4 w-4" /> Finance overview</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Approved spending" value={money.format(approvedTotal)} description="Approved entries in register" icon={ReceiptText} iconTone="rose" />
        <StatCard title="Awaiting review" value={pending.length} description={money.format(pendingTotal) + " pending"} icon={Clock3} iconTone="amber" />
        <StatCard title="Total requests" value={expenses.length} description="Latest 100 expense entries" icon={CircleAlert} iconTone="violet" />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Submit expense</CardTitle><p className="text-sm text-muted-foreground">New expenses are created as pending until reviewed.</p></CardHeader>
        <CardContent>
          <form action={createExpense} className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1.5 text-sm font-medium">Category<Input name="category" placeholder="Utilities, transport, supplies..." required /></label>
            <label className="space-y-1.5 text-sm font-medium">Amount (GHS)<Input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required /></label>
            <label className="space-y-1.5 text-sm font-medium">Expense date<Input name="expense_date" type="date" defaultValue={today()} required /></label>
            <div className="flex items-end"><Button type="submit" className="w-full"><Plus className="h-4 w-4" /> Submit for review</Button></div>
            <label className="space-y-1.5 text-sm font-medium md:col-span-2 xl:col-span-4">Description<Input name="description" placeholder="What was this expense for?" /></label>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Expense register</CardTitle><p className="text-sm text-muted-foreground">Review pending requests and monitor approved or rejected entries.</p></CardHeader>
        <CardContent>
          {expenses.length === 0 ? <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No expenses have been recorded yet.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-3 py-3">Date</th><th className="px-3 py-3">Expense</th><th className="px-3 py-3">Submitted by</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Amount</th><th className="px-3 py-3 text-right">Review</th></tr></thead>
                <tbody className="divide-y">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/40">
                      <td className="whitespace-nowrap px-3 py-4 text-muted-foreground">{expense.expenseDate}</td>
                      <td className="px-3 py-4"><p className="font-medium">{expense.category}</p><p className="max-w-xs truncate text-xs text-muted-foreground">{expense.description || "No description"}</p></td>
                      <td className="px-3 py-4 text-muted-foreground">{expense.requesterName}</td>
                      <td className="px-3 py-4"><StatusBadge status={expense.approvalStatus} />{expense.rejectionReason && <p className="mt-1 max-w-xs text-xs text-destructive">{expense.rejectionReason}</p>}</td>
                      <td className="px-3 py-4 text-right font-semibold">{money.format(expense.amount)}</td>
                      <td className="px-3 py-4 text-right">
                        {expense.approvalStatus === "pending" ? <div className="flex justify-end gap-2"><form action={reviewExpense.bind(null, expense.id, "approved")}><Button size="sm" type="submit"><Check className="h-3.5 w-3.5" /> Approve</Button></form><form action={reviewExpense.bind(null, expense.id, "rejected")}><Button size="sm" variant="outline" type="submit"><X className="h-3.5 w-3.5" /> Reject</Button></form></div> : <span className="text-xs text-muted-foreground">{expense.approverName || "—"}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
