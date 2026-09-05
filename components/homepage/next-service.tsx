"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Clock3, MapPin, Radio } from "lucide-react";
import type { HomepageService } from "@/lib/queries/homepage";
import { Button } from "@/components/ui/button";

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Date to be announced";
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(parsed);
}

function normalizeTime(time: string | null, fallback = "09:00") {
  const value = time?.trim() || fallback;
  const [rawHours = "09", rawMinutes = "00", rawSeconds = "00"] = value.split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  const seconds = Number(rawSeconds);
  if (![hours, minutes, seconds].every(Number.isFinite) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
    return fallback;
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatTime(time: string | null) {
  if (!time) return "Time to be announced";
  const parsed = new Date(`1970-01-01T${normalizeTime(time)}`);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(parsed);
}

export function NextService({ service }: { service: HomepageService }) {
  const target = useMemo(() => {
    const parsed = new Date(`${service.date}T${normalizeTime(service.start_time)}`);
    const timestamp = parsed.getTime();
    return Number.isFinite(timestamp) ? timestamp : Date.now();
  }, [service.date, service.start_time]);
  const [remaining, setRemaining] = useState(0);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const updateRemaining = () => {
      const current = Date.now();
      setNow(current);
      setRemaining(Math.max(0, target - current));
    };
    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const calendarStart = `${service.date.replaceAll("-", "")}T${normalizeTime(service.start_time).replaceAll(":", "")}`;
  const calendarEnd = `${service.date.replaceAll("-", "")}T${normalizeTime(service.end_time || service.start_time, "10:30").replaceAll(":", "")}`;
  const startTimestamp = target;
  const fallbackEndTimestamp = startTimestamp + 90 * 60 * 1000;
  const endTimestamp = service.end_time
    ? new Date(`${service.date}T${normalizeTime(service.end_time)}`).getTime()
    : fallbackEndTimestamp;
  const isLive = now !== null && now >= startTimestamp && now < endTimestamp;

  return (
    <section className="border-b border-border/70 bg-card">
      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-12">
        <div>
          <p className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] ${isLive ? "text-red-600" : "text-primary"}`}>
            {isLive && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-600" />}
            {isLive ? "Live service" : "Next service"}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{service.name}</h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><CalendarPlus className="h-4 w-4 text-primary" />{formatDate(service.date)}</span>
            <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />{formatTime(service.start_time)}</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Agape Word Chapel International</span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          {isLive ? (
            service.facebook_live_url ? (
              <Button className="gap-2 bg-red-600 text-white hover:bg-red-700" size="sm" asChild>
                <a href={service.facebook_live_url} target="_blank" rel="noreferrer">
                  <Radio className="h-4 w-4 animate-pulse" /> Watch live on Facebook
                </a>
              </Button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                <Radio className="h-4 w-4 animate-pulse" /> Live now
              </span>
            )
          ) : (
            <>
              <div className="flex gap-2 text-center">
                {[[days, "Days"], [hours, "Hours"], [minutes, "Min"], [seconds, "Sec"]].map(([value, label]) => (
                  <div key={label} className="min-w-14 rounded-lg border bg-background px-2 py-2"><p className="text-xl font-bold tabular-nums">{String(value).padStart(2, "0")}</p><p className="text-[10px] uppercase text-muted-foreground">{label}</p></div>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.name)}&dates=${calendarStart}/${calendarEnd}`} target="_blank" rel="noreferrer">Add to calendar</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
