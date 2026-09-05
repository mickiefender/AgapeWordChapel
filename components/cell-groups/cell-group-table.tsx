"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Network, Pencil, Search, SlidersHorizontal, Users, UsersRound } from "lucide-react";
import type { CellGroupWithDetails } from "@/lib/queries/cell-groups";

export function CellGroupTable({ cellGroups }: { cellGroups: CellGroupWithDetails[] }) {
  const [query, setQuery] = useState("");
  const [leaderFilter, setLeaderFilter] = useState("all");

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return cellGroups.filter((group) => {
      const matchesQuery =
        !normalizedQuery ||
        group.name.toLowerCase().includes(normalizedQuery) ||
        group.leader_name?.toLowerCase().includes(normalizedQuery) ||
        group.assistant_name?.toLowerCase().includes(normalizedQuery) ||
        group.meeting_location?.toLowerCase().includes(normalizedQuery);
      const matchesLeader =
        leaderFilter === "all" ||
        (leaderFilter === "assigned" && Boolean(group.leader_id)) ||
        (leaderFilter === "unassigned" && !group.leader_id);

      return matchesQuery && matchesLeader;
    });
  }, [cellGroups, leaderFilter, query]);

  if (cellGroups.length === 0) {
    return (
      <EmptyState
        icon={<Network className="h-6 w-6" />}
        title="No cell groups found"
        description="Create a cell group to sharpen your discipleship and fellowship."
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UsersRound className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold tracking-tight">Small group directory</h2>
            <p className="text-xs text-muted-foreground">
              {filteredGroups.length} of {cellGroups.length} {cellGroups.length === 1 ? "group" : "groups"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex min-w-0 flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search groups..."
              aria-label="Search cell groups"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={leaderFilter}
              onChange={(event) => setLeaderFilter(event.target.value)}
              aria-label="Filter by leader status"
              className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-9 pr-8 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 sm:w-44"
            >
              <option value="all">All groups</option>
              <option value="assigned">With a leader</option>
              <option value="unassigned">Needs a leader</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead>Name</TableHead>
            <TableHead>Leader</TableHead>
            <TableHead className="hidden lg:table-cell">Assistant</TableHead>
            <TableHead className="hidden md:table-cell">Meeting schedule</TableHead>
            <TableHead>Members</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredGroups.map((g) => (
            <TableRow key={g.id}>
              <TableCell>
                <Link href={`/dashboard/cell-groups/${g.id}`} className="group flex min-w-48 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/10">
                    <Network className="h-4 w-4" />
                  </div>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-foreground group-hover:text-primary">{g.name}</span>
                    <span className="block text-xs text-muted-foreground">View group</span>
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                {g.leader_name ? (
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {g.leader_name.split(" ").map((name) => name[0]).join("").slice(0, 2)}
                    </span>
                    <span className="text-sm">{g.leader_name}</span>
                  </div>
                ) : (
                  <Badge variant="warning">Needs leader</Badge>
                )}
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{g.assistant_name ?? "—"}</TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    {g.meeting_day ?? "Day not set"}{g.meeting_time ? ` · ${g.meeting_time}` : ""}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {g.meeting_location ?? "Location not set"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium">{g.member_count}</span>
                  <span className="hidden text-muted-foreground sm:inline">{g.member_count === 1 ? "member" : "members"}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/dashboard/cell-groups/${g.id}/edit`}
                  aria-label={`Edit ${g.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {filteredGroups.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-1 text-sm">
                  <Network className="mb-1 h-5 w-5 text-muted-foreground/60" />
                  <p className="font-medium">No matching groups</p>
                  <p className="text-muted-foreground">Try another search or filter.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </section>
  );
}
