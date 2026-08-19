"use client";

import { useActionState } from "react";
import { resendSignupConfirmation, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export function ResendConfirmationForm() {
  const [state, action, pending] = useActionState(resendSignupConfirmation, initialState);

  return <section className="auth-resend" aria-labelledby="resend-confirmation-title">
    <div>
      <h3 id="resend-confirmation-title">Still waiting for confirmation?</h3>
      <p>Request a fresh link after checking your spam folder.</p>
    </div>
    <form action={action} className="auth-resend-form">
      <div className="field">
        <label htmlFor="confirmationEmail">Account email</label>
        <input id="confirmationEmail" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{state.error}</p>}
      {state.message && <p className="rounded-lg bg-[#e4f4ed] p-3 text-sm text-[#146449]" role="status">{state.message}</p>}
      <button className="btn btn-secondary w-full" disabled={pending}>{pending ? "Sending…" : "Resend confirmation email"}</button>
    </form>
  </section>;
}
