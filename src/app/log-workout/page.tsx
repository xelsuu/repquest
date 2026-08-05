"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <main className="min-h-screen bg-black p-4 text-white sm:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold sm:text-4xl">
          Log Workout
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Workout title
            </label>

            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded bg-zinc-900 p-3"
              placeholder="Example: Monday Leg Workout"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Workout type
            </label>

            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              className="w-full rounded bg-zinc-900 p-3"
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
            <label className="mb-2 block text-sm text-zinc-400">
              Duration in minutes
            </label>

            <input
              type="number"
              required
              min="1"
              max="300"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded bg-zinc-900 p-3"
              placeholder="Example: 45"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Difficulty
            </label>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded bg-zinc-900 p-3"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded bg-zinc-900 p-3"
              rows={5}
              placeholder="How did the workout feel?"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mx-auto block w-fit rounded bg-blue-600 px-6 py-3 hover:bg-blue-700 disabled:opacity-50 sm:mx-0"
          >
            {saving ? "Saving..." : "Save Workout"}
          </button>

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
