"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  documentCompletionSchema,
  documentDeleteSchema,
  documentUploadSchema,
  estimateDecisionSchema,
  estimateDeleteSchema,
  estimateSchema,
  maintenanceSchema,
  reminderSchema,
  reminderStatusUpdateSchema,
  repairCaseShopSchema,
  repairCaseTransitionSchema,
  shopPreferencesSchema,
  shopSchema,
  symptomSchema,
  vehicleSchema,
} from "@/lib/validation";
import { canTransitionRepairCase, type RepairCaseStatus } from "@/lib/domain/repair-case";
import { buildVehicleDocumentPath } from "@/lib/domain/ownership";
import { safeInternalPath } from "@/lib/domain/navigation";
import { discoveredShopSchema } from "@/lib/domain/shop-discovery";

export interface ActionState { error?:string;success?:string }

async function authenticated(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();return user?{supabase,user}:null}

export async function completeDashboardTour():Promise<ActionState>{
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const {error}=await auth.supabase.from("profiles").update({dashboard_tour_version:1,updated_at:new Date().toISOString()}).eq("id",auth.user.id);
  if(error)return{error:"The tour was dismissed on this device, but your account could not be updated."};
  revalidatePath("/dashboard");return{success:"Dashboard tour completed."};
}

export async function createVehicle(input:unknown,onboarding=false):Promise<ActionState>{
  const parsed=vehicleSchema.safeParse(input);if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const value=parsed.data;
  const {data,error}=await auth.supabase.from("vehicles").insert({owner_id:auth.user.id,year:value.year,make:value.make,model:value.model,trim:value.trim||null,vin:value.vin||null,color:value.color||null,current_mileage:value.mileage}).select("id").single();
  if(error)return{error:error.message};
  await auth.supabase.from("vehicle_mileage_entries").insert({owner_id:auth.user.id,vehicle_id:data.id,mileage:value.mileage,source:"manual"});
  revalidatePath("/dashboard");redirect(onboarding?`/onboarding/complete?vehicle=${data.id}`:`/vehicles/${data.id}`);
}

export async function updateVehicle(vehicleId:string,input:unknown):Promise<ActionState>{
  const parsed=vehicleSchema.safeParse(input);if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const value=parsed.data;
  const {data,error}=await auth.supabase.from("vehicles").update({year:value.year,make:value.make,model:value.model,trim:value.trim||null,vin:value.vin||null,color:value.color||null,current_mileage:value.mileage,updated_at:new Date().toISOString()}).eq("id",vehicleId).select("id").maybeSingle();
  if(error||!data)return{error:"We couldn’t update this vehicle. Try again."};
  const {error:mileageError}=await auth.supabase.from("vehicle_mileage_entries").insert({owner_id:auth.user.id,vehicle_id:vehicleId,mileage:value.mileage,source:"manual"});
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);
  if(mileageError)return{error:"The vehicle was updated, but the mileage history could not be recorded."};
  redirect(`/vehicles/${vehicleId}`);
}

export async function createMaintenance(vehicleId:string,input:unknown,returnTo?:string):Promise<ActionState>{
  const parsed=maintenanceSchema.safeParse(input);if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const value=parsed.data;const repairCaseId=value.repairCaseId||null;
  if(repairCaseId&&value.type!=="repair")return{error:"A repair case can only be linked to a repair record."};
  if(repairCaseId){const {data:repairCase}=await auth.supabase.from("repair_cases").select("id,status,maintenance_record_id").eq("id",repairCaseId).eq("vehicle_id",vehicleId).maybeSingle();if(!repairCase)return{error:"Repair case not found."};if(repairCase.status!=="in_repair")return{error:"Mark the repair case as In repair before recording completed work."};if(repairCase.maintenance_record_id)return{error:"This repair case already has a completed repair record."}}
  const recordInput:{owner_id:string;vehicle_id:string;shop_id:string|null;record_type:string;title:string;description:string;performed_at:string;mileage:number;cost:number;invoice_number?:string|null;invoice_date?:string|null}={owner_id:auth.user.id,vehicle_id:vehicleId,shop_id:value.shopId||null,record_type:value.type,title:value.title,description:value.notes,performed_at:value.date,mileage:value.mileage,cost:value.cost};
  if(repairCaseId){recordInput.invoice_number=value.invoiceNumber||null;recordInput.invoice_date=value.invoiceDate||null}
  const {data:record,error}=await auth.supabase.from("maintenance_records").insert(recordInput).select("id").single();
  if(error)return{error:error.message.includes("invoice_")?"The repair-completion database update has not been installed yet.":error.message};
  if(repairCaseId){
    const evidence:{maintenance_record_id:string;shop_id?:string}={maintenance_record_id:record.id};
    if(value.shopId)evidence.shop_id=value.shopId;
    const {data:updated,error:linkError}=await auth.supabase.from("repair_cases").update(evidence).eq("id",repairCaseId).eq("vehicle_id",vehicleId).select("id").maybeSingle();
    if(linkError||!updated){await auth.supabase.from("maintenance_records").delete().eq("id",record.id);return{error:"The repair record could not be connected to this case."}}
  }
  const {error:mileageError}=await auth.supabase.from("vehicle_mileage_entries").insert({owner_id:auth.user.id,vehicle_id:vehicleId,mileage:value.mileage,recorded_at:`${value.date}T12:00:00Z`,source:value.type==="repair"?"repair":"maintenance"});
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);
  if(repairCaseId)revalidatePath(`/vehicles/${vehicleId}/repairs/${repairCaseId}`);
  if(mileageError)return{error:"The record was saved, but the vehicle mileage could not be updated."};
  redirect(repairCaseId?`/vehicles/${vehicleId}/repairs/${repairCaseId}`:safeInternalPath(returnTo,`/vehicles/${vehicleId}`));
}

export async function updateMaintenanceRecord(vehicleId:string,recordId:string,input:unknown):Promise<ActionState>{
  const parsed=maintenanceSchema.safeParse(input);if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const value=parsed.data;
  const {data:existing,error:readError}=await auth.supabase.from("maintenance_records").select("id").eq("id",recordId).eq("vehicle_id",vehicleId).maybeSingle();
  if(readError||!existing)return{error:"Maintenance record not found."};
  const {data:repairCase}=await auth.supabase.from("repair_cases").select("id").eq("vehicle_id",vehicleId).eq("maintenance_record_id",recordId).maybeSingle();
  if(repairCase&&value.type!=="repair")return{error:"A completed repair must remain a repair record."};
  const updates:{shop_id:string|null;record_type:string;title:string;description:string;performed_at:string;mileage:number;cost:number;updated_at:string;invoice_number?:string|null;invoice_date?:string|null}={shop_id:value.shopId||null,record_type:value.type,title:value.title,description:value.notes,performed_at:value.date,mileage:value.mileage,cost:value.cost,updated_at:new Date().toISOString()};
  if(repairCase){updates.invoice_number=value.invoiceNumber||null;updates.invoice_date=value.invoiceDate||null}
  const {data,error}=await auth.supabase.from("maintenance_records").update(updates).eq("id",recordId).eq("vehicle_id",vehicleId).select("id").maybeSingle();
  if(error||!data)return{error:"We couldn’t update this maintenance record. Try again."};
  await auth.supabase.from("vehicle_mileage_entries").insert({owner_id:auth.user.id,vehicle_id:vehicleId,mileage:value.mileage,recorded_at:`${value.date}T12:00:00Z`,source:value.type==="repair"?"repair":"maintenance"});
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);if(repairCase)revalidatePath(`/vehicles/${vehicleId}/repairs/${repairCase.id}`);
  redirect(`/vehicles/${vehicleId}`);
}

export async function createSymptom(vehicleId:string,input:unknown,returnTo?:string):Promise<ActionState>{
  const parsed=symptomSchema.safeParse(input);if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const value=parsed.data;
  const {error}=await auth.supabase.from("symptoms").insert({owner_id:auth.user.id,vehicle_id:vehicleId,title:value.title,description:value.description,severity:value.severity,frequency:value.frequency,status:"open",warning_light:value.warningLight,first_noticed_at:value.firstNoticed,mileage:value.mileage});
  if(error)return{error:error.message};
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);redirect(safeInternalPath(returnTo,`/vehicles/${vehicleId}`));
}

export async function updateSymptom(vehicleId:string,symptomId:string,input:unknown):Promise<ActionState>{
  const parsed=symptomSchema.safeParse(input);if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};const value=parsed.data;
  const {data,error}=await auth.supabase.from("symptoms").update({title:value.title,description:value.description,severity:value.severity,frequency:value.frequency,warning_light:value.warningLight,first_noticed_at:value.firstNoticed,mileage:value.mileage,updated_at:new Date().toISOString()}).eq("id",symptomId).eq("vehicle_id",vehicleId).select("id").maybeSingle();
  if(error||!data)return{error:"We couldn’t update this symptom. Try again."};
  await auth.supabase.from("repair_cases").update({title:value.title,updated_at:new Date().toISOString()}).eq("symptom_id",symptomId).eq("vehicle_id",vehicleId);
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);redirect(`/vehicles/${vehicleId}`);
}

export async function createReminder(vehicleId:string,input:unknown,returnTo?:string):Promise<ActionState>{
  const parsed=reminderSchema.safeParse(input);if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const {data:vehicle,error:vehicleError}=await auth.supabase.from("vehicles").select("id").eq("id",vehicleId).maybeSingle();
  if(vehicleError||!vehicle)return{error:"Vehicle not found."};
  const value=parsed.data;
  const {error}=await auth.supabase.from("reminders").insert({owner_id:auth.user.id,vehicle_id:vehicleId,title:value.title,due_date:value.dueDate||null,due_mileage:value.dueMileage??null,status:"pending"});
  if(error)return{error:"We couldn’t save this reminder. Try again."};
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);
  redirect(safeInternalPath(returnTo,`/vehicles/${vehicleId}`));
}

export async function updateReminderStatus(input:unknown):Promise<ActionState>{
  const parsed=reminderStatusUpdateSchema.safeParse(input);if(!parsed.success)return{error:"The reminder details are invalid."};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const {reminderId,vehicleId,status}=parsed.data;
  const {data,error}=await auth.supabase.from("reminders").update({status,completed_at:status==="completed"?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("id",reminderId).eq("vehicle_id",vehicleId).eq("status","pending").select("id").maybeSingle();
  if(error)return{error:"We couldn’t update this reminder. Try again."};
  if(!data)return{error:"This reminder is already handled or no longer exists."};
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);
  return{success:status==="completed"?"Reminder completed.":"Reminder dismissed."};
}

export async function createShop(input:unknown,returnTo?:string):Promise<ActionState>{
  const parsed=shopSchema.safeParse(input);if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const value=parsed.data;
  const {error}=await auth.supabase.rpc("create_user_shop",{p_name:value.name,p_specialty:value.specialty||null,p_address:value.address||null,p_phone:value.phone||null,p_website:value.website||null});
  if(error)return{error:error.message.includes("Could not find the function")?"The repair-evidence database update has not been installed yet.":"We couldn’t save this repair shop. Try again."};
  revalidatePath("/shops");
  const destination=returnTo?.startsWith("/vehicles/")?returnTo:"/shops";
  redirect(destination);
}

export async function saveDiscoveredShop(input:unknown):Promise<ActionState>{
  const parsed=discoveredShopSchema.safeParse(input);if(!parsed.success)return{error:"This shop listing is incomplete. Search again and retry."};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const value=parsed.data;
  const rpcInput={p_google_place_id:value.googlePlaceId,p_name:value.name,p_specialty:value.specialty,p_address:value.address,p_phone:value.phone,p_website:value.website};
  const {error}=await auth.supabase.rpc("save_discovered_shop",rpcInput);
  if(error){
    if(error.message.includes("Could not find the function")){
      const {error:fallbackError}=await auth.supabase.rpc("create_user_shop",{p_name:value.name,p_specialty:value.specialty,p_address:value.address,p_phone:value.phone,p_website:value.website});
      if(fallbackError)return{error:"We couldn’t save this repair shop. Try again."};
    }else return{error:"We couldn’t save this repair shop. Try again."};
  }
  revalidatePath("/shops");
  return{success:`${value.name} is now in My Shops.`};
}

export async function updateShopPreferences(shopId:string,input:unknown):Promise<ActionState>{
  const parsed=shopPreferencesSchema.safeParse(input);if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};const value=parsed.data;
  const {data:shop}=await auth.supabase.from("shops").select("id").eq("id",shopId).maybeSingle();if(!shop)return{error:"Repair shop not found."};
  const {error}=await auth.supabase.from("user_shops").upsert({owner_id:auth.user.id,shop_id:shopId,preferred:value.preferred,private_notes:value.privateNotes||null,personal_rating:value.personalRating??null,updated_at:new Date().toISOString()},{onConflict:"owner_id,shop_id"});
  if(error)return{error:"We couldn’t save your shop preferences. Try again."};revalidatePath("/shops");redirect("/shops");
}

export async function updateRepairCaseShop(input:unknown):Promise<ActionState>{
  const parsed=repairCaseShopSchema.safeParse(input);if(!parsed.success)return{error:"Choose a valid repair shop."};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const {vehicleId,repairCaseId,shopId}=parsed.data;
  if(shopId){const {data:shop}=await auth.supabase.from("shops").select("id").eq("id",shopId).maybeSingle();if(!shop)return{error:"Repair shop not found."}}
  const {data,error}=await auth.supabase.from("repair_cases").update({shop_id:shopId||null}).eq("id",repairCaseId).eq("vehicle_id",vehicleId).select("id").maybeSingle();
  if(error||!data)return{error:"We couldn’t connect this shop to the repair case."};
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);revalidatePath(`/vehicles/${vehicleId}/repairs/${repairCaseId}`);
  return{success:shopId?"Repair shop connected.":"Repair shop removed."};
}

export async function updateRepairCaseStatus(input:unknown):Promise<ActionState>{
  const parsed=repairCaseTransitionSchema.safeParse(input);if(!parsed.success)return{error:"Choose a valid repair case stage."};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const {vehicleId,repairCaseId,status}=parsed.data;
  const {data:repairCase,error:readError}=await auth.supabase.from("repair_cases").select("status").eq("id",repairCaseId).eq("vehicle_id",vehicleId).maybeSingle();
  if(readError)return{error:"We couldn’t load this repair case. Try again."};if(!repairCase)return{error:"Repair case not found."};
  const currentStatus=repairCase.status as RepairCaseStatus;
  if(!canTransitionRepairCase(currentStatus,status))return{error:"That stage change is not available from the current repair status."};
  const {error}=await auth.supabase.rpc("transition_repair_case",{p_vehicle_id:vehicleId,p_repair_case_id:repairCaseId,p_status:status});
  if(error){if(error.message.includes("received estimate"))return{error:"Add and mark an estimate received before advancing this case."};if(error.message.includes("approved estimate"))return{error:"Approve an estimate before advancing this case."};if(error.message.includes("completed repair record"))return{error:"Add the completed repair record and final cost before completing this case."};return{error:error.message.includes("Could not find the function")?"The repair-case database update has not been installed yet.":"We couldn’t update this repair case. Try again."}}
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);revalidatePath(`/vehicles/${vehicleId}/repairs/${repairCaseId}`);
  return{success:status==="completed"?"Repair marked complete.":status==="closed"?"Repair case closed.":"Repair stage updated."};
}

export async function saveEstimate(vehicleId:string,repairCaseId:string,estimateId:string|null,input:unknown):Promise<ActionState>{
  const parsed=estimateSchema.safeParse(input);if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const value=parsed.data;
  const items=value.items.map(item=>({description:item.description,category:item.category||null,parts_cost:item.partsCost,labor_cost:item.laborCost,quantity:item.quantity}));
  const {error}=await auth.supabase.rpc("upsert_repair_estimate",{p_estimate_id:estimateId,p_repair_case_id:repairCaseId,p_vehicle_id:vehicleId,p_shop_id:value.shopId,p_status:value.status,p_estimate_date:value.estimateDate,p_expires_at:value.expiresAt||null,p_notes:value.notes||null,p_items:items});
  if(error){if(error.message.includes("Could not find the function"))return{error:"The structured-estimates database update has not been installed yet."};if(error.message.includes("locked"))return{error:"This estimate is part of the permanent repair history and can no longer be edited."};return{error:"We couldn’t save this estimate. Check the details and try again."}}
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);revalidatePath(`/vehicles/${vehicleId}/repairs/${repairCaseId}`);
  redirect(`/vehicles/${vehicleId}/repairs/${repairCaseId}`);
}

export async function decideEstimate(input:unknown):Promise<ActionState>{
  const parsed=estimateDecisionSchema.safeParse(input);if(!parsed.success)return{error:"The estimate decision is invalid."};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const {estimateId,vehicleId,repairCaseId,decision}=parsed.data;
  const {data:estimate}=await auth.supabase.from("estimates").select("id").eq("id",estimateId).eq("vehicle_id",vehicleId).eq("repair_case_id",repairCaseId).maybeSingle();if(!estimate)return{error:"Estimate not found."};
  const {error}=await auth.supabase.rpc("decide_repair_estimate",{p_estimate_id:estimateId,p_decision:decision});
  if(error){if(error.message.includes("expired"))return{error:"This estimate has expired. Ask the shop for an updated estimate."};if(error.message.includes("approved")||error.code==="23505")return{error:"Another estimate is already approved for this repair."};return{error:"We couldn’t record this decision. Refresh and try again."}}
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);revalidatePath(`/vehicles/${vehicleId}/repairs/${repairCaseId}`);
  return{success:decision==="approved"?"Estimate approved and repair case advanced.":"Estimate declined. The repair case remains open."};
}

export async function deleteDraftEstimate(input:unknown):Promise<ActionState>{
  const parsed=estimateDeleteSchema.safeParse(input);if(!parsed.success)return{error:"The estimate details are invalid."};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const {estimateId,vehicleId,repairCaseId}=parsed.data;
  const {data:estimate}=await auth.supabase.from("estimates").select("id,status").eq("id",estimateId).eq("vehicle_id",vehicleId).eq("repair_case_id",repairCaseId).maybeSingle();if(!estimate)return{error:"Estimate not found."};
  if(estimate.status!=="draft")return{error:"Only draft estimates can be deleted."};
  const {error}=await auth.supabase.rpc("delete_draft_estimate",{p_estimate_id:estimateId});if(error)return{error:"We couldn’t delete this draft estimate."};
  revalidatePath(`/vehicles/${vehicleId}/repairs/${repairCaseId}`);return{success:"Draft estimate deleted."};
}

export interface DocumentUploadPreparation extends ActionState {path?:string;token?:string}

export async function prepareDocumentUpload(input:unknown):Promise<DocumentUploadPreparation>{
  const parsed=documentUploadSchema.safeParse(input);
  if(!parsed.success)return{error:parsed.error.issues[0]?.message??"Choose a valid document."};
  const auth=await authenticated();if(!auth)return{error:"Your session expired."};
  const {vehicleId,fileName}=parsed.data;const repairCaseId=parsed.data.repairCaseId||null;const estimateId=parsed.data.estimateId||null;const maintenanceRecordId=parsed.data.maintenanceRecordId||null;
  const {data:vehicle}=await auth.supabase.from("vehicles").select("id").eq("id",vehicleId).maybeSingle();if(!vehicle)return{error:"Vehicle not found."};
  if(repairCaseId){const {data:repairCase}=await auth.supabase.from("repair_cases").select("id").eq("id",repairCaseId).eq("vehicle_id",vehicleId).maybeSingle();if(!repairCase)return{error:"Repair case not found."}}
  if(estimateId){const {data:estimate}=await auth.supabase.from("estimates").select("id").eq("id",estimateId).eq("vehicle_id",vehicleId).eq("repair_case_id",repairCaseId).maybeSingle();if(!estimate)return{error:"Estimate not found."}}
  if(maintenanceRecordId){const {data:record}=await auth.supabase.from("maintenance_records").select("id").eq("id",maintenanceRecordId).eq("vehicle_id",vehicleId).maybeSingle();if(!record)return{error:"Repair record not found."};const {data:repairCase}=await auth.supabase.from("repair_cases").select("id").eq("id",repairCaseId).eq("maintenance_record_id",maintenanceRecordId).maybeSingle();if(!repairCase)return{error:"This repair record is not connected to the case."}}
  const path=buildVehicleDocumentPath(auth.user.id,vehicleId,fileName);
  const {data,error}=await auth.supabase.storage.from("vehicle-documents").createSignedUploadUrl(path,{upsert:false});
  if(error||!data)return{error:"We couldn’t prepare this upload. Try again."};
  return{path:data.path,token:data.token};
}

export async function completeDocumentUpload(input:unknown):Promise<ActionState>{
  const parsed=documentCompletionSchema.safeParse(input);if(!parsed.success)return{error:"The uploaded document details are invalid."};
  const auth=await authenticated();if(!auth)return{error:"Your session expired."};
  const {vehicleId,documentType,fileName,mimeType,fileSize,storagePath}=parsed.data;const repairCaseId=parsed.data.repairCaseId||null;const estimateId=parsed.data.estimateId||null;const maintenanceRecordId=parsed.data.maintenanceRecordId||null;
  const expectedPrefix=`${auth.user.id}/${vehicleId}/`;
  if(!storagePath.startsWith(expectedPrefix))return{error:"The document upload path is invalid."};
  const {data:vehicle}=await auth.supabase.from("vehicles").select("id").eq("id",vehicleId).maybeSingle();if(!vehicle)return{error:"Vehicle not found."};
  if(repairCaseId){const {data:repairCase}=await auth.supabase.from("repair_cases").select("id").eq("id",repairCaseId).eq("vehicle_id",vehicleId).maybeSingle();if(!repairCase)return{error:"Repair case not found."}}
  if(estimateId){const {data:estimate}=await auth.supabase.from("estimates").select("id").eq("id",estimateId).eq("vehicle_id",vehicleId).eq("repair_case_id",repairCaseId).maybeSingle();if(!estimate)return{error:"Estimate not found."}}
  if(maintenanceRecordId){const {data:record}=await auth.supabase.from("maintenance_records").select("id").eq("id",maintenanceRecordId).eq("vehicle_id",vehicleId).maybeSingle();if(!record)return{error:"Repair record not found."};const {data:repairCase}=await auth.supabase.from("repair_cases").select("id").eq("id",repairCaseId).eq("maintenance_record_id",maintenanceRecordId).maybeSingle();if(!repairCase)return{error:"This repair record is not connected to the case."}}
  const {error}=await auth.supabase.from("documents").insert({owner_id:auth.user.id,vehicle_id:vehicleId,repair_case_id:repairCaseId,estimate_id:estimateId,maintenance_record_id:maintenanceRecordId,document_type:documentType,storage_path:storagePath,file_name:fileName,mime_type:mimeType,file_size_bytes:fileSize});
  if(error){await auth.supabase.storage.from("vehicle-documents").remove([storagePath]);return{error:"The file uploaded, but GarageBook couldn’t save its document record. Please try again."}}
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);if(repairCaseId)revalidatePath(`/vehicles/${vehicleId}/repairs/${repairCaseId}`);
  return{success:"Document uploaded and connected."};
}

export async function deleteDocument(input:unknown):Promise<ActionState>{
  const parsed=documentDeleteSchema.safeParse(input);if(!parsed.success)return{error:"The document details are invalid."};
  const auth=await authenticated();if(!auth)return{error:"Your session expired. Please log in again."};
  const {documentId,vehicleId}=parsed.data;const repairCaseId=parsed.data.repairCaseId||null;
  let documentQuery=auth.supabase.from("documents").select("id,storage_path,file_name").eq("id",documentId).eq("vehicle_id",vehicleId);
  documentQuery=repairCaseId?documentQuery.eq("repair_case_id",repairCaseId):documentQuery.is("repair_case_id",null);
  const {data:document,error:readError}=await documentQuery.maybeSingle();
  if(readError)return{error:"We couldn’t verify this document. Try again."};
  if(!document)return{error:"This document no longer exists or you don’t have access to it."};
  const {error:storageError}=await auth.supabase.storage.from("vehicle-documents").remove([document.storage_path]);
  if(storageError)return{error:"The file could not be removed from secure storage. Nothing was deleted."};
  const {data:deleted,error:deleteError}=await auth.supabase.from("documents").delete().eq("id",documentId).eq("vehicle_id",vehicleId).select("id").maybeSingle();
  if(deleteError||!deleted)return{error:"The file was removed, but its list entry could not be cleared. Refresh and try again."};
  revalidatePath("/dashboard");revalidatePath(`/vehicles/${vehicleId}`);if(repairCaseId)revalidatePath(`/vehicles/${vehicleId}/repairs/${repairCaseId}`);
  return{success:`${document.file_name} was permanently deleted.`};
}
