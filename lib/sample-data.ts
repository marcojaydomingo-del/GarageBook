// Development/demo utility only. Authenticated application pages do not import this module.
import type { Shop, TimelineEvent, Vehicle } from "./types";

export const sampleVehicle: Vehicle = { id:"mini-paceman",year:2014,make:"MINI",model:"Cooper S Paceman",trim:"ALL4",mileage:121450,vin:"WMWSS7C58EWN•••••",color:"Oxford Green",healthScore:86,healthLabel:"Good",nextService:"Oil service in 2,550 mi",totalSpend:4387.64 };
export const timelineEvents: TimelineEvent[] = [
  {id:"evt-1",type:"repair",title:"Oil-pan gasket replacement",date:"2026-07-18",mileage:121120,description:"Oil pan removed, sealing surfaces cleaned, and gasket replaced. No active leaks after road test.",cost:986.42,status:"completed",shop:"North Loop Motorworks"},
  {id:"evt-2",type:"document_upload",title:"Repair invoice uploaded",date:"2026-07-18",description:"Invoice #NL-1842 attached to oil-pan gasket repair.",status:"completed"},
  {id:"evt-3",type:"repair",title:"Oil-filter-housing gasket replacement",date:"2026-05-09",mileage:119840,description:"Replaced leaking housing gasket and cleaned residual oil from engine block.",cost:642.18,status:"completed",shop:"North Loop Motorworks"},
  {id:"evt-4",type:"symptom",title:"Intermittent oil-pressure warning",date:"2026-04-28",mileage:119510,description:"Warning briefly appeared at warm idle twice. No abnormal engine noise.",status:"monitoring"},
  {id:"evt-5",type:"repair",title:"Thermostat housing replacement",date:"2026-02-14",mileage:116930,description:"Confirmed seepage at thermostat housing; replaced assembly and pressure-tested cooling system.",cost:811.75,status:"completed",shop:"North Loop Motorworks"},
  {id:"evt-6",type:"shop_visit",title:"Coolant leak diagnosis",date:"2026-02-08",mileage:116780,description:"Cooling system pressure test traced leak to thermostat housing seam.",cost:145,status:"completed",shop:"North Loop Motorworks"},
  {id:"evt-7",type:"maintenance",title:"Oil and filter service",date:"2025-11-22",mileage:113420,description:"Full-synthetic oil service, tire-pressure check, and multipoint inspection.",cost:168.29,status:"completed",shop:"MINI of the Valley"},
];
export const shops: Shop[] = [
  {id:"north-loop",name:"North Loop Motorworks",specialty:"MINI & BMW independent specialist",address:"2841 North Loop Ave, Los Angeles, CA",phone:"(323) 555-0148",visits:4,lastVisit:"Jul 18, 2026",totalSpend:2585.35,preferred:true},
  {id:"mini-valley",name:"MINI of the Valley",specialty:"Authorized MINI service center",address:"5850 Ventura Blvd, Sherman Oaks, CA",phone:"(818) 555-0192",visits:2,lastVisit:"Nov 22, 2025",totalSpend:802.29,preferred:false},
];
export const recentEvents = timelineEvents.slice(0,4);
export function formatCurrency(value:number){ return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(value); }
export function formatMileage(value:number){ return new Intl.NumberFormat("en-US").format(value); }
export function formatDate(value:string){ return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(new Date(`${value}T12:00:00`)); }
