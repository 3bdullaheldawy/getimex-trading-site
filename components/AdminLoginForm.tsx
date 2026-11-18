"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function AdminLoginForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [reveal, setReveal] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    const target = callbackUrl?.startsWith("/admin") ? callbackUrl : "/admin";
    const result = await signIn("credentials", { email: String(form.get("email") ?? ""), password: String(form.get("password") ?? ""), redirect: false, callbackUrl: target });
    if (!result || result.error) { setError("That email and password combination didn’t work. Check both and try again."); setPending(false); return; }
    window.location.href = target;
  }
  return <form className="login-form" onSubmit={submit}>
    {error && <div className="login-error" role="alert">{error}</div>}
    <label className="f"><span>Work email</span><input name="email" type="email" autoComplete="username" required autoFocus placeholder="name@getimex.com" /></label>
    <label className="f"><span>Password</span><span className="pw"><input name="password" type={reveal ? "text" : "password"} autoComplete="current-password" required /><button type="button" onClick={() => setReveal((v) => !v)} aria-label={reveal ? "Hide password" : "Show password"}>{reveal ? "Hide" : "Show"}</button></span></label>
    <button className="btn btn-primary" disabled={pending}>{pending ? <><span className="spinner" />Signing in…</> : "Sign in"}</button>
  </form>;
}
