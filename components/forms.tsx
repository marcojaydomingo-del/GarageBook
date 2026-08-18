"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cloneElement, isValidElement, useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { createMaintenance, createShop, createSymptom, createVehicle, updateMaintenanceRecord, updateShopPreferences, updateSymptom, updateVehicle } from "@/app/actions";
import {
  maintenanceSchema,
  shopPreferencesSchema,
  shopSchema,
  symptomSchema,
  vehicleSchema,
  type MaintenanceFields,
  type ShopFields,
  type ShopPreferencesFields,
  type SymptomFields,
  type VehicleFields,
} from "@/lib/validation";
interface ShopOption {
  id: string;
  name: string;
}
function localDateToday(){const now=new Date();return new Date(now.getTime()-now.getTimezoneOffset()*60_000).toISOString().slice(0,10)}
export function VehicleForm({vehicle,onboarding=false}:{vehicle?:VehicleFields&{id:string};onboarding?:boolean}={}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFields>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      year: vehicle?.year??new Date().getFullYear(),
      make: vehicle?.make??"",
      model: vehicle?.model??"",
      trim: vehicle?.trim??"",
      mileage: vehicle?.mileage??0,
      vin: vehicle?.vin??"",
      color: vehicle?.color??"",
    },
  });
  const submit = handleSubmit((values) =>
    startTransition(async () => {
      const result = vehicle?await updateVehicle(vehicle.id,values):await createVehicle(values,onboarding);
      setServerError(result?.error);
    }),
  );
  return (
    <FormFrame error={serverError}>
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Model year" error={errors.year?.message}>
          <input type="number" {...register("year", { valueAsNumber: true })} />
        </Field>
        <Field label="Make" error={errors.make?.message}>
          <input {...register("make")} />
        </Field>
        <Field label="Model" error={errors.model?.message}>
          <input {...register("model")} />
        </Field>
        <Field label="Trim">
          <input {...register("trim")} />
        </Field>
        <Field label="Current mileage" error={errors.mileage?.message}>
          <input type="number" {...register("mileage", { valueAsNumber: true })} />
        </Field>
        <Field label="Exterior color">
          <input {...register("color")} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="VIN (optional)" error={errors.vin?.message}>
            <input maxLength={17} {...register("vin")} />
          </Field>
        </div>
        <FormActions busy={pending} label={vehicle?"Save vehicle changes":onboarding?"Add vehicle and continue":"Add vehicle"} cancel={router.back} />
      </form>
    </FormFrame>
  );
}
export function MaintenanceForm({
  vehicleId,
  mileage,
  shops,
  repairCaseId,
  repairCaseTitle,
  defaultShopId,
  record,
  returnTo,
}: {
  vehicleId: string;
  mileage: number;
  shops: ShopOption[];
  repairCaseId?:string;
  repairCaseTitle?:string;
  defaultShopId?:string;
  record?:MaintenanceFields&{id:string};
  returnTo?:string;
}) {
  const connectedRepairCaseId=record?.repairCaseId||repairCaseId;
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaintenanceFields>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      type: record?.type??(repairCaseId ? "repair" : "maintenance"),
      title: record?.title??"",
      date: record?.date??localDateToday(),
      mileage: record?.mileage??mileage,
      shopId: record?.shopId??defaultShopId??"",
      cost: record?.cost??0,
      notes: record?.notes??"",
      repairCaseId: connectedRepairCaseId??"",
      invoiceNumber: record?.invoiceNumber??"",
      invoiceDate: record?.invoiceDate??"",
    },
  });
  const submit = handleSubmit((values) =>
    startTransition(async () => {
      const result = record?await updateMaintenanceRecord(vehicleId,record.id,values):await createMaintenance(vehicleId, values,returnTo);
      setServerError(result?.error);
    }),
  );
  return (
    <FormFrame error={serverError}>
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
        {connectedRepairCaseId&&<>
          <input type="hidden" {...register("repairCaseId")}/>
          <input type="hidden" {...register("type")}/>
        </>}
        {repairCaseTitle&&<div className="sm:col-span-2 rounded-xl bg-[#eaf4f1] p-4 text-sm text-[#315c55]"><span className="font-semibold">Connected repair case:</span> {repairCaseTitle}</div>}
        <Field label="Record type">
          {connectedRepairCaseId?<select disabled value="repair"><option value="repair">Repair</option></select>:<select {...register("type")}>
            <option value="maintenance">Maintenance</option>
            <option value="repair">Repair</option>
            <option value="inspection">Inspection</option>
          </select>}
        </Field>
        <Field label="Service date" error={errors.date?.message}>
          <input type="date" {...register("date")} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Service or repair" error={errors.title?.message}>
            <input
              placeholder="e.g. Front brake pad replacement"
              {...register("title")}
            />
          </Field>
        </div>
        <Field label="Mileage" error={errors.mileage?.message}>
          <input type="number" {...register("mileage", { valueAsNumber: true })} />
        </Field>
        <Field label="Total cost" error={errors.cost?.message}>
          <input min="0" step="0.01" type="number" {...register("cost", { valueAsNumber: true })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Repair shop">
            <select {...register("shopId")}>
              <option value="">No shop selected</option>
              {shops.map((shop) => (
                <option value={shop.id} key={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </Field>
          {!shops.length&&<p className="mt-2 text-xs text-muted">No repair shops saved yet. <Link className="font-semibold text-teal" href={`/shops/new?returnTo=${encodeURIComponent(connectedRepairCaseId?`/vehicles/${vehicleId}/maintenance/new?case=${connectedRepairCaseId}`:`/vehicles/${vehicleId}/maintenance/new`)}`}>Add a shop</Link></p>}
        </div>
        <div className="sm:col-span-2">
          <Field label="Work performed" error={errors.notes?.message}>
            <textarea {...register("notes")} />
          </Field>
        </div>
        {connectedRepairCaseId&&<>
          <div className="sm:col-span-2 border-t border-[#e5e8e5] pt-5"><h2 className="text-base font-semibold">Invoice details <span className="font-normal text-muted">(optional)</span></h2><p className="mt-1 text-sm leading-6 text-muted">Add the shop’s reference now or attach the invoice from the repair case later.</p></div>
          <Field label="Invoice number" error={errors.invoiceNumber?.message}><input maxLength={120} placeholder="e.g. INV-10482" {...register("invoiceNumber")}/></Field>
          <Field label="Invoice date" error={errors.invoiceDate?.message}><input type="date" {...register("invoiceDate")}/></Field>
        </>}
        <FormActions
          busy={pending}
          label={record?"Save record changes":connectedRepairCaseId?"Save connected repair":"Save maintenance record"}
          cancel={router.back}
        />
      </form>
    </FormFrame>
  );
}
export function ShopForm({returnTo}:{returnTo?:string}) {
  const router=useRouter();
  const [serverError,setServerError]=useState<string>();
  const [pending,startTransition]=useTransition();
  const {register,handleSubmit,formState:{errors}}=useForm<ShopFields>({resolver:zodResolver(shopSchema),defaultValues:{name:"",specialty:"",address:"",phone:"",website:""}});
  const submit=handleSubmit((values)=>startTransition(async()=>{const result=await createShop(values,returnTo);setServerError(result?.error)}));
  return <FormFrame error={serverError}><form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
    <div className="sm:col-span-2"><Field label="Shop name" error={errors.name?.message}><input autoComplete="organization" {...register("name")}/></Field></div>
    <Field label="Specialty"><input placeholder="e.g. MINI and BMW specialist" {...register("specialty")}/></Field>
    <Field label="Phone"><input autoComplete="tel" type="tel" {...register("phone")}/></Field>
    <div className="sm:col-span-2"><Field label="Address"><input autoComplete="street-address" {...register("address")}/></Field></div>
    <div className="sm:col-span-2"><Field label="Website" error={errors.website?.message}><input autoComplete="url" placeholder="https://" type="url" {...register("website")}/></Field></div>
    <FormActions busy={pending} label="Save repair shop" cancel={router.back}/>
  </form></FormFrame>;
}
export function ShopPreferencesForm({shop}:{shop:{id:string;name:string;preferred:boolean;privateNotes:string|null;personalRating:number|null}}){
  const router=useRouter();const [serverError,setServerError]=useState<string>();const [pending,startTransition]=useTransition();
  const {register,handleSubmit,formState:{errors}}=useForm<ShopPreferencesFields>({resolver:zodResolver(shopPreferencesSchema),defaultValues:{preferred:shop.preferred,privateNotes:shop.privateNotes??"",personalRating:shop.personalRating??undefined}});
  const submit=handleSubmit(values=>startTransition(async()=>{const result=await updateShopPreferences(shop.id,values);setServerError(result?.error)}));
  return <FormFrame error={serverError}><form className="grid gap-5" onSubmit={submit}><div className="rounded-xl bg-[#f2f4f1] p-4"><p className="font-semibold">{shop.name}</p><p className="mt-1 text-sm leading-6 text-muted">The shared shop listing stays consistent for everyone. These preferences and notes are private to your account.</p></div><label className="flex items-center gap-3 rounded-xl border border-[#dde3df] p-4 text-sm font-medium"><input className="h-4 w-4 accent-[#087f75]" type="checkbox" {...register("preferred")}/>Mark as a preferred shop</label><Field label="Personal rating"><select {...register("personalRating",{setValueAs:value=>value===""?undefined:Number(value)})}><option value="">No rating</option>{[1,2,3,4,5].map(value=><option value={value} key={value}>{value} of 5</option>)}</select></Field><Field label="Private notes" error={errors.privateNotes?.message}><textarea placeholder="People to ask for, service experience, or details you want to remember" {...register("privateNotes")}/></Field><FormActions busy={pending} label="Save shop preferences" cancel={router.back}/></form></FormFrame>
}
export function SymptomForm({
  vehicleId,
  mileage,
  symptom,
  returnTo,
}: {
  vehicleId: string;
  mileage: number;
  symptom?:SymptomFields&{id:string};
  returnTo?:string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SymptomFields>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      title: symptom?.title??"",
      firstNoticed: symptom?.firstNoticed??localDateToday(),
      mileage: symptom?.mileage??mileage,
      severity: symptom?.severity,
      frequency: symptom?.frequency??"intermittent",
      description: symptom?.description??"",
      warningLight: symptom?.warningLight??false,
    },
  });
  const submit = handleSubmit((values) =>
    startTransition(async () => {
      const result = symptom?await updateSymptom(vehicleId,symptom.id,values):await createSymptom(vehicleId, values,returnTo);
      setServerError(result?.error);
    }),
  );
  return (
    <FormFrame error={serverError}>
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
        <div className="sm:col-span-2">
          <Field label="Short title" error={errors.title?.message}>
            <input placeholder="e.g. Grinding noise when braking" {...register("title")} />
          </Field>
        </div>
        <Field label="First noticed" error={errors.firstNoticed?.message}>
          <input type="date" {...register("firstNoticed")} />
        </Field>
        <Field label="Mileage" error={errors.mileage?.message}>
          <input type="number" {...register("mileage", { valueAsNumber: true })} />
        </Field>
        <Field label="Severity" error={errors.severity?.message}>
          <select {...register("severity")}>
            <option value="">Choose severity</option>
            <option value="low">Low — monitor</option>
            <option value="medium">Medium — schedule soon</option>
            <option value="high">High — stop driving</option>
          </select>
        </Field>
        <Field label="Frequency">
          <select {...register("frequency")}>
            <option value="once">Happened once</option>
            <option value="intermittent">Intermittent</option>
            <option value="constant">Constant</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="Details"
            error={errors.description?.message}
          >
            <textarea placeholder="Describe when it happens, what it sounds or feels like, and anything that makes it better or worse." {...register("description")} />
          </Field>
        </div>
        <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#dde3df] p-4 text-sm font-medium">
          <input
            className="h-4 w-4 accent-[#087f75]"
            type="checkbox"
            {...register("warningLight")}
          />
          A dashboard warning light appeared
        </label>
        <FormActions busy={pending} label={symptom?"Save symptom changes":"Log symptom"} cancel={router.back} />
      </form>
    </FormFrame>
  );
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const generatedId=useId();
  const control=isValidElement<{id?:string}>(children)?cloneElement(children,{id:children.props.id??generatedId}):children;
  const controlId=isValidElement<{id?:string}>(control)?control.props.id:undefined;
  return (
    <div className="field">
      <label htmlFor={controlId}>{label}</label>
      {control}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
function FormActions({
  busy,
  label,
  cancel,
}: {
  busy: boolean;
  label: string;
  cancel: () => void;
}) {
  return (
    <div className="form-actions sm:col-span-2">
      <button className="btn btn-secondary" onClick={cancel} type="button">
        Cancel
      </button>
      <button className="btn btn-primary" disabled={busy} type="submit">
        {busy ? "Saving…" : label}
      </button>
    </div>
  );
}
function FormFrame({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="form-frame">
      {error && (
        <p
          className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      {children}
    </div>
  );
}
