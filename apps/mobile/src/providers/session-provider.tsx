import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { supabase } from "@/lib/supabase";

interface SessionContextValue { session:Session|null;loading:boolean }
const SessionContext=createContext<SessionContextValue|undefined>(undefined);

export function SessionProvider({children}:{children:React.ReactNode}){
  const [session,setSession]=useState<Session|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let mounted=true;
    void supabase.auth.getSession().then(({data})=>{if(mounted){setSession(data.session);setLoading(false)}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,nextSession)=>{setSession(nextSession);setLoading(false)});
    const appStateSubscription=AppState.addEventListener("change",state=>{if(state==="active")supabase.auth.startAutoRefresh();else supabase.auth.stopAutoRefresh()});
    return()=>{mounted=false;subscription.unsubscribe();appStateSubscription.remove()};
  },[]);
  const value=useMemo(()=>({session,loading}),[session,loading]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(){const value=useContext(SessionContext);if(!value)throw new Error("useSession must be used inside SessionProvider");return value}
