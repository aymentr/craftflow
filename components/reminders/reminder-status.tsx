import { StatusBadge } from "@/components/ui/status-badge";
import type { Reminder } from "@/types/invoice";

export function ReminderStatus({ reminder }: { reminder: Reminder }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-zinc-950">Mahnung {reminder.reminder_number}</p>
        <p className="text-xs text-zinc-500">Geplant: {new Date(reminder.scheduled_for).toLocaleDateString("de-DE")}</p>
      </div>
      <StatusBadge status={reminder.status} />
    </div>
  );
}
