import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, CalendarDays, FileText, Gauge, MapPin, Plus, ReceiptText, Wrench } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DocumentUpload } from "@/components/document-upload";
import { DocumentDeleteButton } from "@/components/document-delete-button";
import { EstimateCard } from "@/components/estimate-card";
import { PageHeader } from "@/components/page-header";
import { RepairCaseControls } from "@/components/repair-case-controls";
import { RepairCaseShopForm } from "@/components/repair-case-shop-form";
import { RepairJourneySteps } from "@/components/repair-journey-steps";
import { getRepairCase, getRepairCaseDocuments, getRepairCaseEstimates, getRepairCompletionRecord, getShops, getVehicle } from "@/lib/data/garage";
import { formatCurrency, formatDate, formatMileage } from "@/lib/format";
import { isRepairCaseOpen, repairCaseLabels } from "@/lib/domain/repair-case";

export default async function RepairCasePage({ params }: { params: Promise<{ id: string; caseId: string }> }) {
  const { id, caseId } = await params;
  const [vehicle, repairCase, shops, documents, estimates] = await Promise.all([
    getVehicle(id),
    getRepairCase(id, caseId),
    getShops(),
    getRepairCaseDocuments(id, caseId),
    getRepairCaseEstimates(id, caseId),
  ]);
  if (!vehicle || !repairCase) notFound();
  const completion=await getRepairCompletionRecord(id,repairCase.maintenance_record_id);
  const casePath = `/vehicles/${id}/repairs/${caseId}`;
  const caseDocuments=documents.filter(document=>!document.estimate_id&&!document.maintenance_record_id);
  const invoiceDocuments=completion?documents.filter(document=>document.maintenance_record_id===completion.id):[];
  const approvedEstimate=estimates.find(estimate=>estimate.status==="approved");
  const approvedTotal=approvedEstimate?.items.reduce((sum,item)=>sum+Number(item.total),0)??null;

  return (
    <AppShell vehicleId={id}>
      <Link className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal" href={`/vehicles/${id}`}><ArrowLeft size={16}/>Back to vehicle</Link>
      <PageHeader
        title={repairCase.title}
        description={`${vehicle.year} ${vehicle.make} ${vehicle.model} · Opened ${formatDate(repairCase.opened_at)}`}
        actions={<span className={`status ${isRepairCaseOpen(repairCase.status) ? "status-watch" : "status-good"}`}>{repairCaseLabels[repairCase.status]}</span>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-7" aria-labelledby="journey-heading">
            <div className="mb-6">
              <h2 className="text-xl font-semibold" id="journey-heading">Repair case progress</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Advance the case only when that step has happened. The shop, estimate, invoice, and optional warranty remain attached as evidence.</p>
            </div>
            <RepairJourneySteps status={repairCase.status}/>
            <div className="mt-7 border-t border-[#e5e8e5] pt-6">
              <RepairCaseControls vehicleId={id} repairCaseId={caseId} status={repairCase.status} hasCompletedRepair={Boolean(completion)}/>
            </div>
          </section>

          <section className="card p-5 sm:p-7" aria-labelledby="symptom-heading">
            <h2 className="text-lg font-semibold" id="symptom-heading">Reported symptom</h2>
            {repairCase.symptom ? <>
              <p className="mt-4 text-base font-semibold">{repairCase.symptom.title}</p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{repairCase.symptom.description ?? "No additional description was recorded."}</p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <Fact icon={AlertTriangle} label="Severity" value={repairCase.symptom.severity}/>
                <Fact icon={CalendarDays} label="First noticed" value={formatDate(repairCase.symptom.first_noticed_at)}/>
                <Fact icon={Gauge} label="Mileage" value={repairCase.symptom.mileage === null ? "Not recorded" : `${formatMileage(repairCase.symptom.mileage)} mi`}/>
              </dl>
              {repairCase.symptom.warning_light && <p className="mt-4 rounded-xl bg-[#fff1d6] p-4 text-sm font-medium text-[#8b5b00]">A dashboard warning light was reported with this symptom.</p>}
            </> : <p className="mt-3 text-sm text-muted">This case does not have a linked symptom.</p>}
          </section>

          <section className="card p-5 sm:p-7" aria-labelledby="estimates-heading">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><h2 className="text-lg font-semibold" id="estimates-heading">Repair estimates</h2><p className="mt-1 text-sm leading-6 text-muted">Compare proposed work and preserve the estimate that authorized the repair.</p></div>
              {isRepairCaseOpen(repairCase.status)&&<Link className="btn btn-primary shrink-0" href={`/vehicles/${id}/repairs/${caseId}/estimates/new`}><Plus size={16}/>Add estimate</Link>}
            </div>
            {estimates.length>0?<div className="mt-6">{estimates.map(estimate=><EstimateCard key={estimate.id} estimate={estimate} documents={documents.filter(document=>document.estimate_id===estimate.id)} vehicleId={id} repairCaseId={caseId}/>)}</div>:<div className="mt-5 rounded-xl bg-[#f3f5f2] p-5"><p className="text-sm font-semibold">No estimates recorded</p><p className="mt-1 text-sm leading-6 text-muted">Add the shop’s proposed work and cost when diagnosis is complete.</p></div>}
          </section>

          <section className="card p-5 sm:p-7" aria-labelledby="documents-heading">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-lg font-semibold" id="documents-heading">Case documents</h2>
                <p className="mt-1 text-sm leading-6 text-muted">Keep diagnostic photos, general receipts, and optional warranty evidence with this journey.</p>
              </div>
              <span className="text-sm font-medium text-muted">{caseDocuments.length} {caseDocuments.length === 1 ? "file" : "files"}</span>
            </div>
            {caseDocuments.length > 0 && <ul className="mt-5 divide-y divide-[#e5e8e5] border-y border-[#e5e8e5]">
              {caseDocuments.map((document) => <li className="flex flex-wrap items-center gap-3 py-4" key={document.id}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef2ef] text-teal"><FileText size={17}/></span>
                <div className="min-w-0 flex-1">
                  <Link className="block truncate text-sm font-semibold hover:text-teal" href={`/documents/${document.id}`} target="_blank">{document.file_name}</Link>
                  <p className="mt-0.5 text-xs capitalize text-muted">{document.document_type} · {formatDate(document.uploaded_at)}</p>
                </div>
                <DocumentDeleteButton documentId={document.id} vehicleId={id} repairCaseId={caseId} fileName={document.file_name}/>
              </li>)}
            </ul>}
            {caseDocuments.length === 0 && <p className="mt-5 rounded-xl bg-[#f3f5f2] p-4 text-sm text-muted">No general documents are connected to this repair yet.</p>}
            <DocumentUpload vehicleId={id} repairCaseId={caseId}/>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5">
            <h2 className="font-semibold">Repair shop</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Connect who inspected or repaired the vehicle.</p>
            {shops.length > 0 ? <RepairCaseShopForm
              vehicleId={id}
              repairCaseId={caseId}
              currentShopId={repairCase.shop_id}
              shops={shops.map(({ id: shopId, name }) => ({ id: shopId, name }))}
            /> : <Link className="btn btn-secondary mt-4 w-full" href={`/shops/new?returnTo=${encodeURIComponent(casePath)}`}><Plus size={16}/>Add repair shop</Link>}
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Completed work</h2>
            {completion ? <>
              <dl className="mt-4 space-y-4 text-sm">
                <EvidenceRow icon={Wrench} label="Repair record" value={completion.title}/>
                <EvidenceRow icon={CalendarDays} label="Completed" value={formatDate(completion.performed_at)}/>
                {repairCase.shop && <EvidenceRow icon={MapPin} label="Shop" value={repairCase.shop.name}/>}
                {completion.invoice_number&&<EvidenceRow icon={ReceiptText} label="Invoice number" value={completion.invoice_number}/>}
                {completion.invoice_date&&<EvidenceRow icon={CalendarDays} label="Invoice date" value={formatDate(completion.invoice_date)}/>}
              </dl>
              {completion.cost !== null && <div className="mt-4 space-y-2 border-t border-[#e5e8e5] pt-4 text-sm"><p><span className="text-muted">Final cost</span><strong className="float-right">{formatCurrency(completion.cost)}</strong></p>{approvedTotal!==null&&<><p><span className="text-muted">Approved estimate</span><span className="float-right">{formatCurrency(approvedTotal)}</span></p><p><span className="text-muted">Difference</span><span className={`float-right font-semibold ${Number(completion.cost)>approvedTotal?"text-[#9b3429]":"text-[#176a62]"}`}>{Number(completion.cost)>approvedTotal?"+":""}{formatCurrency(Number(completion.cost)-approvedTotal)}</span></p></>}</div>}
              <div className="mt-5 border-t border-[#e5e8e5] pt-4"><h3 className="text-sm font-semibold">Invoice document <span className="font-normal text-muted">(optional)</span></h3>{invoiceDocuments.length>0&&<ul className="mt-3 divide-y divide-[#e5e8e5] border-y border-[#e5e8e5]">{invoiceDocuments.map(document=><li className="flex flex-wrap items-center gap-2 py-3" key={document.id}><Link className="min-w-0 flex-1 truncate text-sm font-semibold text-teal" href={`/documents/${document.id}`} target="_blank">{document.file_name}</Link><DocumentDeleteButton documentId={document.id} vehicleId={id} repairCaseId={caseId} fileName={document.file_name}/></li>)}</ul>}<DocumentUpload vehicleId={id} repairCaseId={caseId} maintenanceRecordId={completion.id} defaultType="invoice" lockType/></div>
            </> : <>
              <p className="mt-2 text-sm leading-6 text-muted">No completed repair is connected to this journey yet.</p>
              {repairCase.status==="in_repair"?<Link className="btn btn-primary mt-4 w-full" href={`/vehicles/${id}/maintenance/new?case=${caseId}`}><Plus size={16}/>Add repair record</Link>:repairCase.status==="approved"?<p className="mt-3 rounded-xl bg-[#f3f5f2] p-3 text-sm text-muted">Start the repair from the journey controls before recording completed work.</p>:null}
            </>}
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return <div className="rounded-xl bg-[#f3f5f2] p-4"><Icon className="text-teal" size={17}/><dt className="mt-3 text-xs text-muted">{label}</dt><dd className="mt-1 text-sm font-semibold capitalize">{value}</dd></div>;
}

function EvidenceRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return <div className="flex gap-3"><Icon className="mt-0.5 shrink-0 text-teal" size={17}/><div><dt className="text-xs text-muted">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div></div>;
}
