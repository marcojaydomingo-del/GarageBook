import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic="force-dynamic";

function privateResponse(response:NextResponse){
  response.headers.set("Cache-Control","private, no-store, max-age=0");
  response.headers.set("Vary","Cookie");
  return response;
}

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return privateResponse(NextResponse.redirect(new URL("/login",request.url)));
  const {data:document,error}=await supabase.from("documents").select("storage_path").eq("id",id).maybeSingle();
  if(error||!document)return privateResponse(new NextResponse("Document not found",{status:404}));
  const {data,error:signError}=await supabase.storage.from("vehicle-documents").createSignedUrl(document.storage_path,60);
  if(signError||!data)return privateResponse(new NextResponse("Document unavailable",{status:404}));
  return privateResponse(NextResponse.redirect(data.signedUrl));
}
