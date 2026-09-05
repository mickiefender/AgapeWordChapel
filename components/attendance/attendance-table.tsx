"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarClock, Search, SlidersHorizontal, UserCheck } from "lucide-react";
import { ATTENDANCE_TYPE_LABELS, type AttendanceType } from "@/types";
import type { AttendanceListItem } from "@/lib/queries/attendance";

export function AttendanceTable({ records }: { records: AttendanceListItem[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesQuery =
        !normalizedQuery ||
        record.person_name.toLowerCase().includes(normalizedQuery) ||
        record.context_name?.toLowerCase().includes(normalizedQuery);
      const matchesType = typeFilter === "all" || record.attendance_type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [query, records, typeFilter]);

  if (records.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock className="h-6 w-6" />}
        title="No attendance records yet"
        description="Check-ins will appear here as people attend services, groups, and events."
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold tracking-tight">Recent check-ins</h2>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.length} of {records.length} records
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex min-w-0 flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people or context..."
              aria-label="Search attendance"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter attendance type"
              className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-48"
            >
              <option value="all">All attendance types</option>
              {Object.entries(ATTENDANCE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="divide-y divide-border/70">
        {filteredRecords.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 text-sm">
            <CalendarClock className="mb-1 h-5 w-5 text-muted-foreground/60" />
            <p className="font-medium">No matching records</p>
            <p className="text-muted-foreground">Try another person, context, or attendance type.</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="flex items-center gap-3 px-4 py-4 sm:px-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                {record.person_avatar_url ? (
                  <img
                    src={record.person_avatar_url}
                    alt={`${record.person_name} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  record.person_name
                    .split(" ")
                    .map((name) => name[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{record.person_name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {record.context_name ?? "General attendance"}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">
                  {new Date(record.check_in_time).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(record.check_in_time).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Badge variant="outline" className="hidden whitespace-nowrap md:inline-flex">
                {ATTENDANCE_TYPE_LABELS[record.attendance_type as AttendanceType] ?? record.attendance_type}
              </Badge>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
