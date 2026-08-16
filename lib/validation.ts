import { z } from "zod";
import { repairCaseStatuses } from "./domain/repair-case";

export const vehicleSchema = z.object({
  year: z.number().int().min(1886).max(new Date().getFullYear() + 1),
  make: z.string().trim().min(2, "Enter the manufacturer").max(80), model: z.string().trim().min(1, "Enter the model").max(120),
  trim: z.string().trim().max(80).optional(), mileage: z.number().int().min(0, "Mileage cannot be negative").max(10_000_000),
  vin: z.string().trim().toUpperCase().refine((value) => value === "" || /^[A-HJ-NPR-Z0-9]{17}$/.test(value), "Enter a valid 17-character VIN"),
  color: z.string().trim().max(80).optional(),
});
export type VehicleFields = z.infer<typeof vehicleSchema>;

export const maintenanceSchema = z.object({
  type: z.enum(["maintenance", "repair", "inspection"]), title: z.string().trim().min(3, "Describe the service performed").max(160),
  date: z.iso.date("Choose a valid date"), mileage: z.number().int().min(0).max(10_000_000), shopId: z.string().uuid().or(z.literal("")),
  cost: z.number().min(0).max(10_000_000), notes: z.string().trim().min(5, "Add a brief service note").max(5000),
  repairCaseId: z.string().uuid().or(z.literal("")).optional(),
  invoiceNumber: z.string().trim().max(120, "Invoice numbers must be 120 characters or fewer").optional(),
  invoiceDate: z.union([z.iso.date(),z.literal("")]).optional(),
});
export type MaintenanceFields = z.infer<typeof maintenanceSchema>;

export const symptomSchema = z.object({
  title: z.string().trim().min(3, "Describe the problem").max(160), firstNoticed: z.iso.date(), mileage: z.number().int().min(0).max(10_000_000),
  severity: z.enum(["low", "medium", "high"]), frequency: z.enum(["once", "intermittent", "constant"]),
  description: z.string().trim().min(10, "Add a little more detail").max(5000), warningLight: z.boolean(),
});
export type SymptomFields = z.infer<typeof symptomSchema>;

export const reminderSchema = z.object({
  title: z.string().trim().min(3, "Describe the service to remember").max(160),
  dueDate: z.union([z.iso.date("Choose a valid due date"), z.literal("")]),
  dueMileage: z.number().int().min(0, "Mileage cannot be negative").max(10_000_000).optional(),
}).refine((value) => value.dueDate !== "" || value.dueMileage !== undefined, {
  message: "Add a due date, mileage, or both",
  path: ["dueDate"],
});
export type ReminderFields = z.infer<typeof reminderSchema>;

export const reminderStatusUpdateSchema = z.object({
  reminderId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  status: z.enum(["completed", "dismissed"]),
});

export const repairCaseStatusSchema = z.enum(repairCaseStatuses);
export const repairCaseTransitionSchema = z.object({
  vehicleId: z.string().uuid(),
  repairCaseId: z.string().uuid(),
  status: repairCaseStatusSchema,
});

export const repairCaseShopSchema = z.object({
  vehicleId: z.string().uuid(),
  repairCaseId: z.string().uuid(),
  shopId: z.string().uuid().or(z.literal("")),
});

export const estimateItemSchema = z.object({
  description: z.string().trim().min(2, "Describe the work item").max(240),
  category: z.string().trim().max(80).optional(),
  partsCost: z.number().min(0).max(10_000_000),
  laborCost: z.number().min(0).max(10_000_000),
  quantity: z.number().positive().max(10_000),
});
export const estimateSchema = z.object({
  shopId: z.string().uuid("Choose a repair shop"),
  status: z.enum(["draft", "received"]),
  estimateDate: z.iso.date("Choose a valid estimate date"),
  expiresAt: z.union([z.iso.date(), z.literal("")]),
  notes: z.string().trim().max(5000),
  items: z.array(estimateItemSchema).min(1, "Add at least one work item").max(50),
}).refine((value)=>!value.expiresAt||value.expiresAt>=value.estimateDate,{message:"Expiration must be on or after the estimate date",path:["expiresAt"]});
export type EstimateFields = z.infer<typeof estimateSchema>;
export const estimateDecisionSchema = z.object({
  estimateId: z.string().uuid(), vehicleId: z.string().uuid(), repairCaseId: z.string().uuid(), decision: z.enum(["approved", "declined"]),
});
export const estimateDeleteSchema = z.object({ estimateId:z.string().uuid(), vehicleId:z.string().uuid(), repairCaseId:z.string().uuid() });

export const shopSchema = z.object({
  name: z.string().trim().min(2, "Enter the shop name").max(160),
  specialty: z.string().trim().max(160).optional(),
  address: z.string().trim().max(300).optional(),
  phone: z.string().trim().max(40).optional(),
  website: z.string().trim().refine((value) => value === "" || /^https?:\/\//i.test(value), "Use a full URL beginning with http:// or https://").optional(),
});
export type ShopFields = z.infer<typeof shopSchema>;
export const shopPreferencesSchema = z.object({
  preferred: z.boolean(),
  privateNotes: z.string().trim().max(2000, "Private notes must be 2,000 characters or fewer"),
  personalRating: z.number().int().min(1).max(5).optional(),
});
export type ShopPreferencesFields = z.infer<typeof shopPreferencesSchema>;

export const authSchema = z.object({ email: z.email("Enter a valid email address"), password: z.string().min(8, "Use at least 8 characters") });
export const signupSchema = authSchema.extend({ fullName: z.string().trim().min(2, "Enter your full name").max(120) });
export const passwordResetRequestSchema = z.object({ email: z.email("Enter a valid email address") });
export const passwordUpdateSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters"),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const documentSchema = z.object({ vehicleId: z.string().uuid(), repairCaseId: z.string().uuid().or(z.literal("")).optional(), estimateId: z.string().uuid().or(z.literal("")).optional(), maintenanceRecordId: z.string().uuid().or(z.literal("")).optional(), documentType: z.enum(["receipt", "invoice", "estimate", "photo", "warranty", "other"]) });
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
export const documentUploadSchema = documentSchema.extend({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
  fileSize: z.number().int().positive().max(MAX_DOCUMENT_BYTES),
});
export const documentCompletionSchema = documentUploadSchema.extend({ storagePath: z.string().min(1).max(700) });
export const documentDeleteSchema = z.object({
  documentId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  repairCaseId: z.string().uuid().or(z.literal("")).optional(),
});
