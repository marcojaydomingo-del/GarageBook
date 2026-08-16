import Link from "next/link";
import { CarFront } from "lucide-react";

export function Brand() { return <Link className="brand" href="/"><span className="brand-mark"><CarFront size={18}/></span><span>Garage<span className="brand-accent">Book</span></span></Link>; }
