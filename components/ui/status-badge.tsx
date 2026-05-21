import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700",
  active: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  invoiced: "bg-violet-100 text-violet-800",
  sent: "bg-amber-100 text-amber-900",
  overdue: "bg-red-100 text-red-800",
  paid: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-zinc-200 text-zinc-700",
  scheduled: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

const labels: Record<string, string> = {
  draft: "Entwurf",
  active: "Aktiv",
  completed: "Erledigt",
  invoiced: "Abgerechnet",
  sent: "Gesendet",
  overdue: "Überfällig",
  paid: "Bezahlt",
  cancelled: "Storniert",
  scheduled: "Geplant",
  failed: "Fehlgeschlagen",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[status] ?? styles.draft,
        className,
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
