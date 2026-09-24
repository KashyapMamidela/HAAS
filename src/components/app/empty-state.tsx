import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="font-heading text-base font-medium text-text">{title}</p>
        {description && (
          <p className="text-sm text-text-muted">{description}</p>
        )}
      </div>
      {action &&
        (action.href ? (
          <Button size="sm" render={<a href={action.href} />}>
            {action.label}
          </Button>
        ) : (
          <Button size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}
