import Link from "next/link";
import { ArrowLeft, CalendarRange, CheckCircle2, CircleDollarSign, Pencil, Plus, Trash2 } from "lucide-react";
import { createBudget, deleteBudget, updateBudget } from "@/actions/finance";
import { requireFinance } from "@/lib/auth";
import { getBudgetRegister } from "@/lib/queries/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";
const money = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });
const date = new Date().toISOString().slice(0, 10);

function statusFor(startDate: string | null, endDate: string | null) {
  if (startDate && date < startDate) return { label: "Upcoming", variant: "info" as const };
  if (endDate && date > endDate) return { label: "Closed", variant: "outline" as const };
  return { label: "Active", variant: "success" as const };
}

function BudgetForm({ action, budget }: { action: (formData: FormData) => void; budget?: { name: string; category: string | null; amount: number; startDate: string | null; endDate: string | null } }) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <Input name="name" defaultValue={budget?.name} placeholder="Budget name" required />
      <Input name="category" defaultValue={budget?.category ?? ""} placeholder="Category (optional)" />
      <Input name="amount" type="number" min="0.01" step="0.01" defaultValue={budget?.amount} placeholder="Amount (GHS)" required />
      <Input name="start_date" type="date" defaultValue={budget?.startDate ?? date} required />
      <div className="flex gap-2"><Input name="end_date" type="date" defaultValue={budget?.endDate ?? date} required /><Button type="submit"><CheckCircle2 className="h-4 w-4" /> Save</Button></div>
    </form>
  );
}

export default async function BudgetsPage() {
  await requireFinance();
  const budgets = await getBudgetRegister();
  const active = budgets.filter((budget) => statusFor(budget.startDate, budget.endDate).label === "Active");
  const allocated = active.reduce((sum, budget) => sum + budget.amount, 0);
  const spent = active.reduce((sum, budget) => sum + budget.spent, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader title="Budgets" description="Plan allocations and compare approved spending against each budget." actions={<Button asChild variant="outline"><Link href="/dashboard/finance"><ArrowLeft className="h-4 w-4" /> Finance overview</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active allocation" value={money.format(allocated)} description={`${active.length} active budget${active.length === 1 ? "" : "s"}`} icon={CircleDollarSign} iconTone="primary" />
        <StatCard title="Approved spend" value={money.format(spent)} description="Within active budget periods" icon={CheckCircle2} iconTone="rose" />
        <StatCard title="Remaining" value={money.format(allocated - spent)} description="Across active budgets" icon={CalendarRange} iconTone="emerald" />
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Create budget</CardTitle><p className="text-sm text-muted-foreground">Budgets are tracked in Ghana cedis and measured against approved expenses.</p></CardHeader>
        <CardContent><BudgetForm action={createBudget} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Budget register</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {budgets.length === 0 ? <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No budgets have been created yet.</div> : budgets.map((budget) => {
            const status = statusFor(budget.startDate, budget.endDate);
            const percentage = budget.amount ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
            return <div key={budget.id} className="rounded-xl border p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{budget.name}</h3><Badge variant={status.variant}>{status.label}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{budget.category || "All expense categories"} · {budget.startDate || "No start"} to {budget.endDate || "No end"}</p></div>
                <div className="flex items-center gap-2"><span className="text-lg font-bold">{money.format(budget.amount)}</span><details><summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md hover:bg-muted"><Pencil className="h-4 w-4" /></summary><div className="absolute z-10 mt-2 w-[min(90vw,700px)] -translate-x-full rounded-xl border bg-background p-4 shadow-xl"><BudgetForm action={updateBudget.bind(null, budget.id)} budget={budget} /></div></details><form action={deleteBudget.bind(null, budget.id)}><Button type="submit" size="icon" variant="ghost" aria-label={`Delete ${budget.name}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></form></div>
              </div>
              <div className="mt-5"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>{money.format(budget.spent)} spent</span><span>{Math.round((budget.spent / (budget.amount || 1)) * 100)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${percentage >= 90 ? "bg-rose-400" : "bg-primary"}`} style={{ width: `${percentage}%` }} /></div></div>
            </div>;
          })}
        </CardContent>
      </Card>
    </div>
  );
}
