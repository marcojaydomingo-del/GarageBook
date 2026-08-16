import { describe, expect, it } from "vitest";
import {
  canTransitionRepairCase,
  getNextRepairStatus,
  getRepairJourneyStep,
  isRepairCaseOpen,
} from "../lib/domain/repair-case";

describe("repair case workflow", () => {
  it("advances through the documented repair stages", () => {
    expect(getNextRepairStatus("diagnosing")).toBe("estimated");
    expect(getNextRepairStatus("estimated")).toBe("approved");
    expect(getNextRepairStatus("approved")).toBe("in_repair");
    expect(getNextRepairStatus("in_repair")).toBe("completed");
    expect(getNextRepairStatus("completed")).toBeUndefined();
  });

  it("allows only the next stage or an explicit closure", () => {
    expect(canTransitionRepairCase("diagnosing", "estimated")).toBe(true);
    expect(canTransitionRepairCase("diagnosing", "in_repair")).toBe(false);
    expect(canTransitionRepairCase("estimated", "closed")).toBe(true);
    expect(canTransitionRepairCase("completed", "closed")).toBe(false);
  });

  it("maps status to a stable journey position", () => {
    expect(getRepairJourneyStep("diagnosing")).toBe(1);
    expect(getRepairJourneyStep("estimated")).toBe(2);
    expect(getRepairJourneyStep("in_repair")).toBe(3);
    expect(getRepairJourneyStep("completed")).toBe(4);
    expect(isRepairCaseOpen("in_repair")).toBe(true);
    expect(isRepairCaseOpen("closed")).toBe(false);
  });
});
