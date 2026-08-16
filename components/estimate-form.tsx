"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { saveEstimate } from "@/app/actions";
import { estimateSchema, type EstimateFields } from "@/lib/validation";
import { formatCurrency } from "@/lib/format";

interface ShopOption {id:string;name:string}
function localDateToday(){const now=new Date();return new Date(now.getTime()-now.getTimezoneOffset()*60_000).toISOString().slice(0,10)}

export function EstimateForm({vehicleId,repairCaseId,estimateId,shops,initialValues}:{vehicleId:string;repairCaseId:string;estimateId?:string;shops:ShopOption[];initialValues?:EstimateFields}) {
  const router=useRouter();
  const [serverError,setServerError]=useState<string>();
  const [pending,startTransition]=useTransition();
  const form=useForm<EstimateFields>({resolver:zodResolver(estimateSchema),defaultValues:initialValues??{shopId:"",status:"received",estimateDate:localDateToday(),expiresAt:"",notes:"",items:[{description:"",category:"",partsCost:0,laborCost:0,quantity:1}]}});
  const {fields,append,remove}=useFieldArray({control:form.control,name:"items"});
  const items=useWatch({control:form.control,name:"items"})??[];
  const total=items.reduce((sum,item)=>sum+((Number(item?.partsCost)||0)+(Number(item?.laborCost)||0))*(Number(item?.quantity)||0),0);
  const submit=form.handleSubmit(values=>startTransition(async()=>{const result=await saveEstimate(vehicleId,repairCaseId,estimateId??null,values);setServerError(result?.error)}));

  return <section className="card p-5 sm:p-7">
    {serverError&&<p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{serverError}</p>}
    <form className="space-y-7" onSubmit={submit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field sm:col-span-2"><label htmlFor="estimateShop">Repair shop</label><select id="estimateShop" {...form.register("shopId")}><option value="">Choose a shop</option>{shops.map(shop=><option key={shop.id} value={shop.id}>{shop.name}</option>)}</select>{form.formState.errors.shopId&&<p className="field-error">{form.formState.errors.shopId.message}</p>}{!shops.length&&<p className="text-xs text-muted">Add a repair shop before creating an estimate.</p>}</div>
        <div className="field"><label htmlFor="estimateDate">Estimate date</label><input id="estimateDate" type="date" {...form.register("estimateDate")}/>{form.formState.errors.estimateDate&&<p className="field-error">{form.formState.errors.estimateDate.message}</p>}</div>
        <div className="field"><label htmlFor="estimateExpires">Expiration date</label><input id="estimateExpires" type="date" {...form.register("expiresAt")}/>{form.formState.errors.expiresAt&&<p className="field-error">{form.formState.errors.expiresAt.message}</p>}</div>
        <div className="field sm:col-span-2"><label htmlFor="estimateStatus">Save state</label><select id="estimateStatus" {...form.register("status")}><option value="received">Estimate received — advance the repair journey</option><option value="draft">Draft — keep the repair stage unchanged</option></select></div>
      </div>

      <div>
        <div className="flex items-end justify-between gap-4 border-b border-[#e5e8e5] pb-4">
          <div><h2 className="text-lg font-semibold">Work items</h2><p className="mt-1 text-sm text-muted">Separate parts and labor when the shop provides the detail.</p></div>
          <button className="btn btn-secondary shrink-0" onClick={()=>append({description:"",category:"",partsCost:0,laborCost:0,quantity:1})} type="button"><Plus size={16}/>Add item</button>
        </div>
        <div className="divide-y divide-[#e5e8e5]">
          {fields.map((field,index)=><fieldset className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-5" key={field.id}>
            <legend className="sr-only">Work item {index+1}</legend>
            <div className="field sm:col-span-2 lg:col-span-2"><label htmlFor={`item-${index}-description`}>Description</label><input id={`item-${index}-description`} placeholder="e.g. Replace oil pan gasket" {...form.register(`items.${index}.description`)}/>{form.formState.errors.items?.[index]?.description&&<p className="field-error">{form.formState.errors.items[index]?.description?.message}</p>}</div>
            <div className="field"><label htmlFor={`item-${index}-parts`}>Parts</label><input id={`item-${index}-parts`} min="0" step="0.01" type="number" {...form.register(`items.${index}.partsCost`,{valueAsNumber:true})}/></div>
            <div className="field"><label htmlFor={`item-${index}-labor`}>Labor</label><input id={`item-${index}-labor`} min="0" step="0.01" type="number" {...form.register(`items.${index}.laborCost`,{valueAsNumber:true})}/></div>
            <div className="field"><label htmlFor={`item-${index}-quantity`}>Quantity</label><div className="flex gap-2"><input id={`item-${index}-quantity`} min="0.01" step="0.01" type="number" {...form.register(`items.${index}.quantity`,{valueAsNumber:true})}/><button aria-label={`Remove work item ${index+1}`} className="btn btn-ghost shrink-0 text-muted hover:text-red-700" disabled={fields.length===1} onClick={()=>remove(index)} type="button"><Trash2 size={16}/></button></div></div>
            <div className="field sm:col-span-2 lg:col-span-5"><label htmlFor={`item-${index}-category`}>Category (optional)</label><input id={`item-${index}-category`} placeholder="e.g. Engine oil leak" {...form.register(`items.${index}.category`)}/></div>
          </fieldset>)}
        </div>
        {form.formState.errors.items?.root?.message&&<p className="field-error">{form.formState.errors.items.root.message}</p>}
        <div className="flex items-center justify-between border-y border-[#e5e8e5] py-4"><span className="text-sm font-medium text-muted">Estimated total</span><strong className="text-2xl tracking-[-.03em]">{formatCurrency(total)}</strong></div>
      </div>

      <div className="field"><label htmlFor="estimateNotes">Estimate notes</label><textarea id="estimateNotes" placeholder="Diagnostic findings, exclusions, or shop comments" {...form.register("notes")}/></div>
      <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#e5e8e5] pt-5 sm:flex-row"><button className="btn btn-secondary" onClick={()=>router.back()} type="button">Cancel</button><button className="btn btn-primary" disabled={pending||!shops.length}>{pending?"Saving…":estimateId?"Save estimate changes":"Save estimate"}</button></div>
      {!shops.length&&<p className="text-right text-sm text-muted"><Link className="font-semibold text-teal" href={`/shops/new?returnTo=${encodeURIComponent(`/vehicles/${vehicleId}/repairs/${repairCaseId}/estimates/new`)}`}>Add a repair shop</Link> to continue.</p>}
    </form>
  </section>;
}
