"use client";

import { useEffect, useState } from "react";
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
      <div className="mx-auto max-w-5xl">
        <h1 className="rq-enter mb-8 text-3xl font-bold sm:text-4xl">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

          <div className="rq-enter rq-delay-4 rq-interactive rq-surface rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)]">
            <h2 className="rq-muted">Current Streak</h2>
            <p className="text-4xl font-bold">{currentStreak} days</p>
          </div>
        </div>

        <div className="rq-fade-up rq-delay-5 mt-8">
          <h2 className="mb-4 text-2xl font-bold">Recent Workouts</h2>

          {workouts.length === 0 ? (
            <p className="rq-muted">
              No workouts yet. Log your first workout to get started.
            </p>
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
