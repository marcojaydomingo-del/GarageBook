"use client";
import { ErrorState } from "@/components/states";
export default function Error({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="mx-auto max-w-3xl p-6"><ErrorState/><button className="btn btn-primary mt-4" onClick={reset}>Try again</button></main>}
