import Link from "next/link";
import { ArrowDownLeft, ArrowLeft, CalendarDays, Plus, ReceiptText } from "lucide-react";
import { requireFinance } from "@/lib/auth";
import { createIncomeEntry } from "@/actions/finance";
import { getIncomeRegister } from "@/lib/queries/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });
const donationTypes = [
  ["tithe", "Tithe"],
  ["offering", "Offering"],
  ["donation", "General donation"],
  ["pledge", "Pledge"],
  ["building_fund", "Building fund"],
  ["missions", "Missions"],
  ["welfare", "Welfare"],
  ["department_fund", "Department fund"],
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function IncomePage() {
  await requireFinance();
  const { entries, members } = await getIncomeRegister();
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const tithes = entries.filter((entry) => entry.donationType === "tithe").reduce((sum, entry) => sum + entry.amount, 0);
  const offerings = entries.filter((entry) => entry.donationType === "offering").reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Income & giving"
        description="Record and review tithes, offerings, and other church income."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/finance"><ArrowLeft className="h-4 w-4" /> Finance overview</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Recorded income" value={money.format(total)} description="Latest 100 entries" icon={ReceiptText} iconTone="emerald" />
        <StatCard title="Tithes" value={money.format(tithes)} description="Recorded tithe entries" icon={ArrowDownLeft} iconTone="primary" />
        <StatCard title="Offerings" value={money.format(offerings)} description="Recorded offering entries" icon={ArrowDownLeft} iconTone="violet" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Record income</CardTitle>
          <p className="text-sm text-muted-foreground">Use this register for verified giving received by the church.</p>
        </CardHeader>
        <CardContent>
          <form action={createIncomeEntry} className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1.5 text-sm font-medium">Income type
              <select name="donation_type" defaultValue="offering" required className="flex h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm">
                {donationTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">Amount (GHS)
              <Input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required />
            </label>
            <label className="space-y-1.5 text-sm font-medium">Date
              <Input name="donation_date" type="date" defaultValue={today()} required />
            </label>
            <label className="space-y-1.5 text-sm font-medium">Member (optional)
              <select name="member_id" defaultValue="" className="flex h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm">
                <option value="">Anonymous / non-member</option>
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">Donor name (optional)
              <Input name="donor_name" placeholder="Name shown in the register" />
            </label>
            <label className="space-y-1.5 text-sm font-medium">Payment method
              <Input name="payment_method" placeholder="Cash, mobile money, bank..." />
            </label>
            <label className="space-y-1.5 text-sm font-medium">Reference
              <Input name="transaction_ref" placeholder="Receipt or transfer reference" />
            </label>
            <div className="flex items-end">
              <Button type="submit" className="w-full"><Plus className="h-4 w-4" /> Save income</Button>
            </div>
            <label className="space-y-1.5 text-sm font-medium md:col-span-2 xl:col-span-4">Notes
              <Input name="notes" placeholder="Optional context for the finance team" />
            </label>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div><CardTitle>Income register</CardTitle><p className="mt-1 text-sm text-muted-foreground">Recent giving entries, newest first.</p></div>
          <Badge variant="outline"><CalendarDays className="mr-1 h-3.5 w-3.5" /> {entries.length} entries</Badge>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No income has been recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-3 py-3">Date</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Donor</th><th className="px-3 py-3">Method</th><th className="px-3 py-3 text-right">Amount</th></tr></thead>
                <tbody className="divide-y">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="transition-colors hover:bg-muted/40">
                      <td className="whitespace-nowrap px-3 py-4 text-muted-foreground">{entry.donationDate}</td>
                      <td className="px-3 py-4"><Badge variant={entry.donationType === "tithe" ? "success" : "info"}>{titleCase(entry.donationType)}</Badge></td>
                      <td className="px-3 py-4 font-medium">{entry.donorName}</td>
                      <td className="px-3 py-4 text-muted-foreground">{entry.paymentMethod || "—"}</td>
                      <td className="px-3 py-4 text-right font-semibold text-emerald-700">{money.format(entry.amount)}</td>
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
