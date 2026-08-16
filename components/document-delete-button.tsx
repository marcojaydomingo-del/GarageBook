"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteDocument } from "@/app/actions";

export function DocumentDeleteButton({documentId,vehicleId,repairCaseId,fileName,compact=false}:{documentId:string;vehicleId:string;repairCaseId?:string;fileName:string;compact?:boolean}) {
  const router=useRouter();
  const [confirming,setConfirming]=useState(false);
  const [pending,startTransition]=useTransition();
  const [error,setError]=useState<string>();

  function remove() {
    setError(undefined);
    startTransition(async()=>{
      const result=await deleteDocument({documentId,vehicleId,repairCaseId:repairCaseId??""});
      if(result.error){setError(result.error);setConfirming(false)}else router.refresh();
    });
  }

  if(confirming)return <div className="flex basis-full flex-wrap items-center justify-end gap-2 pl-[52px] sm:basis-auto sm:pl-0" aria-label={`Confirm deletion of ${fileName}`}>
    <span className="mr-auto text-xs font-medium text-red-700 sm:sr-only">Delete permanently?</span>
    <button className="btn btn-secondary" disabled={pending} onClick={()=>setConfirming(false)} type="button">Keep file</button>
    <button className="btn btn-danger" disabled={pending} onClick={remove} type="button"><Trash2 size={15}/>{pending?"Deleting…":"Delete permanently"}</button>
  </div>;

  return <div className="shrink-0">
    <button aria-label={`Delete ${fileName}`} className={compact?"photo-delete":"btn btn-ghost text-muted hover:text-red-700"} onClick={()=>setConfirming(true)} type="button"><Trash2 size={16}/>{!compact&&<span className="hidden sm:inline">Delete</span>}</button>
    {error&&<p className="mt-2 max-w-64 text-xs text-red-700" role="alert">{error}</p>}
  </div>;
}
