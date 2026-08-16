"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { parseRecoverySessionFragment } from "@/lib/domain/auth-recovery";
import { createClient } from "@/lib/supabase/browser";

export function RecoveryRedirect(){
  const router=useRouter();
  useEffect(()=>{
    const tokens=parseRecoverySessionFragment(window.location.hash);
    if(!tokens)return;
    const supabase=createClient();
    void supabase.auth.setSession({access_token:tokens.accessToken,refresh_token:tokens.refreshToken}).then(({error})=>{
      window.history.replaceState(null,"",window.location.pathname);
      router.replace(error?"/forgot-password?error=expired":"/reset-password");
    });
  },[router]);
  return null;
}
