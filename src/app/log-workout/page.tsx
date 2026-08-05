"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabase";

function LogWorkoutContent() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [workoutType, setWorkoutType] = useState("Strength");
  const [duration, setDuration] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Please log in first.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("workouts").insert([
      {
        title,
        workout_type: workoutType,
        duration: Number(duration),
        difficulty,
        notes,
        user_id: user.id,
      },
    ]);

    setSaving(false);

    if (error) {
      setErrorMessage("Could not save your workout.");
      return;
    }

    setMessage("Workout saved successfully!");

    setTitle("");
    setWorkoutType("Strength");
    setDuration("");
    setDifficulty("Easy");
    setNotes("");

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="rq-enter mb-8"><p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Add to your history</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Log Workout</h1><p className="rq-muted mt-2">Capture the work while it is still fresh.</p></div>

        <form onSubmit={handleSubmit} className="rq-enter rq-delay-1 rq-surface space-y-6 rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)] sm:p-7">
          <div>
            <label className="rq-muted mb-2 block text-sm font-bold">
              Workout title
            </label>

            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              placeholder="Example: Monday Leg Workout"
            />
          </div>

          <div>
            <label className="rq-muted mb-2 block text-sm font-bold">
              Workout type
            </label>

            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            >
              <option>Strength</option>
              <option>Cardio</option>
              <option>Upper Body</option>
              <option>Lower Body</option>
              <option>Full Body</option>
              <option>Flexibility</option>
            </select>
          </div>

          <div>
            <label className="rq-muted mb-2 block text-sm font-bold">
              Duration in minutes
            </label>

            <input
              type="number"
              required
              min="1"
              max="300"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              placeholder="Example: 45"
            />
          </div>

          <div>
            <label className="rq-muted mb-2 block text-sm font-bold">
              Difficulty
            </label>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div>
            <label className="rq-muted mb-2 block text-sm font-bold">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-none rounded-xl border border-black/10 bg-[var(--background)] p-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              rows={5}
              placeholder="How did the workout feel?"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={saving}
              className="rq-accent-button rq-interactive w-full rounded-full px-6 py-3.5 text-base font-black shadow-[0_8px_20px_rgba(163,230,53,0.22)] disabled:opacity-50 sm:w-auto sm:min-w-48"
            >
              {saving ? "Saving..." : "Save Workout"}
            </button>
            <Link href="/dashboard" className="rq-interactive w-full px-3 py-2 text-center text-sm font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] sm:w-auto">← Back to dashboard</Link>
          </div>

          {message && (
            <p className="text-green-400">{message}</p>
          )}

          {errorMessage && (
            <p className="text-red-400">{errorMessage}</p>
          )}
        </form>
      </div>
    </main>
  );
}

export default function LogWorkout() {
  return (
    <RequireAuth>
      <LogWorkoutContent />
    </RequireAuth>
  );
}
