"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarClock, CalendarDays, ListMusic, Pencil, Search, SlidersHorizontal, Users, UsersRound } from "lucide-react";
import type { ServiceWithDetails } from "@/lib/queries/services";

export function ServiceTable({ services }: { services: ServiceWithDetails[] }) {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const today = new Date().toISOString().slice(0, 10);

    return services.filter((service) => {
      const matchesQuery = !normalizedQuery || service.name.toLowerCase().includes(normalizedQuery);
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "upcoming" && service.date >= today) ||
        (dateFilter === "past" && service.date < today);

      return matchesQuery && matchesDate;
    });
  }, [dateFilter, query, services]);

  if (services.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock className="h-6 w-6" />}
        title="No services found"
        description="Create a service to plan your church gatherings and duty rosters."
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
            <h2 className="font-semibold tracking-tight">Service schedule</h2>
            <p className="text-xs text-muted-foreground">
              {filteredServices.length} of {services.length} {services.length === 1 ? "service" : "services"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex min-w-0 flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services..."
              aria-label="Search services"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              aria-label="Filter services by date"
              className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-9 pr-8 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 sm:w-40"
            >
              <option value="all">All services</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past services</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead>Service</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="hidden md:table-cell">Time</TableHead>
            <TableHead className="hidden sm:table-cell">Items</TableHead>
            <TableHead className="hidden sm:table-cell">Assignments</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredServices.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <Link href={`/dashboard/services/${s.id}`} className="group flex min-w-48 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/10">
                    <CalendarClock className="h-4 w-4" />
                  </div>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-foreground group-hover:text-primary">{s.name}</span>
                    <span className="block text-xs text-muted-foreground">View service plan</span>
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                  {new Date(s.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {s.start_time ? (
                  <span>
                    {s.start_time.slice(0, 5)}
                    {s.end_time ? ` – ${s.end_time.slice(0, 5)}` : ""}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-1 text-sm">
                  <ListMusic className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.item_count}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.assignment_count}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/dashboard/services/${s.id}/edit`}
                  aria-label={`Edit ${s.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {filteredServices.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-1 text-sm">
                  <CalendarClock className="mb-1 h-5 w-5 text-muted-foreground/60" />
                  <p className="font-medium">No matching services</p>
                  <p className="text-muted-foreground">Try another search or date filter.</p>
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
