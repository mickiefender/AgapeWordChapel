"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2, Pencil, Search, SlidersHorizontal, Users, UsersRound, ExternalLink } from "lucide-react";
import type { DepartmentWithDetails } from "@/lib/queries/departments";

export function DepartmentTable({ departments }: { departments: DepartmentWithDetails[] }) {
  const [query, setQuery] = useState("");
  const [leaderFilter, setLeaderFilter] = useState("all");

  const filteredDepartments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesQuery =
        !normalizedQuery ||
        department.name.toLowerCase().includes(normalizedQuery) ||
        department.description?.toLowerCase().includes(normalizedQuery) ||
        department.leader_name?.toLowerCase().includes(normalizedQuery);
      const matchesLeader =
        leaderFilter === "all" ||
        (leaderFilter === "assigned" && Boolean(department.leader_id)) ||
        (leaderFilter === "unassigned" && !department.leader_id);

      return matchesQuery && matchesLeader;
    });
  }, [departments, leaderFilter, query]);

  if (departments.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="h-6 w-6" />}
        title="No departments found"
        description="Create a department to organize your church ministries."
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
            <h2 className="font-semibold tracking-tight">Ministry directory</h2>
            <p className="text-xs text-muted-foreground">
              {filteredDepartments.length} of {departments.length} {departments.length === 1 ? "department" : "departments"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex min-w-0 flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search departments..."
              aria-label="Search departments"
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
              <option value="all">All departments</option>
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
            <TableHead className="hidden lg:table-cell">Description</TableHead>
            <TableHead>Leader</TableHead>
            <TableHead>Members</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDepartments.map((d) => (
            <TableRow key={d.id}>
              <TableCell>
                <Link href={`/dashboard/departments/${d.id}`} className="group flex min-w-48 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/10">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-foreground group-hover:text-primary">{d.name}</span>
                    <span className="block text-xs text-muted-foreground">View department</span>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="hidden max-w-xs truncate text-sm text-muted-foreground lg:table-cell">
                {d.description ?? "—"}
              </TableCell>
              <TableCell>
                {d.leader_name ? (
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {d.leader_name.split(" ").map((name) => name[0]).join("").slice(0, 2)}
                    </span>
                    <span className="text-sm">{d.leader_name}</span>
                  </div>
                ) : (
                  <Badge variant="warning">Needs leader</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium">{d.member_count}</span>
                  <span className="hidden text-muted-foreground sm:inline">{d.member_count === 1 ? "member" : "members"}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/ministries/${d.id}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View public page for ${d.name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/departments/${d.id}/edit`}
                    aria-label={`Edit ${d.name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredDepartments.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-1 text-sm">
                  <Building2 className="mb-1 h-5 w-5 text-muted-foreground/60" />
                  <p className="font-medium">No matching departments</p>
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
