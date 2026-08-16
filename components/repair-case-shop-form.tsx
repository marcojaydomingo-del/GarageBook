"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateRepairCaseShop } from "@/app/actions";

interface ShopOption {id:string;name:string}

export function RepairCaseShopForm({vehicleId,repairCaseId,currentShopId,shops}:{vehicleId:string;repairCaseId:string;currentShopId:string|null;shops:ShopOption[]}) {
  const router=useRouter();
  const [shopId,setShopId]=useState(currentShopId??"");
  const [pending,startTransition]=useTransition();
  const [message,setMessage]=useState<{type:"error"|"success";text:string}>();
  function save(){setMessage(undefined);startTransition(async()=>{const result=await updateRepairCaseShop({vehicleId,repairCaseId,shopId});if(result.error)setMessage({type:"error",text:result.error});else{setMessage({type:"success",text:result.success??"Repair shop updated."});router.refresh()}})}
  return <div className="mt-4"><div className="field"><label htmlFor="repairCaseShop">Repair shop</label><select id="repairCaseShop" value={shopId} onChange={(event)=>setShopId(event.target.value)}><option value="">Not connected</option>{shops.map(shop=><option value={shop.id} key={shop.id}>{shop.name}</option>)}</select></div><button className="btn btn-secondary mt-3 w-full" disabled={pending||shopId===(currentShopId??"")} onClick={save} type="button">{pending?"Connecting…":"Save shop"}</button><div className="mt-2 min-h-5" aria-live="polite">{message&&<p className={`text-xs ${message.type==="error"?"text-red-700":"text-[#176a62]"}`} role={message.type==="error"?"alert":"status"}>{message.text}</p>}</div></div>;
}
