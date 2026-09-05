import Link from "next/link";
import { ArrowLeft, ArrowRight, Search as SearchIcon, Sparkles } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { searchDashboard } from "@/lib/queries/search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

const typeVariant = {
  Member: "default",
  Visitor: "info",
  Event: "warning",
  Sermon: "success",
  Announcement: "outline",
  Department: "secondary",
} as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const results = await searchDashboard(query);
  const grouped = results.reduce<Record<string, number>>((counts, result) => {
    counts[result.type] = (counts[result.type] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader title="Search" description="Find members, visitors, events, sermons, announcements, and departments from one place." actions={<Button asChild variant="outline"><Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link></Button>} />
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardContent className="p-6">
          <form className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={query} placeholder="Search by name, title, phone, email, or location..." className="h-11 pl-10" autoFocus /></div>
            <Button type="submit" size="lg"><SearchIcon className="h-4 w-4" /> Search</Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Enter at least two characters. Results are limited to the most relevant records in each category.</p>
        </CardContent>
      </Card>
      {query && <div className="grid gap-4 sm:grid-cols-3"><StatCard title="Results" value={results.length} description={`Matches for “${query}”`} icon={SearchIcon} iconTone="primary" /><StatCard title="Categories" value={Object.keys(grouped).length} description="Record types found" icon={Sparkles} iconTone="violet" /><StatCard title="Search scope" value="6" description="Connected dashboard areas" icon={SearchIcon} iconTone="emerald" /></div>}
      <Card><CardHeader><CardTitle>{query ? `Search results for “${query}”` : "Start searching"}</CardTitle></CardHeader><CardContent>{!query ? <div className="rounded-xl border border-dashed p-12 text-center"><SearchIcon className="mx-auto h-10 w-10 text-muted-foreground/40" /><p className="mt-3 font-medium">Search across your dashboard</p><p className="mt-1 text-sm text-muted-foreground">Try a member name, sermon title, event, or department.</p></div> : results.length === 0 ? <div className="rounded-xl border border-dashed p-12 text-center"><p className="font-medium">No matches found</p><p className="mt-1 text-sm text-muted-foreground">Try a different name, keyword, phone number, or title.</p></div> : <div className="divide-y">{results.map((result) => <Link key={`${result.type}-${result.id}`} href={result.href} className="flex items-center justify-between gap-4 py-4 transition-colors first:pt-0 last:pb-0 hover:bg-muted/40"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-medium">{result.title}</p><Badge variant={typeVariant[result.type]}>{result.type}</Badge></div><p className="mt-1 truncate text-sm text-muted-foreground">{result.subtitle}</p></div><ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" /></Link>)}</div>}</CardContent></Card>
    </div>
  );
}
