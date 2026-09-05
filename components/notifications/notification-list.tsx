"use client";

import { useMemo, useState, useTransition } from "react";
import { Bell, CheckCheck, Circle, Search } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/actions/notifications";
import type { Notification } from "@/types";

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const unread = notifications.filter((notification) => !notification.read).length;
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return notifications.filter((notification) =>
      (filter === "all" || !notification.read) &&
      (!normalized || `${notification.title} ${notification.content} ${notification.type ?? ""}`.toLowerCase().includes(normalized)),
    );
  }, [filter, notifications, query]);

  function read(id: string) {
    startTransition(() => markNotificationRead(id));
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 className="font-semibold tracking-tight">Your notifications</h2><p className="mt-1 text-xs text-muted-foreground">{visible.length} of {notifications.length} notifications</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notifications..." aria-label="Search notifications" className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-64" /></label>
          <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} aria-label="Filter notifications" className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"><option value="all">All notifications</option><option value="unread">Unread only</option></select>
          {unread > 0 && <button type="button" disabled={isPending} onClick={() => startTransition(() => markAllNotificationsRead())} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input px-3 text-sm font-medium hover:bg-accent disabled:opacity-50"><CheckCheck className="h-4 w-4" />Mark all read</button>}
        </div>
      </div>
      <div className="divide-y divide-border/70">
        {visible.length === 0 ? <div className="p-12 text-center"><Bell className="mx-auto h-9 w-9 text-muted-foreground/40" /><p className="mt-3 text-sm font-medium">You&apos;re all caught up</p><p className="mt-1 text-sm text-muted-foreground">New updates will appear here.</p></div> : visible.map((notification) => (
          <button key={notification.id} type="button" onClick={() => !notification.read && read(notification.id)} className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/30 sm:p-5 ${notification.read ? "" : "bg-primary/[0.03]"}`}>
            <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}><Bell className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className={`text-sm ${notification.read ? "font-medium" : "font-semibold"}`}>{notification.title}</p>{!notification.read && <Circle className="h-2.5 w-2.5 shrink-0 fill-primary text-primary" />}</div><p className="mt-1 text-sm leading-6 text-muted-foreground">{notification.content}</p><p className="mt-2 text-xs text-muted-foreground">{notification.type ? `${notification.type} · ` : ""}{new Date(notification.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p></div>
          </button>
        ))}
      </div>
    </section>
  );
}
