import { describe,expect,it } from "vitest";
import { nativeMaintenanceSchema,nativeSymptomSchema } from "../apps/mobile/src/lib/record-validation";

describe("mobile record validation",()=>{
  it("coerces valid maintenance input without weakening constraints",()=>{
    const parsed=nativeMaintenanceSchema.parse({type:"maintenance",title:"Oil service",date:"2026-08-15",mileage:"121450",cost:"189.50",notes:"Replaced oil and filter."});
    expect(parsed.mileage).toBe(121450);
    expect(parsed.cost).toBe(189.5);
  });

  it("rejects incomplete symptom evidence",()=>{
    const result=nativeSymptomSchema.safeParse({title:"Oil warning",firstNoticed:"2026-08-15",mileage:"121450",severity:"high",frequency:"intermittent",description:"short",warningLight:true});
    expect(result.success).toBe(false);
  });
});
