"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Search, UsersRound } from "lucide-react";
import type { DutyRosterRow } from "@/lib/queries/duty-roster";

export function DutyRosterTable({ rows }: { rows: DutyRosterRow[] }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"upcoming" | "all">("upcoming");
  const today = new Date().toISOString().slice(0, 10);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesView = view === "all" || row.date >= today;
      const matchesQuery =
        !normalized ||
        row.memberName.toLowerCase().includes(normalized) ||
        row.serviceName.toLowerCase().includes(normalized) ||
        row.role.toLowerCase().includes(normalized);
      return matchesView && matchesQuery;
    });
  }, [query, rows, today, view]);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <UsersRound className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-semibold">Your roster is ready to be planned</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Create a service and add member assignments to build the duty roster.
        </p>
        <Link
          href="/dashboard/services"
          className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Open service planner
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-card">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Assignment directory</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {filteredRows.length} of {rows.length} assignments
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people, services, roles..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-64"
            />
          </div>
          <select
            value={view}
            onChange={(event) => setView(event.target.value as "upcoming" | "all")}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            aria-label="Filter roster by date"
          >
            <option value="upcoming">Upcoming duties</option>
            <option value="all">All duties</option>
          </select>
        </div>
      </div>
      <div className="divide-y divide-border/60">
        {filteredRows.map((row) => (
          <div key={row.id} className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                {row.memberName.split(" ").map((name) => name[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{row.memberName}</p>
                <p className="truncate text-xs text-muted-foreground">{row.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm sm:justify-end">
              <div className="min-w-36">
                <p className="font-medium">{row.serviceName}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {row.startTime ? ` · ${row.startTime.slice(0, 5)}` : ""}
                </p>
              </div>
              <Link href={`/dashboard/services/${row.serviceId}`} className="text-xs font-semibold text-primary hover:underline">
                View service
              </Link>
            </div>
          </div>
        ))}
        {filteredRows.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No assignments match your search.</p>}
      </div>
    </div>
  );
}
