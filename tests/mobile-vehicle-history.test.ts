import { describe, expect, it } from "vitest";
import { buildVehicleHistory } from "../apps/mobile/src/lib/vehicle-history";

describe("mobile vehicle history",()=>{
  it("combines record types chronologically with evidence-specific tones",()=>{
    const history=buildVehicleHistory({
      maintenance:[{id:"maintenance",title:"Oil service",record_type:"maintenance",performed_at:"2026-08-12",mileage:120000,cost:125}],
      symptoms:[{id:"symptom",title:"Oil warning",status:"open",first_noticed_at:"2026-08-15",mileage:120200,severity:"high"}],
      documents:[{id:"document",file_name:"invoice.pdf",document_type:"invoice",uploaded_at:"2026-08-16T12:00:00Z"}],
      mileage:[{id:"mileage",mileage:120100,recorded_at:"2026-08-14T12:00:00Z",source:"manual"}],
    });
    expect(history.map(event=>event.id)).toEqual(["document-document","symptom-symptom","mileage-mileage","maintenance-maintenance"]);
    expect(history.map(event=>event.tone)).toEqual(["document","attention","neutral","service"]);
  });

  it("uses completion color only for resolved symptoms",()=>{
    const [event]=buildVehicleHistory({maintenance:[],documents:[],mileage:[],symptoms:[{id:"resolved",title:"Noise",status:"resolved",first_noticed_at:"2026-08-01",mileage:null,severity:"low"}]});
    expect(event.tone).toBe("complete");
    expect(event.label).toBe("Resolved symptom");
  });
});
