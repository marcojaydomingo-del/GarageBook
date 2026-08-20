import { describe, expect, it } from "vitest";
import { documentDeleteSchema, documentUploadSchema, estimateSchema, maintenanceSchema, reminderSchema, shopSchema, symptomSchema, vehicleSchema } from "../lib/validation";

describe("OTTOKO validation", () => {
  it("accepts a valid vehicle", () => {
    const result = vehicleSchema.parse({ year: 2014, make: "MINI", model: "Paceman", trim: "ALL4", mileage: 121450, vin: "", color: "Green" });
    expect(result.year).toBe(2014); expect(result.mileage).toBe(121450);
  });
  it("rejects malformed VINs and negative costs", () => {
    expect(vehicleSchema.safeParse({ year: 2014, make: "MINI", model: "Paceman", mileage: 1, vin: "INVALID", trim: "", color: "" }).success).toBe(false);
    expect(maintenanceSchema.safeParse({ type: "repair", title: "Repair", date: "2026-08-09", mileage: 1, shopId: "", cost: -1, notes: "Enough detail" }).success).toBe(false);
  });
  it("requires useful symptom detail", () => {
    expect(symptomSchema.safeParse({ title: "Oil warning", firstNoticed: "2026-08-09", mileage: 120000, severity: "medium", frequency: "intermittent", description: "short", warningLight: true }).success).toBe(false);
  });
  it("validates repair shop websites without requiring optional details", () => {
    expect(shopSchema.safeParse({ name: "North Loop Motorworks", specialty: "", address: "", phone: "", website: "" }).success).toBe(true);
    expect(shopSchema.safeParse({ name: "North Loop Motorworks", specialty: "", address: "", phone: "", website: "northloop.example" }).success).toBe(false);
  });
  it("accepts documents above 1 MB while enforcing the 10 MB product limit", () => {
    const document={vehicleId:"f2684d67-b9cc-4c2c-821d-927aebc76047",repairCaseId:"",documentType:"invoice",fileName:"invoice.pdf",mimeType:"application/pdf"};
    expect(documentUploadSchema.safeParse({...document,fileSize:1.5*1024*1024}).success).toBe(true);
    expect(documentUploadSchema.safeParse({...document,fileSize:10*1024*1024+1}).success).toBe(false);
  });
  it("requires owner-scoped identifiers for document deletion", () => {
    expect(documentDeleteSchema.safeParse({documentId:"bad",vehicleId:"f2684d67-b9cc-4c2c-821d-927aebc76047",repairCaseId:"8a490964-e2e5-48f9-879b-143807521ef0"}).success).toBe(false);
  });
  it("validates itemized estimates and their expiration",()=>{
    const estimate={shopId:"0f1656a3-e7c1-4ff3-81d6-405ffcdde5c4",status:"received",estimateDate:"2026-08-13",expiresAt:"2026-09-13",notes:"",items:[{description:"Oil pan gasket",category:"Engine",partsCost:250,laborCost:650,quantity:1}]};
    expect(estimateSchema.safeParse(estimate).success).toBe(true);
    expect(estimateSchema.safeParse({...estimate,expiresAt:"2026-08-01"}).success).toBe(false);
    expect(estimateSchema.safeParse({...estimate,items:[]}).success).toBe(false);
  });
  it("requires a reminder date, mileage, or both",()=>{
    expect(reminderSchema.safeParse({title:"Engine oil service",dueDate:"",dueMileage:125000}).success).toBe(true);
    expect(reminderSchema.safeParse({title:"Engine oil service",dueDate:"2026-11-15"}).success).toBe(true);
    expect(reminderSchema.safeParse({title:"Engine oil service",dueDate:""}).success).toBe(false);
  });
});
