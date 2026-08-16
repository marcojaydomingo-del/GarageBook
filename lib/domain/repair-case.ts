export const repairCaseStatuses = [
  "diagnosing",
  "estimated",
  "approved",
  "in_repair",
  "completed",
  "closed",
] as const;

export type RepairCaseStatus = (typeof repairCaseStatuses)[number];

export const repairCaseLabels: Record<RepairCaseStatus, string> = {
  diagnosing: "Diagnosing",
  estimated: "Estimate received",
  approved: "Repair approved",
  in_repair: "In repair",
  completed: "Repair complete",
  closed: "Closed without repair",
};

export const repairJourneySteps = [
  "Problem logged",
  "Diagnosis",
  "Estimate",
  "Repair",
  "Complete",
] as const;

const journeyStepByStatus: Record<RepairCaseStatus, number> = {
  diagnosing: 1,
  estimated: 2,
  approved: 3,
  in_repair: 3,
  completed: 4,
  closed: 4,
};

const nextStatusByStatus: Partial<Record<RepairCaseStatus, RepairCaseStatus>> = {
  diagnosing: "estimated",
  estimated: "approved",
  approved: "in_repair",
  in_repair: "completed",
};

export function getRepairJourneyStep(status: RepairCaseStatus) {
  return journeyStepByStatus[status];
}

export function getNextRepairStatus(status: RepairCaseStatus) {
  return nextStatusByStatus[status];
}

export function isRepairCaseOpen(status: RepairCaseStatus) {
  return status !== "completed" && status !== "closed";
}

export function canTransitionRepairCase(from: RepairCaseStatus, to: RepairCaseStatus) {
  if (!isRepairCaseOpen(from)) return false;
  return to === "closed" || nextStatusByStatus[from] === to;
}
