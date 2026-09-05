import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

type IconTone =
  | "primary"
  | "amber"
  | "emerald"
  | "rose"
  | "sky"
  | "violet"
  | "slate";

const iconTones: Record<IconTone, { chip: string; accent: string }> = {
  primary: {
    chip: "bg-primary/10 text-primary",
    accent: "bg-primary",
  },
  amber: {
    chip: "bg-amber-100 text-amber-700",
    accent: "bg-amber-400",
  },
  emerald: {
    chip: "bg-emerald-100 text-emerald-700",
    accent: "bg-emerald-400",
  },
  rose: {
    chip: "bg-rose-100 text-rose-700",
    accent: "bg-rose-400",
  },
  sky: {
    chip: "bg-sky-100 text-sky-700",
    accent: "bg-sky-400",
  },
  violet: {
    chip: "bg-violet-100 text-violet-700",
    accent: "bg-violet-400",
  },
  slate: {
    chip: "bg-slate-100 text-slate-700",
    accent: "bg-slate-400",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendPositive,
  iconTone = "primary",
  className,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendPositive?: boolean;
  iconTone?: IconTone;
  className?: string;
}) {
  const tone = iconTones[iconTone];
  const TrendIcon = trendPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", tone.accent)} />

      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 truncate text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {description && (
            <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <span
              className={cn(
                "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                trendPositive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                  : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {trend}
            </span>
          )}
        </div>

        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105",
            tone.chip,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
