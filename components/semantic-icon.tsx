import type { LucideIcon } from "lucide-react";

export type SemanticTone = "service" | "complete" | "attention" | "document" | "neutral";

export function SemanticIcon({icon:Icon,tone="neutral",size=18,className=""}:{icon:LucideIcon;tone?:SemanticTone;size?:number;className?:string}){
  return <span className={`semantic-icon semantic-icon-${tone} ${className}`.trim()} aria-hidden="true"><Icon size={size}/></span>;
}
