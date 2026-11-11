"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/log-workout", label: "Log Workout", icon: "＋" },
  { href: "/history", label: "History", icon: "↺" },
  { href: "/ai-workout", label: "AI Workout", icon: "✦" },
];

const accentColors: Record<string, string> = {
  Iron: "#4b5563",
  Bronze: "#b87333",
  Silver: "#aeb7c2",
  Gold: "#d6a928",
  Platinum: "#218c8d",
  Diamond: "#8b5cf6",
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLight, setIsLight] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("repquest-theme");
    const light = saved === "light";
    document.documentElement.classList.toggle("dark", !light);
    const savedAccent = window.localStorage.getItem("repquest-accent-tier");
    if (savedAccent && accentColors[savedAccent]) {
      document.documentElement.style.setProperty("--accent", accentColors[savedAccent]);
      document.documentElement.style.setProperty("--accent-ink", "#102010");
    }
    void supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id } : null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ? { id: session.user.id } : null));
    return () => authListener.subscription.unsubscribe();
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
    <header style={{ position: "sticky", top: 0, zIndex: 100000 }} className="rq-nav border-b border-white/10 text-white shadow-lg shadow-black/5">
      <nav className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link href="/" className="rq-interactive flex shrink-0 items-center gap-2 font-black tracking-tight">
          <BrandLogo />
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

        <div id="main-navigation" className="hidden sm:flex sm:static sm:max-h-none sm:flex-row sm:items-center sm:overflow-visible sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`rq-interactive flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold ${active ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "text-white/75 hover:bg-white/10 hover:text-white"}`} aria-current={active ? "page" : undefined}>
              <span aria-hidden="true" className="rq-icon text-base" style={{ color: active ? "var(--accent-ink)" : "var(--accent)" }}>{item.icon}</span>{item.label}
            </Link>;
          })}
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 sm:mt-0 sm:flex-nowrap sm:border-0 sm:pt-0">
            {!user && <><Link href="/login" onClick={() => setMenuOpen(false)} className="rq-interactive rounded-lg px-3 py-2 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">Log In</Link><Link href="/signup" onClick={() => setMenuOpen(false)} className="rq-interactive rounded-lg px-3 py-2 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">Sign Up</Link></>}
            <button type="button" onClick={toggleTheme} className="rq-interactive ml-auto rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold text-white/80 hover:text-white" aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}>
              {isLight ? "☾ Dark" : "☀ Light"}
            </button>
            {user && <button type="button" onClick={handleLogout} className="rq-interactive rounded-lg px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-400/10 hover:text-red-200">Log Out</button>}
          </div>
        </div>
        {menuOpen && <div id="mobile-navigation" style={{ position: "fixed", top: "4rem", left: 0, right: 0, zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "stretch", maxHeight: "calc(100vh - 4rem)", overflowY: "auto", background: "var(--nav)", color: "white", padding: "1rem", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }} className="sm:hidden">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`rq-interactive flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold ${active ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "text-white/75 hover:bg-white/10 hover:text-white"}`} aria-current={active ? "page" : undefined}>
              <span aria-hidden="true" className="rq-icon text-base" style={{ color: active ? "var(--accent-ink)" : "var(--accent)" }}>{item.icon}</span>{item.label}
            </Link>;
          })}
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
            {!user && <><Link href="/login" onClick={() => setMenuOpen(false)} className="rq-interactive rounded-lg px-3 py-3 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">Log In</Link><Link href="/signup" onClick={() => setMenuOpen(false)} className="rq-interactive rounded-lg px-3 py-3 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">Sign Up</Link></>}
            <button type="button" onClick={toggleTheme} className="rq-interactive rounded-full border border-white/20 px-3 py-2 text-xs font-bold text-white/80 hover:text-white" aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}>{isLight ? "☾ Dark" : "☀ Light"}</button>
            {user && <button type="button" onClick={handleLogout} className="rq-interactive rounded-lg px-3 py-3 text-sm font-bold text-red-300 hover:bg-red-400/10 hover:text-red-200">Log Out</button>}
          </div>
        </div>}
      </nav>
    </header>
  );
}
