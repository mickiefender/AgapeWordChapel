import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info";

const variantClasses: Record<Variant, string> = {
  default: "border-transparent bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
  secondary: "border-transparent bg-secondary/60 text-secondary-foreground ring-1 ring-inset ring-secondary/50",
  destructive: "border-transparent bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20",
  outline: "border-border text-muted-foreground",
  success: "border-transparent bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  warning: "border-transparent bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/25",
  info: "border-transparent bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
