"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setCreating(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setCreating(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Account created. Redirecting you to log in...");
    window.setTimeout(() => router.push("/login"), 900);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-8">
      <div className="rq-enter w-full max-w-md">
        <div className="mb-8 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent)] text-2xl font-black text-[var(--accent-ink)]">R</div><p className="rq-accent mt-5 text-xs font-bold uppercase tracking-[0.2em]">Start your run</p><h1 className="mt-2 text-4xl font-black tracking-tight">Create your account</h1><p className="rq-muted mt-2">Build consistency, one session at a time.</p></div>
        <form onSubmit={handleSignup} className="rq-surface space-y-5 rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)] sm:p-7">
          <label className="rq-muted block text-sm font-bold">Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30" placeholder="you@example.com" /></label>
          <label className="rq-muted block text-sm font-bold">Password<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30" placeholder="At least 6 characters" /></label>
          <button type="submit" disabled={creating} className="rq-accent-button rq-interactive w-full rounded-full px-6 py-3 font-bold disabled:opacity-60">{creating ? "Creating account..." : "Create account"}</button>
          {message && <p role="status" className="rounded-xl bg-[var(--accent)]/15 p-3 text-sm text-[var(--foreground)]">{message}</p>}
          <p className="rq-muted text-center text-sm">Already training with us? <Link className="font-bold text-[var(--foreground)] underline decoration-[var(--accent)] decoration-2 underline-offset-4" href="/login">Log in</Link></p>
        </form>
      </div>
    </main>
  );
}
