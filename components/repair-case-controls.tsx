"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, CircleX } from "lucide-react";
import { updateRepairCaseStatus } from "@/app/actions";
import {
  getNextRepairStatus,
  repairCaseLabels,
  type RepairCaseStatus,
} from "@/lib/domain/repair-case";

export function RepairCaseControls({ vehicleId, repairCaseId, status, hasCompletedRepair }: { vehicleId:string; repairCaseId:string; status:RepairCaseStatus; hasCompletedRepair:boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{type:"error"|"success";text:string}>();
  const nextStatus = getNextRepairStatus(status);

  function transition(next: RepairCaseStatus) {
    setMessage(undefined);
    startTransition(async () => {
      const result = await updateRepairCaseStatus({vehicleId,repairCaseId,status:next});
      if (result.error) setMessage({type:"error",text:result.error});
      else {
        setMessage({type:"success",text:result.success??"Repair stage updated."});
        router.refresh();
      }
    });
  }

  if (!nextStatus && (status === "completed" || status === "closed")) {
    return <p className="rounded-xl bg-[#eaf4f1] p-4 text-sm font-medium text-[#176a62]" role="status">This repair case is complete. Its history remains available here.</p>;
  }

  const estimateDriven=status==="diagnosing"||status==="estimated";
  const needsRepairRecord=status==="in_repair"&&!hasCompletedRepair;

  return <div>
    <div className="flex flex-col gap-2 sm:flex-row">
      {nextStatus && !estimateDriven && !needsRepairRecord && <button className="btn btn-primary" disabled={pending} onClick={() => transition(nextStatus)} type="button">
        {pending ? "Updating…" : repairCaseLabels[nextStatus]}<ArrowRight size={16}/>
      </button>}
      {!(status==="in_repair"&&hasCompletedRepair)&&<button className="btn btn-secondary" disabled={pending} onClick={() => transition("closed")} type="button">
        <CircleX size={16}/>Close without repair
      </button>}
    </div>
    {estimateDriven&&<p className="mt-3 text-sm leading-6 text-muted">{status==="diagnosing"?"Add and mark an estimate received to advance this repair journey.":"Approve a received estimate below to record authorization and advance the repair journey."}</p>}
    {needsRepairRecord&&<div className="mt-3"><p className="text-sm leading-6 text-muted">Record the completed work and final cost before marking this repair complete. Invoice details and warranty coverage are optional.</p><Link className="btn btn-primary mt-3" href={`/vehicles/${vehicleId}/maintenance/new?case=${repairCaseId}`}>Add completed repair</Link></div>}
    <div className="mt-3 min-h-6" aria-live="polite">
      {message && <p className={`text-sm ${message.type === "error" ? "text-red-700" : "text-[#176a62]"}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}
    </div>
  </div>;
}
