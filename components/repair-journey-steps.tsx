import { Check } from "lucide-react";
import {
  getRepairJourneyStep,
  repairCaseLabels,
  repairJourneySteps,
  type RepairCaseStatus,
} from "@/lib/domain/repair-case";

export function RepairJourneySteps({ status }: { status:RepairCaseStatus }) {
  if (status === "closed") {
    return <div className="rounded-xl bg-[#f0f2ef] p-4">
      <p className="text-sm font-semibold">Closed without repair</p>
      <p className="mt-1 text-sm leading-6 text-muted">The symptom remains documented even though this repair case ended without completed work.</p>
    </div>;
  }

  const currentStep = getRepairJourneyStep(status);
  return <ol className="repair-steps" aria-label={`Repair stage: ${repairCaseLabels[status]}`}>
    {repairJourneySteps.map((step, index) => {
      const complete = index < currentStep || status === "completed";
      const current = index === currentStep && status !== "completed";
      return <li className={`${complete?"complete ":""}${current?"current":""}`} key={step}>
        <span>
          {complete ? <Check size={14}/> : index + 1}
        </span>
        <span className={current ? "font-semibold text-charcoal" : "text-muted"}>{step}</span>
        {current && <span className="ml-auto text-xs font-semibold text-[#8b5b00]">Current</span>}
      </li>;
    })}
  </ol>;
}
