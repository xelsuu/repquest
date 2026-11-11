import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
      <div className="rq-enter max-w-2xl space-y-6 text-center">
        <p className="rq-accent text-sm font-bold uppercase tracking-[0.2em]">Train with purpose</p>
        <h1><BrandLogo /></h1>
        <p className="text-xl font-medium text-[var(--text-muted)] sm:text-2xl">
          Log Workouts. Gain XP. Level Up.
        </p>
        <p className="text-[var(--text-subtle)]">Stay consistent. Let every rep count.</p>
        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row"><Link href="/dashboard" className="rq-accent-button rq-interactive rounded-full px-6 py-3 font-black">◈ Go to Dashboard</Link><Link href="/log-workout" className="rq-interactive rounded-full border border-[var(--accent)]/50 px-6 py-3 font-black text-[var(--foreground)] hover:bg-[var(--accent)]/10">＋ Log a Workout</Link></div>
      </div>
    </main>
  );
}
