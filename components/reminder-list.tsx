"use client";

import { Bell, CalendarDays, Check, Gauge, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateReminderStatus } from "@/app/actions";
import type { ReminderRecord } from "@/lib/data/garage";
import { formatDate, formatMileage } from "@/lib/format";

const urgencyCopy = {
  overdue: { label: "Overdue", className: "status-action" },
  due_soon: { label: "Due soon", className: "status-watch" },
  scheduled: { label: "Scheduled", className: "status-good" },
} as const;

export function ReminderList({ reminders, vehicleId, limit }: { reminders: ReminderRecord[]; vehicleId: string; limit?: number }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string>();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string }>();
  const [pending, startTransition] = useTransition();
  const visibleReminders = limit ? reminders.slice(0, limit) : reminders;

  function update(reminderId: string, status: "completed" | "dismissed") {
    setPendingId(reminderId);
    setMessage(undefined);
    startTransition(async () => {
      const result = await updateReminderStatus({ reminderId, vehicleId, status });
      if (result.error) setMessage({ type: "error", text: result.error });
      else {
        setMessage({ type: "success", text: result.success ?? "Reminder updated." });
        router.refresh();
      }
      setPendingId(undefined);
    });
  }

  if (!reminders.length) return <div className="empty-panel rounded-xl p-5">
    <p className="text-sm font-semibold">No service reminders</p>
    <p className="mt-1 text-sm leading-6 text-muted">Schedule the next service by date, mileage, or both.</p>
  </div>;

  return <>
    {message && <p className={`mb-4 rounded-xl p-3 text-sm ${message.type === "error" ? "bg-red-50 text-red-800" : "bg-[#eaf4f1] text-[#315c55]"}`} role="status">{message.text}</p>}
    <ul className="divide-y divide-[#e5e8e5] border-y border-[#e5e8e5]">
      {visibleReminders.map((reminder) => {
        const urgency = urgencyCopy[reminder.urgency];
        const busy = pending && pendingId === reminder.id;
        return <li className={`reminder-row reminder-${reminder.urgency}`} key={reminder.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="reminder-icon" aria-hidden="true"><Bell size={16}/></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{reminder.title}</h3>
                <span className={`status ${urgency.className}`}>{urgency.label}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                {reminder.due_date && <span className="inline-flex items-center gap-1.5"><CalendarDays size={15}/>Due {formatDate(reminder.due_date)}</span>}
                {reminder.due_mileage !== null && <span className="inline-flex items-center gap-1.5"><Gauge size={15}/>Due at {formatMileage(reminder.due_mileage)} mi</span>}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button aria-label={`Complete ${reminder.title}`} className="btn btn-secondary flex-1 sm:flex-none" disabled={pending} onClick={() => update(reminder.id, "completed")} type="button"><Check size={16}/>{busy ? "Updating…" : "Complete"}</button>
              <button aria-label={`Dismiss ${reminder.title}`} className="btn btn-ghost px-3" disabled={pending} onClick={() => update(reminder.id, "dismissed")} title="Dismiss reminder" type="button"><X size={17}/></button>
            </div>
          </div>
        </li>;
      })}
    </ul>
    {limit && reminders.length > limit && <p className="mt-3 text-sm text-muted">{reminders.length - limit} more reminder{reminders.length - limit === 1 ? "" : "s"} on the vehicle page.</p>}
  </>;
}
