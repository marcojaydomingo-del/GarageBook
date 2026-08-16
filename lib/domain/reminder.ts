export interface ReminderDueInput {
  due_date: string | null;
  due_mileage: number | null;
}

export type ReminderUrgency = "overdue" | "due_soon" | "scheduled";

const DAY_MS = 24 * 60 * 60 * 1000;

function dateAtNoon(value: string) {
  return new Date(`${value}T12:00:00`).getTime();
}

export function getReminderUrgency(
  reminder: ReminderDueInput,
  currentMileage: number,
  today: string,
): ReminderUrgency {
  const daysUntilDue = reminder.due_date
    ? Math.round((dateAtNoon(reminder.due_date) - dateAtNoon(today)) / DAY_MS)
    : null;
  const milesUntilDue = reminder.due_mileage === null
    ? null
    : reminder.due_mileage - currentMileage;

  if ((daysUntilDue !== null && daysUntilDue < 0) || (milesUntilDue !== null && milesUntilDue < 0)) {
    return "overdue";
  }
  if ((daysUntilDue !== null && daysUntilDue <= 30) || (milesUntilDue !== null && milesUntilDue <= 1_000)) {
    return "due_soon";
  }
  return "scheduled";
}

export function sortReminders<T extends ReminderDueInput>(
  reminders: T[],
  currentMileage: number,
  today: string,
) {
  const urgencyOrder: Record<ReminderUrgency, number> = { overdue: 0, due_soon: 1, scheduled: 2 };
  return [...reminders].sort((left, right) => {
    const urgencyDifference = urgencyOrder[getReminderUrgency(left, currentMileage, today)]
      - urgencyOrder[getReminderUrgency(right, currentMileage, today)];
    if (urgencyDifference !== 0) return urgencyDifference;

    const dateDifference = (left.due_date ?? "9999-12-31").localeCompare(right.due_date ?? "9999-12-31");
    if (dateDifference !== 0) return dateDifference;
    return (left.due_mileage ?? Number.POSITIVE_INFINITY) - (right.due_mileage ?? Number.POSITIVE_INFINITY);
  });
}
