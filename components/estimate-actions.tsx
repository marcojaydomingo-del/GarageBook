"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Trash2, X } from "lucide-react";
import { decideEstimate, deleteDraftEstimate } from "@/app/actions";

type PendingAction="approved"|"declined"|"delete"|null;

export function EstimateActions({estimateId,vehicleId,repairCaseId,status}:{estimateId:string;vehicleId:string;repairCaseId:string;status:"draft"|"received"|"approved"|"declined"|"expired"}) {
  const router=useRouter();
  const [choice,setChoice]=useState<PendingAction>(null);
  const [pending,startTransition]=useTransition();
  const [message,setMessage]=useState<{type:"error"|"success";text:string}>();
  function act(action:Exclude<PendingAction,null>){setMessage(undefined);startTransition(async()=>{const result=action==="delete"?await deleteDraftEstimate({estimateId,vehicleId,repairCaseId}):await decideEstimate({estimateId,vehicleId,repairCaseId,decision:action});if(result.error){setMessage({type:"error",text:result.error});setChoice(null)}else{setMessage({type:"success",text:result.success??"Estimate updated."});setChoice(null);router.refresh()}})}

  if(status!=="draft"&&status!=="received")return null;
  if(choice)return <div className="mt-4 border-t border-[#e5e8e5] pt-4">
    <p className="text-sm font-semibold">{choice==="approved"?"Approve and lock this estimate?":choice==="declined"?"Decline this estimate?":"Permanently delete this draft?"}</p>
    <p className="mt-1 text-xs leading-5 text-muted">{choice==="approved"?"The estimate becomes a permanent snapshot and the repair journey advances.":choice==="declined"?"The estimate stays in the history and the repair case remains open.":"Draft line items will be removed. This cannot be undone."}</p>
    <div className="mt-3 flex flex-wrap gap-2"><button className="btn btn-secondary" disabled={pending} onClick={()=>setChoice(null)} type="button">Cancel</button><button className={choice==="approved"?"btn btn-primary":"btn btn-danger"} disabled={pending} onClick={()=>act(choice)} type="button">{pending?"Saving…":choice==="approved"?"Approve estimate":choice==="declined"?"Decline estimate":"Delete draft"}</button></div>
  </div>;
  return <div className="mt-4 border-t border-[#e5e8e5] pt-4">
    <div className="flex flex-wrap gap-2">{status==="received"?<><button className="btn btn-primary" onClick={()=>setChoice("approved")} type="button"><Check size={16}/>Approve</button><button className="btn btn-secondary" onClick={()=>setChoice("declined")} type="button"><X size={16}/>Decline</button></>:<button className="btn btn-ghost text-muted hover:text-red-700" onClick={()=>setChoice("delete")} type="button"><Trash2 size={16}/>Delete draft</button>}</div>
    <div className="mt-2 min-h-5" aria-live="polite">{message&&<p className={`text-xs ${message.type==="error"?"text-red-700":"text-[#176a62]"}`} role={message.type==="error"?"alert":"status"}>{message.text}</p>}</div>
  </div>;
}
