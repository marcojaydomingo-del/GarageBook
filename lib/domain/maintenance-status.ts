export interface MaintenanceSignals { overdueReminders: number; openSymptoms: number; unresolvedRepairCases: number }
export interface MaintenanceStatus { label: "No open items" | "Attention soon" | "Action needed"; score: number; reasons: string[] }
export function calculateMaintenanceStatus(signals: MaintenanceSignals): MaintenanceStatus {
  const reasons: string[] = []; let deductions = 0;
  if (signals.overdueReminders) { deductions += signals.overdueReminders * 20; reasons.push(`${signals.overdueReminders} overdue reminder${signals.overdueReminders === 1 ? "" : "s"}`); }
  if (signals.openSymptoms) { deductions += signals.openSymptoms * 12; reasons.push(`${signals.openSymptoms} open symptom${signals.openSymptoms === 1 ? "" : "s"}`); }
  if (signals.unresolvedRepairCases) { deductions += signals.unresolvedRepairCases * 18; reasons.push(`${signals.unresolvedRepairCases} unresolved repair case${signals.unresolvedRepairCases === 1 ? "" : "s"}`); }
  const score = Math.max(0, 100 - deductions); const label = score >= 85 ? "No open items" : score >= 60 ? "Attention soon" : "Action needed";
  return { label, score, reasons: reasons.length ? reasons : ["No overdue or unresolved records"] };
}
