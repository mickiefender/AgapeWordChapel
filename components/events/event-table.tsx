"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarDays, MapPin, Pencil, Search, SlidersHorizontal, Users } from "lucide-react";
import type { ChurchEvent } from "@/types";

export function EventTable({ events }: { events: ChurchEvent[] }) {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const today = new Date().toISOString().slice(0, 10);
    return events.filter((event) => {
      const matchesQuery =
        !normalizedQuery ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.event_type?.toLowerCase().includes(normalizedQuery) ||
        event.location?.toLowerCase().includes(normalizedQuery);
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "upcoming" && event.start_date >= today) ||
        (dateFilter === "past" && event.start_date < today);
      return matchesQuery && matchesDate;
    });
  }, [dateFilter, events, query]);

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-6 w-6" />}
        title="No events found"
        description="Create an event to plan your church gatherings."
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-semibold tracking-tight">Event calendar</h2>
          <p className="text-xs text-muted-foreground">{filteredEvents.length} of {events.length} events</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex min-w-0 flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events..." aria-label="Search events" className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30" />
          </label>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filter events by date" className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-40">
              <option value="all">All events</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past events</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="hidden md:table-cell">Time</TableHead>
            <TableHead className="hidden lg:table-cell">Location</TableHead>
            <TableHead className="hidden sm:table-cell">Capacity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEvents.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                <Link href={`/dashboard/events/${e.id}`} className="group flex min-w-48 items-center gap-3">
                  {e.image_url ? (
                    <img src={e.image_url} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-semibold group-hover:text-primary">{e.title}</span>
                    <span className="block text-xs text-muted-foreground">{e.event_type ?? "Church event"}</span>
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {new Date(e.start_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {e.start_time ? e.start_time.slice(0, 5) : "—"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {e.location ?? "—"}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  {e.capacity ?? "—"}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/dashboard/events/${e.id}/edit`}
                  aria-label={`Edit ${e.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {filteredEvents.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <p className="text-sm font-medium">No matching events</p>
                <p className="mt-1 text-sm text-muted-foreground">Try another search or date filter.</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </section>
  );
}
