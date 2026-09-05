import Link from "next/link";
import { Activity, ArrowLeft, CalendarDays, Filter, ShieldCheck, UserRound } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAuditEntries } from "@/lib/queries/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";
const actions = ["all", "create", "update", "delete", "financial_transaction", "permission_change", "export", "login", "logout"];
const resources = ["all", "donation", "expense", "budget", "sms_campaign"];

function formatAction(action: string) {
  return action.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] : undefined;
  const filters = { action: value("action"), resource: value("resource"), search: value("search"), from: value("from"), to: value("to") };
  const entries = await getAuditEntries(filters);
  const financial = entries.filter((entry) => entry.action === "financial_transaction").length;
  const uniqueUsers = new Set(entries.map((entry) => entry.userName)).size;
  const query = (overrides: Record<string, string>) => {
    const next = new URLSearchParams();
    Object.entries({ ...filters, ...overrides }).forEach(([key, item]) => { if (item && item !== "all") next.set(key, item); });
    return `/dashboard/audit-logs?${next.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader title="Audit log" description="Review who changed what, when it happened, and which record was affected." actions={<Button asChild variant="outline"><Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-3"><StatCard title="Events found" value={entries.length} description="Maximum 200 per view" icon={Activity} iconTone="primary" /><StatCard title="Financial events" value={financial} description="Transactions and approvals" icon={ShieldCheck} iconTone="emerald" /><StatCard title="Users represented" value={uniqueUsers} description="Unique actors in this view" icon={UserRound} iconTone="violet" /></div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Filter className="h-4 w-4 text-primary" /> Filter activity</CardTitle></CardHeader><CardContent><form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"><label className="space-y-1.5 text-sm font-medium">Search<Input name="search" defaultValue={filters.search} placeholder="Resource or record ID" /></label><label className="space-y-1.5 text-sm font-medium">Action<select name="action" defaultValue={filters.action ?? "all"} className="flex h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm">{actions.map((action) => <option key={action} value={action}>{formatAction(action)}</option>)}</select></label><label className="space-y-1.5 text-sm font-medium">Resource<select name="resource" defaultValue={filters.resource ?? "all"} className="flex h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm">{resources.map((resource) => <option key={resource} value={resource}>{formatAction(resource)}</option>)}</select></label><label className="space-y-1.5 text-sm font-medium">From<Input name="from" type="date" defaultValue={filters.from} /></label><label className="space-y-1.5 text-sm font-medium">To<Input name="to" type="date" defaultValue={filters.to} /></label><div className="md:col-span-2 xl:col-span-5 flex gap-2"><Button type="submit"><CalendarDays className="h-4 w-4" /> Apply filters</Button><Button asChild type="button" variant="ghost"><Link href="/dashboard/audit-logs">Clear</Link></Button></div></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Activity history</CardTitle></CardHeader><CardContent>{entries.length === 0 ? <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No audit events match the selected filters.</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-3 py-3">Time</th><th className="px-3 py-3">User</th><th className="px-3 py-3">Action</th><th className="px-3 py-3">Resource</th><th className="px-3 py-3">Details</th></tr></thead><tbody className="divide-y">{entries.map((entry) => <tr key={entry.id} className="hover:bg-muted/40"><td className="whitespace-nowrap px-3 py-4 text-muted-foreground">{new Date(entry.createdAt).toLocaleString("en-GH")}</td><td className="px-3 py-4 font-medium">{entry.userName}</td><td className="px-3 py-4"><Badge variant={entry.action === "delete" ? "destructive" : entry.action === "financial_transaction" ? "success" : "outline"}>{formatAction(entry.action)}</Badge></td><td className="px-3 py-4"><p className="font-medium">{entry.resource}</p><p className="text-xs text-muted-foreground">{entry.resourceId || "No record ID"}</p></td><td className="max-w-sm px-3 py-4 text-xs text-muted-foreground">{entry.metadata ? Object.entries(entry.metadata).map(([key, value]) => `${formatAction(key)}: ${String(value)}`).join(" · ") : "No additional details"}</td></tr>)}</tbody></table></div>}</CardContent></Card>
    </div>
  );
}
