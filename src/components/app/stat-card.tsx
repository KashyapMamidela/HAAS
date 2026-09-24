import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-text-muted">{label}</p>
        {Icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted">
            <Icon className="size-4" strokeWidth={1.5} />
          </span>
        )}
      </div>
      <p className="mt-2 font-heading text-2xl font-medium text-text">{value}</p>
      {trend && <p className="mt-1 text-xs text-text-muted">{trend}</p>}
    </div>
  );
}
