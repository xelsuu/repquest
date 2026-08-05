"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/log-workout", label: "Log Workout", icon: "+" },
  { href: "/ai-workout", label: "AI Workout", icon: "✦" },
  { href: "/feed", label: "Feed", icon: "◉" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLight, setIsLight] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="rq-nav sticky top-0 z-50 border-b border-white/10 text-white shadow-lg shadow-black/5">
      <nav className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link href="/" className="rq-interactive flex shrink-0 items-center gap-2 font-black tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] text-lg text-[var(--accent-ink)]">R</span>
          <span>RepQuest</span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rq-interactive rounded-lg border border-white/15 px-3 py-2 text-sm font-bold sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <div id="main-navigation" className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-2 border-b border-white/10 bg-[var(--nav)] p-4 shadow-xl sm:static sm:flex sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`rq-interactive flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold ${active ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "text-white/75 hover:bg-white/10 hover:text-white"}`} aria-current={active ? "page" : undefined}>
              <span aria-hidden="true" className="text-base">{item.icon}</span>{item.label}
            </Link>;
          })}
          <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-3 sm:mt-0 sm:border-0 sm:pt-0">
            <Link href="/login" onClick={() => setMenuOpen(false)} className="rq-interactive rounded-lg px-3 py-2 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">Log In</Link>
            <Link href="/signup" onClick={() => setMenuOpen(false)} className="rq-interactive rounded-lg px-3 py-2 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">Sign Up</Link>
            <button type="button" onClick={toggleTheme} className="rq-interactive ml-auto rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold text-white/80 hover:text-white" aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}>
              {isLight ? "☾ Dark" : "☀ Light"}
            </button>
            <button type="button" onClick={handleLogout} className="rq-interactive rounded-lg px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-400/10 hover:text-red-200">Log Out</button>
          </div>
        </div>
      </nav>
    </header>
  );
}
