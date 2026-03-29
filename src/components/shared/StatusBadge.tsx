import { cn } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected" | "available" | "in-use" | "maintenance" | "results-sent";

const statusStyles: Record<Status, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  available: "bg-success/15 text-success border-success/30",
  "in-use": "bg-accent/15 text-accent border-accent/30",
  maintenance: "bg-warning/15 text-warning border-warning/30",
  "results-sent": "bg-primary/15 text-primary border-primary/30",
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        statusStyles[status],
        className
      )}
    >
      {status.replace("-", " ")}
    </span>
  );
}
