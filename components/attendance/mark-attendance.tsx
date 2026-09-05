"use client";

import { useMemo, useState } from "react";
import { markAttendance } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { ATTENDANCE_TYPE_LABELS } from "@/types";
import { CalendarCheck, Search, UserCheck, X } from "lucide-react";
import type { AttendanceMarkingOptions } from "@/lib/queries/attendance";
import { useRouter } from "next/navigation";

export function MarkAttendance({ options }: { options: AttendanceMarkingOptions }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("sunday_service");
  const [contextId, setContextId] = useState("");
  const [checkInTime, setCheckInTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const members = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options.members;
    return options.members.filter((member) =>
      `${member.first_name} ${member.last_name} ${member.email ?? ""}`.toLowerCase().includes(normalizedQuery),
    );
  }, [options.members, query]);

  const contexts =
    type === "cell_group"
      ? options.cellGroups
      : type === "department"
        ? options.departments
        : type === "sunday_service" || type === "midweek_service"
          ? options.services
            : type === "event"
              ? options.events
            : [];

  function toggleMember(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    const result = await markAttendance({
      memberIds: selected,
      attendanceType: type,
      contextId,
      checkInTime: new Date(checkInTime).toISOString(),
    });

    if (result?.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setOpen(false);
    setSelected([]);
    setSaving(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <CalendarCheck className="h-4 w-4" />
        Mark attendance
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <button type="button" aria-label="Close mark attendance dialog" className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="mark-attendance-title" className="relative z-10 flex max-h-[min(760px,calc(100vh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lift">
            <div className="flex items-start justify-between border-b border-border/70 px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="mark-attendance-title" className="font-semibold tracking-tight">Mark attendance</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Select everyone who attended this gathering.</p>
                </div>
              </div>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 border-b border-border/70 p-5 sm:grid-cols-3 sm:px-6">
              <label className="space-y-1.5 text-sm font-medium">
                Attendance type
                <select value={type} onChange={(event) => { setType(event.target.value); setContextId(""); }} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30">
                  {Object.entries(ATTENDANCE_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Context
                <select value={contextId} onChange={(event) => setContextId(event.target.value)} disabled={contexts.length === 0} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50">
                  <option value="">{contexts.length ? "Select context..." : "Not required"}</option>
                  {contexts.map((context) => <option key={context.id} value={context.id}>{context.name}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Check-in time
                <input type="datetime-local" value={checkInTime} onChange={(event) => setCheckInTime(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30" />
              </label>
            </div>

            <div className="border-b border-border/70 p-4 sm:px-6">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members..." aria-label="Search members to mark present" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
              {members.map((member) => (
                <label key={member.id} className="flex cursor-pointer items-center gap-3 rounded-xl p-3 hover:bg-muted/60">
                  <input type="checkbox" checked={selected.includes(member.id)} onChange={() => toggleMember(member.id)} className="h-4 w-4 accent-primary" />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={`${member.first_name} ${member.last_name} profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      `${member.first_name[0] ?? ""}${member.last_name[0] ?? ""}`
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{member.first_name} {member.last_name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{member.email ?? "No email"}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="border-t border-border/70 p-4 sm:px-6">
              {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{selected.length} selected</p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="button" onClick={handleSubmit} disabled={!selected.length || saving}>{saving ? "Saving..." : "Mark present"}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
