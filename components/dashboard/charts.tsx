"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardTrend } from "@/lib/queries/dashboard";

const DONUT_COLORS = ["#0f766e", "#b45309", "#7c3aed", "#be185d", "#0e7490", "#64748b"];

const axisStyle = {
  tick: { fontSize: 12, fill: "#94a3b8" },
  stroke: "#e4e9ed",
};

type TooltipPayloadItem = {
  value?: number | string;
  name?: string;
  dataKey?: string | number;
  color?: string;
  fill?: string;
  payload?: Record<string, unknown>;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-card/95 px-3.5 py-2.5 shadow-lift backdrop-blur">
      {label != null && (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: item.color ?? item.fill }}
            />
            <span className="text-muted-foreground">{item.name ?? item.dataKey}</span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendSummary({ data }: { data: DashboardTrend[] }) {
  const latest = data[data.length - 1]?.value ?? 0;
  const prev = data[data.length - 2]?.value ?? 0;
  const change = prev === 0 ? null : ((latest - prev) / prev) * 100;

  return (
    <div className="text-right">
      <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
        {latest}
      </p>
      {change !== null && (
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
            change >= 0
              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
              : "bg-rose-50 text-rose-700 ring-rose-600/20",
          )}
        >
          {change >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

export function TrendChart({
  title,
  description,
  data,
  color = "#b45309",
  type = "area",
}: {
  title: string;
  description?: string;
  data: DashboardTrend[];
  color?: string;
  type?: "area" | "line" | "bar";
}) {
  const gradientId = `grad-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card className="relative col-span-1 overflow-hidden lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <TrendSummary data={data} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data} barSize={26}>
                <defs>
                  <linearGradient id={`${gradientId}-bar`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} {...axisStyle} />
                <YAxis tickLine={false} axisLine={false} {...axisStyle} />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                />
                <Bar dataKey="value" fill={`url(#${gradientId}-bar)`} radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : type === "line" ? (
              <LineChartInner data={data} color={color} gradientId={gradientId} />
            ) : (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} {...axisStyle} />
                <YAxis tickLine={false} axisLine={false} {...axisStyle} />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: "#e4e9ed", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2.5}
                  fill={`url(#${gradientId})`}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function LineChartInner({
  data,
  color,
  gradientId,
}: {
  data: DashboardTrend[];
  color: string;
  gradientId: string;
}) {
  return (
    <LineChart data={data}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.2} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f4" />
      <XAxis dataKey="label" tickLine={false} axisLine={false} {...axisStyle} />
      <YAxis tickLine={false} axisLine={false} {...axisStyle} />
      <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#e4e9ed", strokeWidth: 1 }} />
      <Line
        type="monotone"
        dataKey="value"
        stroke={color}
        strokeWidth={2.5}
        dot={{ r: 3, fill: color, strokeWidth: 2, stroke: "white" }}
        activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }}
      />
    </LineChart>
  );
}

export function ParticipationBarChart({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: { name: string; count: number }[];
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={16}>
              <defs>
                <linearGradient id="dept-bar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f4" />
              <XAxis type="number" tickLine={false} axisLine={false} {...axisStyle} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={120}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
              />
              <Bar dataKey="count" fill="url(#dept-bar)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function GrowthLegendChart({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: { name: string; count: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={76}
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
              />
              <span className="truncate text-muted-foreground">{item.name}</span>
              <span className="ml-auto font-semibold tabular-nums text-foreground">
                {item.count}
              </span>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {total > 0 ? Math.round((item.count / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
