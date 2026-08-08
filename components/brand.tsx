import Link from "next/link";
import { CarFront } from "lucide-react";

export function Brand() { return <Link className="flex items-center gap-2.5 font-semibold tracking-[-.02em]" href="/"><span className="grid h-9 w-9 place-items-center rounded-xl bg-teal text-white"><CarFront size={19}/></span><span className="text-lg">GarageBook</span></Link>; }
