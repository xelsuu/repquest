"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("repquest-theme");
    const light = saved === "light";
    document.documentElement.classList.toggle("dark", !light);
  }, []);

  function toggleTheme() {
    const nextIsLight = !isLight;
    document.documentElement.classList.toggle("dark", !nextIsLight);
    window.localStorage.setItem("repquest-theme", nextIsLight ? "light" : "dark");
    setIsLight(nextIsLight);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="rq-nav p-4 text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 sm:justify-start">
        <Link href="/" className="rq-interactive font-bold text-xl">
          🏋️ RepQuest
        </Link>

        <Link className="rq-interactive" href="/dashboard">Dashboard</Link>
        <Link className="rq-interactive" href="/log-workout">Log Workout</Link>
        <Link className="rq-interactive" href="/ai-workout">AI Workout</Link>
        <Link className="rq-interactive" href="/feed">Feed</Link>
        <Link className="rq-interactive" href="/login">Log In</Link>
        <Link className="rq-interactive" href="/signup">Sign Up</Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="rq-interactive rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 hover:text-white"
          aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
        >
          {isLight ? "☾ Dark" : "☀ Light"}
        </button>

        <button
          onClick={handleLogout}
          className="rq-interactive text-red-400 hover:text-red-300 sm:ml-auto"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
