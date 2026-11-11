"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabase";
import { progressionFromXp, workoutXp } from "@/lib/progression";

function LogWorkoutContent() {
  const [title, setTitle] = useState("Push");
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseChoice, setExerciseChoice] = useState("__new__");
  const [previousExercises, setPreviousExercises] = useState<{ workout: string; exercise: string }[]>([]);
  const [recentPrWeight, setRecentPrWeight] = useState<number | null>(null);
  const [workoutType, setWorkoutType] = useState("Strength");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadExerciseOptions() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("workouts").select("title, exercise_name").eq("user_id", user.id).not("exercise_name", "is", null);
      const exercises = (data as { title: string | null; exercise_name: string | null }[] ?? [])
        .map((workout) => ({ workout: workout.title?.trim() || "Other", exercise: workout.exercise_name?.trim() || "" }))
        .filter((workout) => workout.exercise.length > 0)
        .filter((workout, index, all) => all.findIndex((item) => item.workout.toLowerCase() === workout.workout.toLowerCase() && item.exercise.toLowerCase() === workout.exercise.toLowerCase()) === index)
        .sort((a, b) => a.exercise.localeCompare(b.exercise));
      setPreviousExercises(exercises);
    }
    void loadExerciseOptions();
  }, []);

  useEffect(() => {
    async function loadRecentPr() {
      if (!exerciseName.trim()) {
        setRecentPrWeight(null);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("workouts").select("weight").eq("user_id", user.id).ilike("exercise_name", exerciseName.trim()).eq("is_pr", true).order("created_at", { ascending: false }).limit(1);
      setRecentPrWeight(data?.[0]?.weight ?? null);
    }
    void loadRecentPr();
  }, [exerciseName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("Please log in first.");
      setSaving(false);
      return;
    }

    const parsedReps = Number(reps);
    const parsedWeight = Number(weight);
    const normalizedExercise = exerciseName.trim();
    const { data: existingProgress } = await supabase.from("workouts").select("xp_awarded, is_pr").eq("user_id", user.id);
    const previousXp = (existingProgress ?? []).reduce((total, workout) => total + workoutXp(workout), 0);
    const previousRank = progressionFromXp(previousXp);
    const { data: previousWorkouts, error: historyError } = await supabase
      .from("workouts")
      .select("weight, reps")
      .eq("user_id", user.id)
      .ilike("exercise_name", normalizedExercise)
      .order("created_at", { ascending: false })
      .limit(1);

    if (historyError) {
      setErrorMessage("Could not check your previous records.");
      setSaving(false);
      return;
    }

    const previousWorkout = previousWorkouts?.[0];
    const isPr = !previousWorkout ||
      parsedWeight > Number(previousWorkout.weight) ||
      (parsedWeight === Number(previousWorkout.weight) && parsedReps > Number(previousWorkout.reps));
    const xpAwarded = isPr ? 8 : 5;

    const { error } = await supabase.from("workouts").insert([{
      title,
      workout_type: workoutType,
      duration: 0,
      difficulty: "Tracked",
      notes: null,
      exercise_name: normalizedExercise,
      weight: parsedWeight,
      reps: parsedReps,
      is_pr: isPr,
      xp_awarded: xpAwarded,
      user_id: user.id,
    }]);

    setSaving(false);
    if (error) {
      setErrorMessage("Could not save your workout. Make sure the tier migration is applied in Supabase.");
      return;
    }

    window.localStorage.setItem("repquest-pending-xp", JSON.stringify({ amount: xpAwarded, isPr }));
    const nextRank = progressionFromXp(previousXp + xpAwarded);
    if (nextRank.tier !== previousRank.tier || nextRank.subTier !== previousRank.subTier) {
      window.localStorage.setItem("repquest-pending-rank-up", JSON.stringify({ from: `${previousRank.tier} ${previousRank.subTier}`, to: `${nextRank.tier} ${nextRank.subTier}` }));
    }
    setMessage(`Workout saved — +${xpAwarded} XP${isPr ? " personal record!" : ""}`);
    setTitle("Push");
    setExerciseName("");
    setExerciseChoice("__new__");
    setWorkoutType("Strength");
    setReps("");
    setWeight("");
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="rq-enter mb-8"><p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Build your record</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Log Workout</h1><p className="rq-muted mt-2">Every session earns 5 XP. Beat your record for +3 bonus XP.</p></div>
        <form onSubmit={handleSubmit} className="rq-enter rq-delay-1 rq-surface space-y-6 rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)] sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="rq-muted block text-sm font-bold sm:col-span-2">Workout<select required value={title} onChange={(e) => { setTitle(e.target.value); setExerciseChoice("__new__"); setExerciseName(""); }} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"><option>Push</option><option>Pull</option><option>Legs</option><option>Core</option></select></label>
            <label className="rq-muted block text-sm font-bold sm:col-span-2">Exercise<select required value={exerciseChoice} onChange={(e) => { const value = e.target.value; setExerciseChoice(value); if (value !== "__new__") setExerciseName(value); else setExerciseName(""); }} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"><option value="__new__">New exercise for {title}</option>{previousExercises.filter((item) => item.workout.toLowerCase() === title.toLowerCase()).map((item) => <option key={`${item.workout}-${item.exercise}`} value={item.exercise}>{item.exercise}</option>)}</select>{exerciseChoice === "__new__" && <input required value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30" placeholder={`Example: ${title === "Push" ? "Pec deck" : title === "Pull" ? "Lat pulldown" : title === "Legs" ? "Leg press" : "Plank"}`} />}</label>
            <label className="rq-muted block text-sm font-bold">Workout type<select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"><option>Strength</option><option>Endurance</option><option>Flexibility</option></select></label>
            <label className="rq-muted block text-sm font-bold">Reps completed<input type="number" required min="1" value={reps} onChange={(e) => setReps(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30" placeholder="Example: 8" /></label>
            <label className="rq-muted block text-sm font-bold sm:col-span-2">Weight lifted <span className="font-normal">(kg)</span><input type="number" required min="0" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30" placeholder={`Your recent PR: ${recentPrWeight !== null ? `${recentPrWeight} kg` : "none yet"}`} /></label>
          </div>
          <div className="rounded-xl bg-[var(--surface-muted)] p-4 text-sm"><p className="font-bold">How personal records work</p><p className="rq-muted mt-1">We compare this exercise with your previous logs. A higher weight or higher rep count earns the PR bonus.</p></div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center"><button type="submit" disabled={saving} className="rq-accent-button rq-interactive w-full rounded-full px-6 py-3.5 text-base font-black shadow-[0_8px_20px_rgba(163,230,53,0.22)] disabled:opacity-50 sm:w-auto sm:min-w-48">{saving ? "Logging..." : "Log Workout"}</button><Link href="/dashboard" className="rq-interactive w-full px-3 py-2 text-center text-sm font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] sm:w-auto">← Back to dashboard</Link></div>
          {message && <p role="status" className="text-green-400">{message}</p>}
          {errorMessage && <p role="alert" className="text-red-400">{errorMessage}</p>}
        </form>
      </div>
    </main>
  );
}

export default function LogWorkout() {
  return <RequireAuth><LogWorkoutContent /></RequireAuth>;
}
