"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { updateLoginStreak } from "@/lib/progression";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoggingIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoggingIn(false);
      return;
    }

    updateLoginStreak();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-8">
      <div className="rq-enter w-full max-w-md">
        <div className="mb-8 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent)] text-2xl font-black text-[var(--accent-ink)]">R</div><p className="rq-accent mt-5 text-xs font-bold uppercase tracking-[0.2em]">Welcome back</p><h1 className="mt-2 text-4xl font-black tracking-tight">Log in to RepQuest</h1><p className="rq-muted mt-2">Your next level is waiting.</p></div>

        <form onSubmit={handleLogin} className="rq-surface space-y-5 rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)] sm:p-7">
          <label className="rq-muted block text-sm font-bold">Email<input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            placeholder="you@example.com"
          /></label>
          <label className="rq-muted block text-sm font-bold">Password<input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            placeholder="Your password"
          /></label>
          <button
            type="submit"
            disabled={loggingIn}
            className="rq-accent-button rq-interactive w-full rounded-full px-6 py-3 font-bold disabled:opacity-60"
          >
            {loggingIn ? "Logging in..." : "Log In"}
          </button>
          {message && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{message}</p>}
          <p className="rq-muted text-center text-sm">New to RepQuest? <Link className="font-bold text-[var(--foreground)] underline decoration-[var(--accent)] decoration-2 underline-offset-4" href="/signup">Create an account</Link></p>
        </form>
      </div>
    </main>
  );
}
