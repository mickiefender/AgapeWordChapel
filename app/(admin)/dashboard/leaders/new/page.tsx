import Link from "next/link";
import { UserRound, X } from "lucide-react";
import { LeaderForm } from "@/components/leaders/leader-form";

export default function NewLeaderPage() {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:p-8">
      <Link href="/dashboard/leaders" aria-label="Close add leader dialog" className="absolute inset-0 cursor-default" />
      <div role="dialog" aria-modal="true" className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lift">
        <div className="flex items-start justify-between border-b border-border/70 bg-muted/25 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound className="h-5 w-5" /></div><div><h1 className="text-lg font-semibold">Add leader</h1><p className="mt-1 text-sm text-muted-foreground">Create a public leadership profile.</p></div></div>
          <Link href="/dashboard/leaders" aria-label="Close" className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"><X className="h-5 w-5" /></Link>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-6 sm:px-7"><LeaderForm /></div>
      </div>
    </div>
  );
}
