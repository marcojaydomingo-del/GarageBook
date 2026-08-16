import Link from "next/link";
import { CalendarDays, FileText, Pencil } from "lucide-react";
import { DocumentDeleteButton } from "@/components/document-delete-button";
import { DocumentUpload } from "@/components/document-upload";
import { EstimateActions } from "@/components/estimate-actions";
import type { DocumentRecord, EstimateRecord } from "@/lib/data/garage";
import { formatCurrency, formatDate } from "@/lib/format";

const statusLabels={draft:"Draft",received:"Received",approved:"Approved",declined:"Declined",expired:"Expired"} as const;

export function EstimateCard({estimate,documents,vehicleId,repairCaseId}:{estimate:EstimateRecord;documents:DocumentRecord[];vehicleId:string;repairCaseId:string}) {
  const total=estimate.items.reduce((sum,item)=>sum+Number(item.total),0);
  const editable=estimate.status==="draft"||estimate.status==="received";
  const expired=estimate.expires_at?estimate.expires_at<new Date().toISOString().slice(0,10):false;
  return <article className="border-t border-[#e5e8e5] py-6 first:border-t-0 first:pt-0 last:pb-0">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{estimate.shop?.name??"Repair estimate"}</h3><span className={`status ${estimate.status==="approved"?"status-good":estimate.status==="received"?"status-watch":estimate.status==="declined"||estimate.status==="expired"?"status-action":"bg-[#edf0ed] text-muted"}`}>{statusLabels[estimate.status]}</span>{expired&&estimate.status==="received"&&<span className="status status-action">Past expiration</span>}</div><p className="mt-2 flex items-center gap-2 text-sm text-muted"><CalendarDays size={15}/>{estimate.estimate_date?formatDate(estimate.estimate_date):"Date not recorded"}{estimate.expires_at&&` · Expires ${formatDate(estimate.expires_at)}`}</p></div>
      <div className="flex items-center gap-3"><strong className="text-xl tracking-[-.03em]">{formatCurrency(total)}</strong>{editable&&<Link aria-label="Edit estimate" className="btn btn-ghost text-muted" href={`/vehicles/${vehicleId}/repairs/${repairCaseId}/estimates/${estimate.id}/edit`}><Pencil size={16}/><span className="hidden sm:inline">Edit</span></Link>}</div>
    </div>
    <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-[#e5e8e5] text-xs text-muted"><tr><th className="pb-2 pr-3 font-medium">Work item</th><th className="pb-2 px-3 text-right font-medium">Qty</th><th className="pb-2 px-3 text-right font-medium">Parts</th><th className="pb-2 px-3 text-right font-medium">Labor</th><th className="pb-2 pl-3 text-right font-medium">Total</th></tr></thead><tbody className="divide-y divide-[#edf0ed]">{estimate.items.map(item=><tr key={item.id}><td className="py-3 pr-3"><span className="font-medium">{item.description}</span>{item.category&&<span className="mt-0.5 block text-xs text-muted">{item.category}</span>}</td><td className="px-3 py-3 text-right text-muted">{Number(item.quantity)}</td><td className="px-3 py-3 text-right">{formatCurrency(Number(item.parts_cost))}</td><td className="px-3 py-3 text-right">{formatCurrency(Number(item.labor_cost))}</td><td className="py-3 pl-3 text-right font-semibold">{formatCurrency(Number(item.total))}</td></tr>)}</tbody></table></div>
    {estimate.notes&&<p className="mt-4 text-sm leading-6 text-muted">{estimate.notes}</p>}
    <div className="mt-5 rounded-xl bg-[#f3f5f2] p-4"><div className="flex items-center justify-between gap-3"><div><h4 className="text-sm font-semibold">Estimate document</h4><p className="mt-1 text-xs text-muted">Original PDF or photo from the shop.</p></div><FileText className="shrink-0 text-teal" size={18}/></div>{documents.length>0&&<ul className="mt-3 divide-y divide-[#dde3df] border-y border-[#dde3df]">{documents.map(document=><li className="flex flex-wrap items-center gap-2 py-3" key={document.id}><Link className="min-w-0 flex-1 truncate text-sm font-semibold text-teal" href={`/documents/${document.id}`} target="_blank">{document.file_name}</Link><DocumentDeleteButton documentId={document.id} vehicleId={vehicleId} repairCaseId={repairCaseId} fileName={document.file_name}/></li>)}</ul>}<DocumentUpload vehicleId={vehicleId} repairCaseId={repairCaseId} estimateId={estimate.id} defaultType="estimate" lockType/></div>
    <EstimateActions estimateId={estimate.id} vehicleId={vehicleId} repairCaseId={repairCaseId} status={estimate.status}/>
  </article>;
}
