import { cn } from "@/lib/utils";

export type Status =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "in_consultation"
  | "completed"
  | "cancelled"
  | "no_show";

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  in_consultation: "In consultation",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const STATUS_CLASSES: Record<Status, string> = {
  pending: "bg-warning-soft text-warning",
  confirmed: "bg-accent-soft text-accent",
  checked_in: "bg-warning-soft text-warning",
  in_consultation: "bg-accent-soft text-accent",
  completed: "bg-success-soft text-success",
  cancelled: "bg-danger-soft text-danger",
  no_show: "bg-danger-soft text-danger",
};

export function StatusPill({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
