"use client";

import { type FormEvent, useId, useRef, useState, useTransition } from "react";
import { Camera, FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { completeDocumentUpload, prepareDocumentUpload, type ActionState } from "@/app/actions";
import { createClient } from "@/lib/supabase/browser";
import { ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_BYTES } from "@/lib/validation";

export function DocumentUpload({vehicleId,repairCaseId,estimateId,maintenanceRecordId,defaultType="receipt",lockType=false,photoOnly=false,buttonLabel}:{vehicleId:string;repairCaseId?:string;estimateId?:string;maintenanceRecordId?:string;defaultType?:"receipt"|"invoice"|"estimate"|"photo"|"warranty"|"other";lockType?:boolean;photoOnly?:boolean;buttonLabel?:string}) {
  const router=useRouter();
  const fieldId=useId();
  const formRef=useRef<HTMLFormElement>(null);
  const [state,setState]=useState<ActionState>({});
  const [pending,startTransition]=useTransition();
  const typeId=`document-type-${fieldId}`;
  const fileId=`document-file-${fieldId}`;

  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData=new FormData(event.currentTarget);
    const file=formData.get("file");
    const documentType=String(formData.get("documentType")??"");
    if(!(file instanceof File)||file.size===0){setState({error:"Choose a document to upload."});return}
    if(file.size>MAX_DOCUMENT_BYTES){setState({error:"Files must be 10 MB or smaller."});return}
    if(!ALLOWED_DOCUMENT_TYPES.has(file.type)||(photoOnly&&!file.type.startsWith("image/"))){setState({error:photoOnly?"Upload a JPEG, PNG, or WebP photo.":"Upload a PDF, JPEG, PNG, or WebP file."});return}
    const upload={vehicleId,repairCaseId:repairCaseId??"",estimateId:estimateId??"",maintenanceRecordId:maintenanceRecordId??"",documentType,fileName:file.name,mimeType:file.type,fileSize:file.size};
    setState({});
    startTransition(async()=>{
      const prepared=await prepareDocumentUpload(upload);
      if(prepared.error||!prepared.path||!prepared.token){setState({error:prepared.error??"We couldn’t prepare this upload."});return}
      const supabase=createClient();
      const {error}=await supabase.storage.from("vehicle-documents").uploadToSignedUrl(prepared.path,prepared.token,file,{contentType:file.type,upsert:false});
      if(error){setState({error:error.message.includes("maximum allowed size")?"This file exceeds the storage limit.":"The file could not be uploaded. Please try again."});return}
      const completed=await completeDocumentUpload({...upload,storagePath:prepared.path});
      setState(completed);
      if(completed.success){formRef.current?.reset();router.refresh()}
    });
  }

  return <form className="mt-4 space-y-3" onSubmit={submit} ref={formRef}>
    <div className="field"><label htmlFor={typeId}>Document type</label><select defaultValue={defaultType} disabled={lockType} id={typeId} name={lockType?undefined:"documentType"}><option value="receipt">Receipt</option><option value="invoice">Invoice</option><option value="estimate">Estimate</option><option value="photo">Photo</option><option value="warranty">Warranty</option><option value="other">Other</option></select>{lockType&&<input name="documentType" type="hidden" value={defaultType}/>}</div>
    <div className="field"><label htmlFor={fileId}>{photoOnly?"JPEG, PNG, or WebP, up to 10 MB":"PDF or image, up to 10 MB"}</label><input accept={photoOnly?"image/jpeg,image/png,image/webp":"application/pdf,image/jpeg,image/png,image/webp"} id={fileId} name="file" required type="file"/></div>
    <div className="min-h-5" aria-live="polite">{state.error&&<p className="text-xs text-red-700" role="alert">{state.error}</p>}{state.success&&<p className="text-xs font-medium text-[#176a62]" role="status">{state.success}</p>}</div>
    <button className="btn btn-secondary w-full" disabled={pending}>{photoOnly?<Camera size={16}/>:<FileUp size={16}/>} {pending?"Uploading…":buttonLabel??"Upload document"}</button>
  </form>;
}
