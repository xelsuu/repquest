"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setLoggedIn(Boolean(data.user)));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
      <div className="rq-enter max-w-2xl space-y-6 text-center">
        <div className="mx-auto grid h-14 w-14 rotate-45 place-items-center rounded-2xl border-2 border-[var(--accent)]/70 bg-[var(--nav)] text-2xl shadow-[0_0_24px_color-mix(in_srgb,var(--accent)_18%,transparent)]"><span className="-rotate-45 text-[var(--accent)]" aria-hidden="true">⚡</span></div>
        <p className="rq-accent text-sm font-bold uppercase tracking-[0.2em]">Train with purpose</p>
        <h1><BrandLogo compact /></h1>
        <p className="text-xl font-medium text-[var(--text-muted)] sm:text-2xl">
          Log Workouts. Gain XP. Level Up.
        </p>
        <p className="text-[var(--text-subtle)]">Stay consistent. Let every rep count.</p>
        <div className="flex flex-col items-center justify-center gap-3 pt-2">{loggedIn ? <div className="flex flex-col justify-center gap-3 sm:flex-row"><Link href="/dashboard" className="rq-accent-button rq-interactive rounded-full px-6 py-3 font-black">◈ Go to Dashboard</Link><Link href="/log-workout" className="rq-interactive rounded-full border border-[var(--accent)]/50 px-6 py-3 font-black text-[var(--foreground)] hover:bg-[var(--accent)]/10">＋ Log a Workout</Link></div> : <><Link href="/login" className="rq-interactive w-full max-w-xs rounded-full border border-[var(--accent)]/50 px-6 py-3 text-center font-black text-[var(--foreground)] hover:bg-[var(--accent)]/10">Log in</Link><span className="rq-muted text-sm font-bold">or</span><Link href="/signup" className="rq-accent-button rq-interactive w-full max-w-xs rounded-full px-6 py-3 text-center text-sm font-black underline-offset-4 hover:underline">Create an account</Link></>}</div>
      </div>
    </main>
  );
}
