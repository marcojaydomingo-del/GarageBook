export type TimelineEventType = "maintenance" | "repair" | "symptom" | "shop_visit" | "mileage_update" | "document_upload";
export interface TimelineEvent { id:string; type:TimelineEventType; title:string; date:string; mileage?:number; description:string; cost?:number; status?:"completed"|"open"|"monitoring"; shop?:string; href?:string; actionLabel?:string; }
export interface Vehicle { id:string; year:number; make:string; model:string; trim:string; mileage:number; vin:string; color:string; healthScore:number; healthLabel:string; nextService:string; totalSpend:number; }
export interface Shop { id:string; name:string; specialty:string; address:string; phone:string; visits:number; lastVisit:string; totalSpend:number; preferred:boolean; }
