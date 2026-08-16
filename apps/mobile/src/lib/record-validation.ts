import { z } from "zod";

const mileage=z.coerce.number().int().min(0,"Mileage cannot be negative").max(10_000_000,"Mileage is too large");

export const nativeMaintenanceSchema=z.object({
  type:z.enum(["maintenance","repair","inspection"]),
  title:z.string().trim().min(3,"Describe the service performed").max(160),
  date:z.iso.date("Use a date in YYYY-MM-DD format"),
  mileage,
  cost:z.coerce.number().min(0,"Cost cannot be negative").max(10_000_000,"Cost is too large"),
  notes:z.string().trim().min(5,"Add a brief service note").max(5000),
});

export const nativeSymptomSchema=z.object({
  title:z.string().trim().min(3,"Describe the problem").max(160),
  firstNoticed:z.iso.date("Use a date in YYYY-MM-DD format"),
  mileage,
  severity:z.enum(["low","medium","high"]),
  frequency:z.enum(["once","intermittent","constant"]),
  description:z.string().trim().min(10,"Add a little more detail").max(5000),
  warningLight:z.boolean(),
});

export function localDateToday(){const now=new Date();return new Date(now.getTime()-now.getTimezoneOffset()*60_000).toISOString().slice(0,10)}
