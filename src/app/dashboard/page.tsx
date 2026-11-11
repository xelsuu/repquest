"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RequireAuth from "@/components/RequireAuth";
import { getLoginStreak, progressionFromXp, workoutXp } from "@/lib/progression";

type Workout = {
  id: number;
  title: string;
  workout_type: string;
  duration: number;
  difficulty: string;
  created_at: string;
  user_id: string;
  exercise_name: string | null;
  weight: number | null;
  reps: number | null;
  is_pr: boolean | null;
  xp_awarded: number | null;
};

const tierColors = {
  Iron: "#4b5563",
  Bronze: "#b87333",
  Silver: "#aeb7c2",
  Gold: "#d6a928",
  Platinum: "#218c8d",
  Diamond: "#8b5cf6",
} as const;

const divisionNumerals = ["I", "II", "III", "IV", "V"] as const;
const prCategories = ["Push", "Pull", "Legs", "Core", "Cardio"] as const;
type PrCategory = (typeof prCategories)[number];

function DashboardContent() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginStreak, setLoginStreak] = useState(0);
  const [xpToast, setXpToast] = useState<{ amount: number; isPr: boolean } | null>(null);
  const [xpProgressStart, setXpProgressStart] = useState<number | null>(null);
  const [rankUp, setRankUp] = useState<{ from: string; to: string } | null>(null);
  const [previewTier, setPreviewTier] = useState<keyof typeof tierColors | null>(null);
  const [previewSubTier, setPreviewSubTier] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [accentTier, setAccentTier] = useState<keyof typeof tierColors | null>(() => {
    if (typeof window === "undefined") return null;
    const savedAccent = window.localStorage.getItem("repquest-accent-tier") as keyof typeof tierColors | null;
    return savedAccent && savedAccent in tierColors ? savedAccent : null;
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [prCategory, setPrCategory] = useState<PrCategory>(() => {
    if (typeof window === "undefined") return "Push";
    const saved = window.localStorage.getItem("repquest-pr-category") as PrCategory | null;
    return saved && prCategories.includes(saved) ? saved : "Push";
  });

  useEffect(() => {
    const savedAccent = window.localStorage.getItem("repquest-accent-tier") as keyof typeof tierColors | null;
    if (savedAccent && savedAccent in tierColors) {
      document.documentElement.style.setProperty("--accent", tierColors[savedAccent]);
      document.documentElement.style.setProperty("--accent-ink", "#102010");
    }
  }, []);

  function changeAccentTier(tier: keyof typeof tierColors) {
    setAccentTier(tier);
    window.localStorage.setItem("repquest-accent-tier", tier);
    document.documentElement.style.setProperty("--accent", tierColors[tier]);
    document.documentElement.style.setProperty("--accent-ink", "#102010");
  }

  function resetAccent() {
    setAccentTier(null);
    window.localStorage.removeItem("repquest-accent-tier");
    document.documentElement.style.setProperty("--accent", "#a3e635");
    document.documentElement.style.setProperty("--accent-ink", "#1c2b0d");
  }

  async function deleteWorkout(id: number) {
    setDeleteError("");
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = user
      ? await supabase.from("workouts").delete().eq("id", id).eq("user_id", user.id).select("id")
      : { data: null, error: new Error("Not authenticated") };
    if (error || !data?.length) {
      setDeleteError("Could not delete this workout. Check your Supabase delete policy.");
      return;
    }
    setWorkouts((current) => current.filter((workout) => workout.id !== id));
    setPendingDelete(null);
  }

  useEffect(() => {
    async function loadWorkouts() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("workouts")
        .select(
          "id, title, workout_type, duration, difficulty, created_at, user_id, exercise_name, weight, reps, is_pr, xp_awarded"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setWorkouts(data ?? []);
        const pendingXpValue = window.localStorage.getItem("repquest-pending-xp");
        if (pendingXpValue) {
          try {
            const pending = JSON.parse(pendingXpValue) as { amount?: number };
            const earnedBeforeThisWorkout = (data ?? []).reduce((total, workout) => total + workoutXp(workout), 0) - (pending.amount ?? 0);
            setXpProgressStart(progressionFromXp(earnedBeforeThisWorkout).progressPercent);
          } catch {
            setXpProgressStart(null);
          }
        }
      }

      setLoading(false);
      setLoginStreak(getLoginStreak());

      const pendingXp = window.localStorage.getItem("repquest-pending-xp");
      if (pendingXp) {
        try {
          setXpToast(JSON.parse(pendingXp) as { amount: number; isPr: boolean });
        } catch {
          window.localStorage.removeItem("repquest-pending-xp");
        }
        window.localStorage.removeItem("repquest-pending-xp");
      }
      const pendingRankUp = window.localStorage.getItem("repquest-pending-rank-up");
      if (pendingRankUp) {
        try {
          setRankUp(JSON.parse(pendingRankUp) as { from: string; to: string });
        } catch {
          window.localStorage.removeItem("repquest-pending-rank-up");
        }
        window.localStorage.removeItem("repquest-pending-rank-up");
      }
    }

    loadWorkouts();
  }, []);

  useEffect(() => {
    if (xpProgressStart === null) return;
    const timer = window.setTimeout(() => setXpProgressStart(null), 950);
    return () => window.clearTimeout(timer);
  }, [xpProgressStart]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
        <h1 className="text-2xl font-bold">Loading Dashboard...</h1>
      </main>
    );
  }

  const totalWorkouts = workouts.length;

  const totalXP = workouts.reduce((xp, workout) => xp + workoutXp(workout), 0);
  const progression = progressionFromXp(totalXP);
  const tierColor = tierColors[progression.tier];
  const decorationCount = progression.tierIndex * 3 + progression.subTier;
  const bestWorkoutForCategory = workouts.filter((workout) => {
    const category = workout.title?.toLowerCase();
    const isCardio = prCategory === "Cardio" && (workout.workout_type?.toLowerCase() === "endurance" || category === "cardio");
    return workout.exercise_name && (workout.weight ?? 0) > 0 && (workout.reps ?? 0) > 0 && (category === prCategory.toLowerCase() || isCardio);
  }).reduce<Workout | null>((best, workout) => {
    const score = (workout.weight ?? 0) * (workout.reps ?? 0);
    const bestScore = best ? (best.weight ?? 0) * (best.reps ?? 0) : 0;
    return score > bestScore ? workout : best;
  }, null);

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-8">
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-24 sm:right-5">
        {paletteOpen && <div className="rq-surface w-44 rounded-xl border border-[var(--accent)]/25 p-2 shadow-xl">
          <p className="rq-muted px-2 pb-1 text-[10px] font-black uppercase tracking-wider">Accent color</p>
          <button type="button" onClick={() => { resetAccent(); setPaletteOpen(false); }} className="rq-interactive flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#a3e635" }} />Default lime</button>
          {Object.keys(tierColors).slice(0, progression.tierIndex + 1).map((tier) => { const tierKey = tier as keyof typeof tierColors; return <button type="button" key={tier} onClick={() => { changeAccentTier(tierKey); setPaletteOpen(false); }} aria-pressed={accentTier === tierKey} className="rq-interactive flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: tierColors[tierKey] }} />{tier}</button>; })}
        </div>}
        <button type="button" onClick={() => setPaletteOpen((open) => !open)} className="rq-interactive grid h-9 w-9 place-items-center rounded-full border border-[var(--accent)]/45 bg-[var(--nav)]/95 text-sm text-[var(--accent)] opacity-85 shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:opacity-100 sm:h-12 sm:w-12" aria-label="Choose accent color" aria-expanded={paletteOpen} title="Choose accent color">◐</button>
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="rq-enter mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Your training HQ</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Dashboard</h1><p className="rq-muted mt-2">Keep the streak alive and make today count.</p></div>
          <Link href="/log-workout" className="rq-accent-button rq-interactive inline-flex w-fit items-center rounded-full px-5 py-3 text-sm font-bold">＋ Log a workout</Link>
        </div>
        {xpToast && <div role="status" className="rq-xp-pop fixed right-4 top-20 z-40 rounded-2xl border border-[var(--accent)]/40 bg-[var(--surface)] px-5 py-3 text-center shadow-[0_14px_40px_rgba(0,0,0,0.25)]"><p className="text-2xl font-black text-[var(--accent)]">+{xpToast.amount} XP</p><p className="text-xs font-bold uppercase tracking-[0.16em]">{xpToast.isPr ? "Personal record" : "Workout logged"}</p></div>}
        {rankUp && <div role="dialog" aria-modal="true" aria-label="Rank up celebration" className="rq-rank-up fixed inset-0 z-[60] grid place-items-center bg-black/85 p-6 text-center text-white"><div className="rq-rank-up-card"><p className="text-sm font-black uppercase tracking-[0.3em] text-[var(--accent)]">Rank up</p><div className="mt-5 text-6xl">✦</div><p className="mt-4 text-lg font-bold text-white/60">{rankUp.from}</p><p className="text-4xl font-black text-[var(--accent)]">{rankUp.to}</p><p className="mt-4 text-white/70">Your training is moving forward.</p><button type="button" onClick={() => setRankUp(null)} className="rq-accent-button rq-interactive mt-7 rounded-full px-7 py-3 font-black">Continue</button></div></div>}
        <section className="rq-enter rq-delay-1 rq-surface mb-6 grid gap-6 overflow-hidden rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)] sm:grid-cols-[1fr_auto] sm:items-center sm:p-7"><div><div className="flex items-center gap-4"><div className="flex w-20 shrink-0 flex-col items-center"><div className="relative grid h-20 w-20 rotate-45 place-items-center rounded-[1.15rem] border-4 bg-[var(--surface-muted)] text-2xl font-black" style={{ borderColor: tierColor, color: tierColor, boxShadow: `0 0 ${10 + decorationCount * 3}px ${tierColor}55` }}><span className="-rotate-45">{divisionNumerals[progression.subTier - 1]}</span>{Array.from({ length: Math.max(0, decorationCount - 1) }).map((_, index) => <span key={index} aria-hidden="true" className="absolute -inset-2 rounded-[1.5rem] border opacity-20" style={{ borderColor: tierColor, transform: `rotate(${index * 12}deg) scale(${1 + index * 0.035})` }} />)}</div><div className="mt-3 flex max-w-20 flex-wrap justify-center gap-0.5" aria-label={`${decorationCount} tier decorations`}>{Array.from({ length: decorationCount }).map((_, index) => <span key={index} aria-hidden="true" className="text-[9px]" style={{ color: tierColor }}>{index >= 6 ? "✦" : "•"}</span>)}</div></div><div><p className="rq-muted text-sm font-bold uppercase tracking-[0.18em]">Current rank</p><p className="mt-1 text-3xl font-black">{progression.tier} {progression.subTier}</p><p className="rq-muted mt-1 text-sm">{progression.isMaxTier ? "Diamond mastery reached" : `${progression.xpToNext} XP to the next tier`}</p></div></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full transition-[width] duration-700" style={{ width: `${xpProgressStart ?? progression.progressPercent}%`, backgroundColor: tierColor }} /></div><p className="rq-muted mt-2 text-xs">{progression.subTierXp} of 100 XP in {progression.tier} {progression.subTier}</p><div className="mt-4 flex flex-wrap gap-2">{Object.keys(tierColors).map((tier) => <span key={tier} className="flex flex-col items-center gap-1"><button type="button" key={tier} onClick={() => { setPreviewTier(tier as keyof typeof tierColors); setPreviewSubTier(1); }} className="rq-interactive rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider" style={(previewTier ?? progression.tier) === tier ? { backgroundColor: tierColors[tier as keyof typeof tierColors], color: "#fff" } : { backgroundColor: "var(--surface-muted)", color: "var(--text-subtle)" }}>{tier}</button>{tier === progression.tier && <span aria-label="Your current rank" className="rq-accent text-[9px] leading-none">◆</span>}</span>)}</div>{previewTier && <div className="mt-4 rounded-xl bg-[var(--surface-muted)] p-4"><div className="flex items-center gap-4"><div><p className="text-sm font-black">{previewTier} {previewSubTier} design preview</p><p className="rq-muted text-xs">{previewSubTier * 100} XP in this tier · preview every tier below</p></div><button type="button" onClick={() => setPreviewTier(null)} className="rq-muted ml-auto text-lg" aria-label="Close rank preview">×</button></div><div className="mt-3 flex gap-2">{Array.from({ length: previewTier === "Diamond" ? 5 : previewTier === "Platinum" ? 4 : 3 }, (_, index) => index + 1).map((division) => <button type="button" key={division} onClick={() => setPreviewSubTier(division)} className={`rounded-full px-3 py-1.5 text-xs font-black ${previewSubTier === division ? "text-white" : "rq-muted bg-[var(--background)]"}`} style={previewSubTier === division ? { backgroundColor: tierColors[previewTier] } : undefined}>{previewTier} {division}</button>)}</div><div className="mt-3 flex items-center gap-3"><div key={`${previewTier}-${previewSubTier}`} className="grid h-12 w-12 rotate-45 place-items-center rounded-lg border-2" style={{ borderColor: tierColors[previewTier], color: tierColors[previewTier], boxShadow: `0 0 ${8 + (Object.keys(tierColors).indexOf(previewTier) * 3 + previewSubTier) * 2}px ${tierColors[previewTier]}55` }}><span className="-rotate-45 text-lg font-black">{divisionNumerals[previewSubTier - 1]}</span></div><span className="rq-muted text-xs">Decoration level {Object.keys(tierColors).indexOf(previewTier) * 3 + previewSubTier} · 100 XP per division</span></div></div>}</div><div className="rounded-xl bg-[var(--surface-muted)] px-5 py-4 text-center"><p className="rq-muted text-xs font-bold uppercase tracking-wider">Login streak</p><p className="mt-1 text-3xl font-black">🔥 {loginStreak}<span className="rq-muted ml-1 text-sm font-bold">days</span></p><p className="rq-subtle mt-1 text-xs">Login consistency only</p></div></section>

        {previewTier && <div className="rq-surface mb-6 rounded-2xl border-2 p-5" style={{ borderColor: tierColors[previewTier] }}><div className="flex flex-wrap items-center gap-5"><div key={`${previewTier}-${previewSubTier}`} className="relative grid h-24 w-24 rotate-45 place-items-center rounded-2xl border-4" style={{ borderColor: tierColors[previewTier], color: tierColors[previewTier], boxShadow: `0 0 ${18 + (Object.keys(tierColors).indexOf(previewTier) * 3 + previewSubTier) * 5}px ${tierColors[previewTier]}aa` }}><span className="-rotate-45 text-3xl font-black">{divisionNumerals[previewSubTier - 1]}</span>{Array.from({ length: Object.keys(tierColors).indexOf(previewTier) * 3 + previewSubTier - 1 }).map((_, index) => <span key={index} aria-hidden="true" className="absolute -inset-2 rounded-2xl border-2 opacity-60" style={{ borderColor: tierColors[previewTier], transform: `rotate(${index * 15}deg) scale(${1 + index * 0.08})` }} />)}</div><div className="min-w-52 flex-1"><p className="text-xl font-black">{previewTier} {previewSubTier} design</p><p className="rq-muted mt-1 text-sm">Every tier adds another ring and ornament. Diamond Tier 5 has the full decoration set.</p><div className="mt-3 flex gap-2">{Array.from({ length: previewTier === "Diamond" ? 5 : previewTier === "Platinum" ? 4 : 3 }, (_, index) => index + 1).map((division) => <button type="button" key={division} onClick={() => setPreviewSubTier(division)} className="rounded-full px-3 py-1.5 text-xs font-black" style={previewSubTier === division ? { backgroundColor: tierColors[previewTier], color: "#fff" } : { backgroundColor: "var(--surface-muted)", color: "var(--text-subtle)" }}>{previewTier} {division}</button>)}</div></div></div></div>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rq-enter rq-delay-1 rq-interactive rq-surface rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)]">
            <h2 className="rq-muted"><span className="rq-icon mr-2" aria-hidden="true">◒</span>Total Workouts</h2>
            <p className="text-4xl font-bold">{totalWorkouts}</p>
          </div>

          <div className="rq-enter rq-delay-2 rq-interactive rq-surface rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)]">
            <h2 className="rq-muted"><span className="rq-icon mr-2" aria-hidden="true">✦</span>Total XP</h2>
            <p className="text-4xl font-bold">{totalXP} XP</p>
          </div>

          <div className="rq-enter rq-delay-3 rq-interactive rq-surface rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)]">
            <h2 className="rq-muted"><span className="rq-icon mr-2" aria-hidden="true">✪</span>PR Record · {prCategory}</h2>
            <p className="text-2xl font-bold sm:text-3xl">{bestWorkoutForCategory?.exercise_name ?? `No ${prCategory.toLowerCase()} record`}</p>
            {bestWorkoutForCategory && <p className="rq-muted mt-1 text-sm">{bestWorkoutForCategory.weight} kg × {bestWorkoutForCategory.reps} reps</p>}
            <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Choose PR record category">
              {prCategories.map((category) => <button type="button" key={category} onClick={() => { setPrCategory(category); window.localStorage.setItem("repquest-pr-category", category); }} className="rq-interactive rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider" style={prCategory === category ? { backgroundColor: "var(--accent)", color: "var(--accent-ink)" } : { backgroundColor: "var(--surface-muted)", color: "var(--text-subtle)" }}>{category}</button>)}
            </div>
          </div>

        </div>

        <div className="rq-fade-up rq-delay-5 mt-10">
          <div className="mb-4 flex items-end justify-between"><div><p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Your history</p><h2 className="mt-1 text-2xl font-black">Recent Workouts</h2></div><span className="rq-muted text-sm">Last 5 sessions</span></div>

          {deleteError && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{deleteError}</p>}
          {workouts.length === 0 ? (
            <div className="rq-surface rounded-2xl p-8 text-center shadow-[0_12px_32px_rgba(20,40,20,0.08)]"><p className="text-3xl">⚡</p><p className="mt-3 text-lg font-bold">Your next milestone starts here.</p><p className="rq-muted mt-2">Log your first workout to start earning XP.</p><Link href="/log-workout" className="rq-accent-button rq-interactive mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-bold">Log first workout</Link></div>
          ) : (
            <div className="space-y-4">
              {workouts.slice(0, 5).map((workout) => (
                <div
                  key={workout.id}
                  className="rq-interactive rq-surface rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-bold">{workout.title}</h3><p className="rq-muted mt-1">{workout.exercise_name ? `${workout.exercise_name}${workout.weight ? ` · ${workout.weight} kg` : ""}${workout.reps ? ` · ${workout.reps} reps` : ""}` : "Workout session"}</p></div><span className="shrink-0 rounded-full bg-[var(--accent)]/15 px-3 py-1 text-sm font-black text-[var(--accent)]">+{workoutXp(workout)} XP{workout.is_pr ? " · PR" : ""}</span></div>

                  <p className="rq-muted">
                    {workout.workout_type} · {workout.reps ?? 0} reps · {workout.weight ?? 0} kg
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="rq-subtle text-sm">{new Date(workout.created_at).toLocaleDateString()}</p>{pendingDelete === workout.id ? <div className="flex items-center gap-2"><span className="rq-muted text-xs font-bold">Delete workout?</span><button type="button" onClick={() => void deleteWorkout(workout.id)} className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600">Delete</button><button type="button" onClick={() => setPendingDelete(null)} className="rq-muted rounded-full px-3 py-1.5 text-xs font-bold hover:bg-[var(--surface-muted)]">Cancel</button></div> : <button type="button" onClick={() => setPendingDelete(workout.id)} className="rq-muted rounded-full px-3 py-1.5 text-xs font-bold hover:bg-red-500/10 hover:text-red-400">Delete</button>}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
