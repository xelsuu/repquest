"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RequireAuth from "@/components/RequireAuth";

type Workout = {
  id: number;
  title: string;
  workout_type: string;
  duration: number;
  difficulty: string;
  created_at: string;
  user_id: string;
};

function DashboardContent() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

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
          "id, title, workout_type, duration, difficulty, created_at, user_id"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setWorkouts(data ?? []);
      }

      setLoading(false);
    }

    loadWorkouts();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
        <h1 className="text-2xl font-bold">Loading Dashboard...</h1>
      </main>
    );
  }

  const totalWorkouts = workouts.length;

  const totalXP = workouts.reduce((xp, workout) => {
    if (workout.difficulty === "Hard") return xp + 150;
    if (workout.difficulty === "Medium") return xp + 100;
    return xp + 50;
  }, 0);

  const level = Math.floor(totalXP / 500) + 1;
  const levelProgress = totalXP % 500;
  const levelPercent = Math.round((levelProgress / 500) * 100);

  const workoutDates = [
    ...new Set(
      workouts.map((workout) =>
        new Date(workout.created_at).toDateString()
      )
    ),
  ].map((date) => new Date(date));

  workoutDates.sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;

  if (workoutDates.length > 0) {
    currentStreak = 1;

    for (let i = 1; i < workoutDates.length; i++) {
      const difference =
        (workoutDates[i - 1].getTime() - workoutDates[i].getTime()) /
        (1000 * 60 * 60 * 24);

      if (Math.round(difference) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="rq-enter mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Your training HQ</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Dashboard</h1><p className="rq-muted mt-2">Keep the streak alive and make today count.</p></div>
          <Link href="/log-workout" className="rq-accent-button rq-interactive inline-flex w-fit items-center rounded-full px-5 py-3 text-sm font-bold">＋ Log a workout</Link>
        </div>
        <section className="rq-enter rq-delay-1 rq-surface mb-6 grid gap-6 overflow-hidden rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)] sm:grid-cols-[1fr_auto] sm:items-center sm:p-7"><div><div className="flex items-center justify-between gap-4"><div><p className="rq-muted text-sm font-bold">Level {level}</p><p className="mt-1 text-2xl font-black">{500 - levelProgress} XP to level {level + 1}</p></div><span className="rq-accent text-3xl">✦</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700" style={{ width: `${levelPercent}%` }} /></div><p className="rq-muted mt-2 text-xs">{levelProgress} of 500 XP earned this level</p></div><div className="rounded-xl bg-[var(--surface-muted)] px-5 py-4 text-center"><p className="rq-muted text-xs font-bold uppercase tracking-wider">Current streak</p><p className="mt-1 text-3xl font-black">{currentStreak}<span className="rq-muted ml-1 text-sm font-bold">days</span></p></div></section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rq-enter rq-delay-1 rq-interactive rq-surface rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)]">
            <h2 className="rq-muted">Total Workouts</h2>
            <p className="text-4xl font-bold">{totalWorkouts}</p>
          </div>

          <div className="rq-enter rq-delay-2 rq-interactive rq-surface rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)]">
            <h2 className="rq-muted">Total XP</h2>
            <p className="text-4xl font-bold">{totalXP} XP</p>
          </div>

          <div className="rq-enter rq-delay-3 rq-interactive rq-surface rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)]">
            <h2 className="rq-muted">Current Level</h2>
            <p className="text-4xl font-bold">{level}</p>
          </div>

        </div>

        <div className="rq-fade-up rq-delay-5 mt-10">
          <div className="mb-4 flex items-end justify-between"><div><p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Your history</p><h2 className="mt-1 text-2xl font-black">Recent Workouts</h2></div><span className="rq-muted text-sm">Last 5 sessions</span></div>

          {workouts.length === 0 ? (
            <div className="rq-surface rounded-2xl p-8 text-center shadow-[0_12px_32px_rgba(20,40,20,0.08)]"><p className="text-3xl">⚡</p><p className="mt-3 text-lg font-bold">Your next milestone starts here.</p><p className="rq-muted mt-2">Log your first workout to start earning XP.</p><Link href="/log-workout" className="rq-accent-button rq-interactive mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-bold">Log first workout</Link></div>
          ) : (
            <div className="space-y-4">
              {workouts.slice(0, 5).map((workout) => (
                <div
                  key={workout.id}
                  className="rq-interactive rq-surface rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)]"
                >
                  <h3 className="text-xl font-bold">{workout.title}</h3>

                  <p className="rq-muted">
                    {workout.workout_type} · {workout.duration} minutes ·{" "}
                    {workout.difficulty}
                  </p>

                  <p className="rq-subtle mt-2 text-sm">
                    {new Date(workout.created_at).toLocaleDateString()}
                  </p>
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
