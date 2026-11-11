"use client";

import { useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabase";
import { progressionFromXp, workoutXp } from "@/lib/progression";

type GeneratedExercise = { name: string; reps: number; sets: number };
type GeneratedWorkout = { exercises: GeneratedExercise[]; warmup: string; cooldown: string };

function parseWorkout(value: string): GeneratedWorkout | null {
  try {
    const cleaned = value.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as GeneratedWorkout;
    if (!Array.isArray(parsed.exercises) || parsed.exercises.length === 0) return null;
    return parsed;
  } catch { return null; }
}

function AIWorkoutContent() {
  const [goal, setGoal] = useState("");
  const [equipment, setEquipment] = useState("");
  const [experience, setExperience] = useState("Beginner");
  const [time, setTime] = useState("");
  const [workout, setWorkout] = useState("Push");
  const [workoutType, setWorkoutType] = useState("Strength");
  const [result, setResult] = useState<GeneratedWorkout | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setGenerating(true); setErrorMessage(""); setMessage("");
    try {
      const response = await fetch("/api/generate-workout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal, equipment, experience, time, workoutType, workout }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate workout.");
      const parsed = parseWorkout(data.workout);
      if (!parsed) throw new Error("The AI returned an invalid workout format. Please try again.");
      setResult(parsed);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not generate workout."); }
    finally { setGenerating(false); }
  }

  async function handleSaveWorkout() {
    if (!result) return;
    setSaving(true); setMessage(""); setErrorMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErrorMessage("Please log in first."); setSaving(false); return; }
    const { data: existing, error: existingError } = await supabase.from("workouts").select("xp_awarded, is_pr, exercise_name, weight, reps, created_at").eq("user_id", user.id);
    if (existingError) { setErrorMessage("Could not load your progression history."); setSaving(false); return; }
    const previousXp = (existing ?? []).reduce((total, item) => total + workoutXp(item), 0);
    const previousRank = progressionFromXp(previousXp);
    const rows = [];
    let gainedXp = 0;
    let prCount = 0;
    for (const exercise of result.exercises) {
      const previous = (existing ?? []).filter((item) => item.exercise_name?.toLowerCase() === exercise.name.toLowerCase()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      const reps = Number(exercise.reps) || 1;
      const weight = 0;
      const isPr = !previous || weight > Number(previous.weight) || (weight === Number(previous.weight) && reps > Number(previous.reps));
      const xp = isPr ? 8 : 5;
      gainedXp += xp; if (isPr) prCount += 1;
      rows.push({ title: workout, workout_type: workoutType, duration: 0, difficulty: "Tracked", notes: null, exercise_name: exercise.name, weight, reps, is_pr: isPr, xp_awarded: xp, user_id: user.id });
    }
    const { error } = await supabase.from("workouts").insert(rows);
    setSaving(false);
    if (error) { setErrorMessage("Could not save the generated workout. Make sure the tier migration is applied."); return; }
    const nextRank = progressionFromXp(previousXp + gainedXp);
    window.localStorage.setItem("repquest-pending-xp", JSON.stringify({ amount: gainedXp, isPr: prCount > 0 }));
    if (nextRank.tier !== previousRank.tier || nextRank.subTier !== previousRank.subTier) window.localStorage.setItem("repquest-pending-rank-up", JSON.stringify({ from: `${previousRank.tier} ${previousRank.subTier}`, to: `${nextRank.tier} ${nextRank.subTier}` }));
    setMessage(`Workout logged — +${gainedXp} XP across ${rows.length} exercises.`);
    setResult(null);
  }

  return <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-8"><div className="mx-auto max-w-3xl"><div className="rq-enter mb-8"><p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Your on-demand coach</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Generate a Workout</h1><p className="rq-muted mt-2">Generate a structured routine that works with your RepQuest progression.</p></div><form onSubmit={handleSubmit} className="rq-enter rq-delay-1 rq-surface space-y-5 rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)] sm:p-7"><label className="rq-muted block text-sm font-bold">Fitness goal<input required value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)]" placeholder="Build muscle" /></label><label className="rq-muted block text-sm font-bold">Equipment<input value={equipment} onChange={(e) => setEquipment(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)]" placeholder="Dumbbells, bench, bodyweight" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="rq-muted block text-sm font-bold">Workout<select value={workout} onChange={(e) => setWorkout(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)]"><option>Push</option><option>Pull</option><option>Legs</option><option>Core</option></select></label><label className="rq-muted block text-sm font-bold">Workout type<select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)]"><option>Strength</option><option>Endurance</option><option>Flexibility</option></select></label><label className="rq-muted block text-sm font-bold">Experience<select value={experience} onChange={(e) => setExperience(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)]"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label className="rq-muted block text-sm font-bold">Time available (minutes)<input type="number" required min="5" max="180" value={time} onChange={(e) => setTime(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)]" placeholder="30" /></label></div><div className="flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={generating} className="rq-accent-button rq-interactive rounded-full px-6 py-3.5 font-black disabled:opacity-50">{generating ? "Generating..." : "Generate Workout"}</button><Link href="/dashboard" className="rq-muted rq-interactive rounded-full px-5 py-3 text-center text-sm font-bold">← Back to dashboard</Link></div>{errorMessage && <p role="alert" className="text-red-400">{errorMessage}</p>}</form>{result && <section className="mt-8"><h2 className="text-2xl font-black">Your {workout} workout</h2><div className="rq-surface mt-4 rounded-2xl p-5"><p className="rq-muted text-sm">Warm-up: {result.warmup}</p><div className="mt-4 space-y-3">{result.exercises.map((exercise) => <div key={exercise.name} className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] p-4"><span className="font-bold">{exercise.name}</span><span className="rq-muted text-sm">{exercise.sets} sets · {exercise.reps} reps</span></div>)}</div><p className="rq-muted mt-4 text-sm">Cool-down: {result.cooldown}</p></div><button type="button" onClick={handleSaveWorkout} disabled={saving} className="rq-accent-button rq-interactive mt-4 rounded-full px-6 py-3 font-bold disabled:opacity-50">{saving ? "Logging..." : "Log Workout"}</button>{message && <p role="status" className="mt-4 text-green-400">{message}</p>}</section>}</div></main>;
}

export default function AIWorkout() { return <RequireAuth><AIWorkoutContent /></RequireAuth>; }
