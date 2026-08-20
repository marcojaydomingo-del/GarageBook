import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Brand, Button, Field, InlineMessage, Panel, Screen } from "@/components/garage-ui";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/providers/session-provider";
import { usePalette } from "@/theme";

export default function LoginScreen(){
  const {session}=useSession();const p=usePalette();
  const [mode,setMode]=useState<"login"|"signup">("login");const [fullName,setFullName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [busy,setBusy]=useState(false);const [message,setMessage]=useState<{text:string;error?:boolean}>();
  if(session)return <Redirect href={session.user.user_metadata.onboarding_completed===true?"/(tabs)":"/onboarding"}/>;
  async function submit(){setBusy(true);setMessage(undefined);const normalized=email.trim().toLowerCase();if(!normalized.includes("@")||password.length<8){setMessage({text:"Enter a valid email and a password of at least 8 characters.",error:true});setBusy(false);return}
    if(mode==="signup"){
      if(fullName.trim().length<2){setMessage({text:"Enter your name to create the account.",error:true});setBusy(false);return}
      const {data,error}=await supabase.auth.signUp({email:normalized,password,options:{data:{full_name:fullName.trim(),onboarding_completed:false}}});
      if(error)setMessage({text:"We couldn’t create the account. If it already exists, sign in instead.",error:true});else if(!data.session)setMessage({text:"Check your email to confirm the account, then return here to sign in."});else router.replace("/onboarding");
    }else{
      const {data,error}=await supabase.auth.signInWithPassword({email:normalized,password});
      if(error)setMessage({text:"Email or password is incorrect.",error:true});else router.replace(data.user.user_metadata.onboarding_completed===true?"/(tabs)":"/onboarding");
    }setBusy(false);
  }
  async function resetPassword(){const normalized=email.trim().toLowerCase();if(!normalized.includes("@")){setMessage({text:"Enter your email first, then request the reset.",error:true});return}const {error}=await supabase.auth.resetPasswordForEmail(normalized,{redirectTo:"ottoko://reset-password"});setMessage(error?{text:"The reset email could not be sent. Wait a minute and try again.",error:true}:{text:"If an account exists, a password-reset email is on its way."})}
  return <Screen><Brand/><View style={styles.hero}><Text style={[styles.kicker,{color:p.teal}]}>Your vehicle history, connected</Text><Text style={[styles.heading,{color:p.text}]}>{mode==="login"?"Welcome back.":"Start with what you know today."}</Text><Text style={[styles.copy,{color:p.muted}]}>Maintenance, symptoms, estimates, invoices, and photos stay attached to the same vehicle story.</Text></View><Panel>
    <View style={styles.switcher}><Pressable onPress={()=>setMode("login")} style={[styles.switch,mode==="login"&&{backgroundColor:p.surface}]}><Text style={[styles.switchText,{color:p.text}]}>Sign in</Text></Pressable><Pressable onPress={()=>setMode("signup")} style={[styles.switch,mode==="signup"&&{backgroundColor:p.surface}]}><Text style={[styles.switchText,{color:p.text}]}>Create account</Text></Pressable></View>
    {message?<InlineMessage error={message.error}>{message.text}</InlineMessage>:null}
    {mode==="signup"?<Field label="Full name" autoCapitalize="words" autoComplete="name" value={fullName} onChangeText={setFullName}/>:null}
    <Field label="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail}/><Field label="Password" autoComplete={mode==="login"?"current-password":"new-password"} secureTextEntry value={password} onChangeText={setPassword}/><Button busy={busy} onPress={submit}>{mode==="login"?"Sign in":"Create account"}</Button>
    {mode==="login"?<Pressable accessibilityRole="button" onPress={resetPassword} style={styles.reset}><Text style={[styles.resetText,{color:p.teal}]}>Forgot your password?</Text></Pressable>:null}
  </Panel></Screen>;
}
const styles=StyleSheet.create({hero:{marginTop:54,marginBottom:24},kicker:{fontSize:13,fontWeight:"800",marginBottom:12},heading:{fontSize:40,fontWeight:"800",letterSpacing:-1.5,lineHeight:44,maxWidth:420},copy:{fontSize:15,lineHeight:23,maxWidth:540,marginTop:14},switcher:{flexDirection:"row",padding:4,borderRadius:12,marginBottom:18,gap:4},switch:{flex:1,minHeight:42,alignItems:"center",justifyContent:"center",borderRadius:9},switchText:{fontSize:14,fontWeight:"700"},reset:{minHeight:44,alignItems:"center",justifyContent:"center",marginTop:7},resetText:{fontSize:13,fontWeight:"700"}});
