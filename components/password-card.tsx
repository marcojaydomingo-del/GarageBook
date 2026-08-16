"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, updatePassword, type AuthState } from "@/app/auth/actions";
import { Brand } from "./brand";

const initialState:AuthState={};

export function PasswordCard({mode}:{mode:"request"|"update"}){
  const isUpdate=mode==="update";
  const [state,action,pending]=useActionState(isUpdate?updatePassword:requestPasswordReset,initialState);
  return <main className="auth-shell auth-shell-password"><section className="auth-story" aria-label="GarageBook account recovery"><div><Brand/><p className="auth-kicker">Secure account access</p><h1>Your vehicle record stays yours.</h1><p>Recover access without losing the history, documents, and photos already connected to your garage.</p></div></section><div className="auth-panel"><div className="auth-mobile-brand"><Brand/></div><section className="auth-card"><p className="page-eyebrow">Account recovery</p><h2>{isUpdate?"Choose a new password":"Reset your password"}</h2><p className="auth-card-intro">{isUpdate?"Use at least eight characters, then return to your garage.":"Enter your account email and we’ll send a secure reset link."}</p><form action={action} className="mt-7 space-y-4">{isUpdate?<><div className="field"><label htmlFor="password">New password</label><input autoComplete="new-password" id="password" minLength={8} name="password" required type="password"/></div><div className="field"><label htmlFor="confirmPassword">Confirm new password</label><input autoComplete="new-password" id="confirmPassword" minLength={8} name="confirmPassword" required type="password"/></div></>:<div className="field"><label htmlFor="email">Email address</label><input autoComplete="email" id="email" name="email" required type="email"/></div>}{state.error&&<p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{state.error}</p>}{state.message&&<p className="rounded-lg bg-[#e4f4ed] p-3 text-sm text-[#146449]" role="status">{state.message}</p>}<button className="btn btn-primary btn-lg w-full" disabled={pending}>{pending?"Please wait…":isUpdate?"Save new password":"Send reset link"}</button></form>{!isUpdate&&<p className="mt-6 text-center text-sm"><Link className="font-semibold text-teal" href="/login">Back to login</Link></p>}</section></div></main>;
}
