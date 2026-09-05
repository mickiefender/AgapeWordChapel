"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { HeartPulse, Pencil, Search, SlidersHorizontal } from "lucide-react";
import { PRAYER_STATUS_LABELS, type PrayerRequest } from "@/types";

export function PrayerRequestTable({ prayerRequests }: { prayerRequests: PrayerRequest[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filteredRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return prayerRequests.filter((request) => {
      const matchesQuery =
        !normalized ||
        (request.requester_name ?? "Anonymous").toLowerCase().includes(normalized) ||
        request.content.toLowerCase().includes(normalized);
      return matchesQuery && (status === "all" || request.status === status);
    });
  }, [prayerRequests, query, status]);

  if (prayerRequests.length === 0) {
    return (
      <EmptyState
        icon={<HeartPulse className="h-6 w-6" />}
        title="No prayer requests found"
        description="Add a prayer request to track and respond to church prayer needs."
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold tracking-tight">Prayer inbox</h2>
            <p className="text-xs text-muted-foreground">{filteredRequests.length} of {prayerRequests.length} requests</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search requests..." aria-label="Search prayer requests" className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-64" />
          </label>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter prayer requests by status" className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-44">
              <option value="all">All statuses</option>
              {Object.entries(PRAYER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className="divide-y divide-border/70">
        {filteredRequests.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No requests match your filters.</p>
        ) : filteredRequests.map((request) => (
          <div key={request.id} className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:px-6">
            <Link href={`/dashboard/prayer-requests/${request.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{request.requester_name ?? "Anonymous"}</p>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{request.content}</p>
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:justify-end">
              <Badge variant="secondary" className="capitalize">{request.privacy.replace(/_/g, " ")}</Badge>
              <Badge variant="outline">{PRAYER_STATUS_LABELS[request.status] ?? request.status}</Badge>
              <span className="hidden text-xs text-muted-foreground md:inline">{new Date(request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <Link href={`/dashboard/prayer-requests/${request.id}/edit`} aria-label={`Edit ${request.requester_name ?? "prayer request"}`} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <Pencil className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
