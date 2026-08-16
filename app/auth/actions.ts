"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/domain/navigation";
import { authSchema, passwordResetRequestSchema, passwordUpdateSchema, signupSchema } from "@/lib/validation";

export interface AuthState { error?: string; message?: string }
export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = authSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient(); const { data,error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message === "Invalid login credentials" ? "Email or password is incorrect." : "We couldn’t log you in. Try again." }; const next=formData.get("next")?.toString();redirect(next?safeInternalPath(next):data.user.user_metadata.onboarding_completed===true?"/dashboard":"/onboarding");
}
export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({ fullName: formData.get("fullName"), email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient(); const siteUrl=process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"; const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { data: { full_name: parsed.data.fullName, onboarding_completed: false }, emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/onboarding")}` } });
  if (error) return { error: "We couldn’t create this account. If you already signed up, try logging in." }; if (!data.session) return { message: "Check your email to confirm your account. We’ll continue with your first vehicle afterward." }; redirect("/onboarding");
}
export async function requestPasswordReset(_:AuthState,formData:FormData):Promise<AuthState>{
  const parsed=passwordResetRequestSchema.safeParse({email:formData.get("email")});if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const supabase=await createClient();const siteUrl=process.env.NEXT_PUBLIC_SITE_URL??"http://localhost:3000";
  const {error}=await supabase.auth.resetPasswordForEmail(parsed.data.email,{redirectTo:`${siteUrl}/auth/callback?next=${encodeURIComponent("/reset-password")}`});
  if(error)return{error:"We couldn’t send the reset email. Try again."};
  return{message:"If an account exists for that email, a password reset link is on its way."};
}
export async function updatePassword(_:AuthState,formData:FormData):Promise<AuthState>{
  const parsed=passwordUpdateSchema.safeParse({password:formData.get("password"),confirmPassword:formData.get("confirmPassword")});if(!parsed.success)return{error:parsed.error.issues[0]?.message};
  const supabase=await createClient();const {error}=await supabase.auth.updateUser({password:parsed.data.password});
  if(error)return{error:"This reset link may have expired. Request a new one and try again."};
  redirect("/dashboard");
}
export async function skipOnboarding(){const supabase=await createClient();await supabase.auth.updateUser({data:{onboarding_completed:true}});redirect("/dashboard")}
export async function completeOnboarding(){const supabase=await createClient();await supabase.auth.updateUser({data:{onboarding_completed:true}});redirect("/dashboard")}
export async function logout() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/login"); }
