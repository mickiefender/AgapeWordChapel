import Link from "next/link";
import { Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { deleteLeader } from "@/actions/leaders";
import { getLeaders } from "@/lib/queries/leaders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function LeadersPage() {
  const leaders = await getLeaders(true);
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Leadership"
        description="Manage the leaders and public profiles shown on the church website."
        actions={<Button asChild><Link href="/dashboard/leaders/new"><Plus className="h-4 w-4" />Add leader</Link></Button>}
      />
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total leaders" value={leaders.length} description="Profiles in the directory" icon={UserRound} iconTone="primary" />
        <StatCard title="Public leaders" value={leaders.filter((leader) => leader.is_active).length} description="Visible on the website" icon={UserRound} iconTone="emerald" />
        <StatCard title="Hidden profiles" value={leaders.filter((leader) => !leader.is_active).length} description="Saved but not published" icon={UserRound} iconTone="amber" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {leaders.map((leader) => (
          <Card key={leader.id} className="overflow-hidden">
            <div className="flex gap-4 p-5">
              {leader.image_url ? <img src={leader.image_url} alt={leader.name} className="h-20 w-20 rounded-2xl object-cover" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UserRound className="h-8 w-8" /></div>}
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{leader.name}</h2>
                <p className="mt-1 text-sm text-primary">{leader.position}</p>
                <p className="mt-2 text-xs text-muted-foreground">{leader.is_active ? "Visible publicly" : "Hidden from website"}</p>
              </div>
            </div>
            <div className="flex gap-2 border-t border-border/70 p-3">
              <Button variant="outline" size="sm" asChild><Link href={`/dashboard/leaders/${leader.id}/edit`}><Pencil className="h-4 w-4" />Edit</Link></Button>
              <form action={deleteLeader.bind(null, leader.id)}><Button variant="destructive" size="sm" type="submit"><Trash2 className="h-4 w-4" />Delete</Button></form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
