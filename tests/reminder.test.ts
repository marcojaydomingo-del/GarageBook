import { describe, expect, it } from "vitest";
import { getReminderUrgency, sortReminders } from "../lib/domain/reminder";

describe("service reminder urgency", () => {
  const today = "2026-08-15";

  it("marks a reminder overdue when either recorded limit has passed", () => {
    expect(getReminderUrgency({ due_date: "2026-08-14", due_mileage: 130_000 }, 121_450, today)).toBe("overdue");
    expect(getReminderUrgency({ due_date: null, due_mileage: 121_000 }, 121_450, today)).toBe("overdue");
  });

  it("marks close dates and mileage as due soon", () => {
    expect(getReminderUrgency({ due_date: "2026-09-01", due_mileage: null }, 121_450, today)).toBe("due_soon");
    expect(getReminderUrgency({ due_date: null, due_mileage: 122_000 }, 121_450, today)).toBe("due_soon");
  });

  it("shows overdue reminders before scheduled reminders", () => {
    const reminders = [
      { title: "Brake fluid", due_date: "2027-08-15", due_mileage: null },
      { title: "Oil service", due_date: null, due_mileage: 121_000 },
    ];
    expect(sortReminders(reminders, 121_450, today)[0]?.title).toBe("Oil service");
  });
});
