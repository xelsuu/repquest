"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RequireAuth from "@/components/RequireAuth";
import { progressionFromXp, workoutXp } from "@/lib/progression";

type Workout = {
  id: number;
  title: string;
  workout_type: string;
  created_at: string;
  exercise_name: string | null;
  weight: number | null;
  reps: number | null;
  is_pr: boolean | null;
  xp_awarded: number | null;
};

function HistoryContent() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("workouts").select("id, title, workout_type, created_at, exercise_name, weight, reps, is_pr, xp_awarded").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) setErrorMessage("Could not load your workout history.");
      else setWorkouts(data ?? []);
      setLoading(false);
    }
    void loadHistory();
  }, []);

  async function deleteWorkout(id: number) {
    setErrorMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = user
      ? await supabase.from("workouts").delete().eq("id", id).eq("user_id", user.id).select("id")
      : { data: null, error: new Error("Not authenticated") };
    if (error || !data?.length) {
      setErrorMessage("Could not delete this workout. Check your Supabase delete policy.");
      return;
    }
    setWorkouts((current) => current.filter((workout) => workout.id !== id));
    setPendingDelete(null);
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 text-[var(--foreground)]"><h1 className="text-2xl font-bold">Loading history...</h1></main>;

  const totalXp = workouts.reduce((total, workout) => total + workoutXp(workout), 0);
  const progression = progressionFromXp(totalXp);

  return <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-8"><div className="mx-auto max-w-4xl"><div className="rq-enter mb-8"><p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Every session, saved</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Workout History</h1><p className="rq-muted mt-2">Your complete training log, from your first rep to your latest PR.</p></div><div className="rq-surface mb-6 grid gap-4 rounded-2xl p-5 sm:grid-cols-3"><div><p className="rq-muted text-xs font-bold uppercase tracking-wider">Overall record</p><p className="mt-1 text-2xl font-black">{workouts.length} workouts</p></div><div><p className="rq-muted text-xs font-bold uppercase tracking-wider">Total XP</p><p className="mt-1 text-2xl font-black">{totalXp} XP</p></div><div><p className="rq-muted text-xs font-bold uppercase tracking-wider">Current rank</p><p className="mt-1 text-2xl font-black">{progression.tier} {progression.subTier}</p></div></div>{errorMessage && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{errorMessage}</p>}{workouts.length === 0 ? <div className="rq-surface rounded-2xl p-8 text-center"><p className="text-3xl">⌁</p><p className="mt-3 text-lg font-bold">No workouts logged yet.</p><p className="rq-muted mt-2">Your full history will appear here.</p></div> : <div className="space-y-4">{workouts.map((workout) => <article key={workout.id} className="rq-surface rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)]"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold">{workout.title}</h2>{workout.is_pr && <span className="rounded-full bg-[var(--accent)]/15 px-2.5 py-1 text-xs font-black text-[var(--accent)]">PR</span>}</div><p className="rq-muted mt-1">{workout.exercise_name || "Workout session"} · {workout.workout_type}</p><p className="rq-subtle mt-2 text-sm">{workout.reps ?? 0} reps · {workout.weight ?? 0} kg · {new Date(workout.created_at).toLocaleDateString()}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-[var(--accent)]/15 px-3 py-1 text-sm font-black text-[var(--accent)]">+{workoutXp(workout)} XP</span>{pendingDelete === workout.id ? <div className="flex items-center gap-2"><button type="button" onClick={() => void deleteWorkout(workout.id)} className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white">Delete</button><button type="button" onClick={() => setPendingDelete(null)} className="rq-muted rounded-full px-3 py-1.5 text-xs font-bold">Cancel</button></div> : <button type="button" onClick={() => setPendingDelete(workout.id)} className="rq-muted rounded-full px-3 py-1.5 text-xs font-bold hover:bg-red-500/10 hover:text-red-400">Delete</button>}</div></div></article>)}</div>}</div></main>;
}

export default function History() {
  return <RequireAuth><HistoryContent /></RequireAuth>;
}
