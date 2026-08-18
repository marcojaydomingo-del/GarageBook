"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { createReminder } from "@/app/actions";
import { reminderSchema, type ReminderFields } from "@/lib/validation";

export function ReminderForm({ vehicleId, currentMileage, returnTo }: { vehicleId: string; currentMileage: number; returnTo?:string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<ReminderFields>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { title: "", dueDate: "", dueMileage: undefined },
  });

  const submit = handleSubmit((values) => startTransition(async () => {
    setServerError(undefined);
    const result = await createReminder(vehicleId, values,returnTo);
    setServerError(result?.error);
  }));

  return <div className="card p-5 sm:p-7">
    {serverError && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{serverError}</p>}
    <form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
      <div className="field sm:col-span-2">
        <label htmlFor="reminder-title">Service to remember</label>
        <input id="reminder-title" placeholder="e.g. Engine oil and filter change" {...register("title")}/>
        {errors.title && <p className="field-error" role="alert">{errors.title.message}</p>}
      </div>

      <div className="field">
        <label htmlFor="reminder-date">Due date <span className="font-normal text-muted">(optional)</span></label>
        <input id="reminder-date" type="date" {...register("dueDate")}/>
        {errors.dueDate && <p className="field-error" role="alert">{errors.dueDate.message}</p>}
      </div>

      <div className="field">
        <label htmlFor="reminder-mileage">Due mileage <span className="font-normal text-muted">(optional)</span></label>
        <input
          id="reminder-mileage"
          inputMode="numeric"
          min={currentMileage}
          placeholder="e.g. 125000"
          type="number"
          {...register("dueMileage", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
        />
        <p className="field-help">Current mileage: {currentMileage.toLocaleString()} mi</p>
        {errors.dueMileage && <p className="field-error" role="alert">{errors.dueMileage.message}</p>}
      </div>

      <p className="text-sm leading-6 text-muted sm:col-span-2">Use a date, mileage, or both. GarageBook will mark the reminder due when either limit is reached.</p>
      <div className="flex justify-end gap-3 border-t border-[#edf0ed] pt-5 sm:col-span-2">
        <button className="btn btn-secondary" onClick={router.back} type="button">Cancel</button>
        <button className="btn btn-primary" disabled={pending} type="submit">{pending ? "Saving…" : "Save reminder"}</button>
      </div>
    </form>
  </div>;
}
