export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
      <div className="rq-enter max-w-2xl space-y-6 text-center">
        <p className="rq-accent text-sm font-bold uppercase tracking-[0.2em]">Train with purpose</p>
        <h1 className="text-6xl font-black tracking-[-0.05em] sm:text-8xl">🏋️ RepQuest</h1>
        <p className="text-xl font-medium text-[var(--text-muted)] sm:text-2xl">
          Log Workouts. Gain XP. Level Up.
        </p>
        <p className="text-[var(--text-subtle)]">Stay consistent. Let every rep count.</p>
      </div>
    </main>
  );
}
