"use client";

import { useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabase";

function AIWorkoutContent() {
  const [goal, setGoal] = useState("");
  const [equipment, setEquipment] = useState("");
  const [experience, setExperience] = useState("Beginner");
  const [time, setTime] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [result, setResult] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [generating, setGenerating] = useState(false);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setGenerating(true);
  setResult("");

  try {
    const response = await fetch("/api/generate-workout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal,
        equipment,
        experience,
        time,
        workoutType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate workout.");
    }

    setResult(data.workout);
  } catch (error) {
    console.error(error);
    setResult("Sorry, we could not generate your workout.");
  } finally {
    setGenerating(false);
  }
}
async function handleSaveWorkout() {
  setSaveMessage("");
  setSaveError("");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setSaveError("Please log in first.");
    return;
  }

  const { error } = await supabase.from("workouts").insert([
    {
      title: `${workoutType || "Full Body"} Workout`,
      workout_type: workoutType || "Full Body",
      duration: Number(time) || 30,
      difficulty: experience,
      notes: result,
      user_id: user.id,
    },
  ]);

  if (error) {
    setSaveError(error.message);
    return;
  }

  setSaveMessage("Workout saved successfully!");
}
  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="rq-enter mb-8"><p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Your on-demand coach</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Generate a Workout</h1><p className="rq-muted mt-2">Give us the goal. We’ll shape the session.</p></div>

        <form onSubmit={handleSubmit} className="rq-enter rq-delay-1 rq-surface space-y-6 rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)] sm:p-7">
          <label className="block text-sm text-zinc-400">
            What is your fitness goal?
          </label>
          <input
            required
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            placeholder="Fitness goal, for example: Build Muscle"
          />

          <label className="block text-sm text-zinc-400">
            What equipment do you have?
          </label>
          <input
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            placeholder="Available equipment"
          />

          <label className="block text-sm text-zinc-400">
  What is your experience level?
</label>

<select
  value={experience}
  onChange={(e) => setExperience(e.target.value)}
  className="w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
>
  <option>Beginner</option>
  <option>Intermediate</option>
  <option>Advanced</option>
</select>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Time available in minutes
            </label>

            <input
              type="number"
              required
              min="5"
              max="180"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              placeholder="Example: 30"
            />
          </div>

          <label className="block text-sm text-zinc-400">
  What type of workout do you want?
</label>
          <input
            required
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-[var(--background)] p-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            placeholder="Workout type, for example: Upper Body"
          />

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={generating}
              className="rq-accent-button rq-interactive w-full rounded-full px-6 py-3.5 text-base font-black shadow-[0_8px_20px_rgba(163,230,53,0.22)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-52"
            >
              {generating ? "Generating..." : "Generate Workout"}
            </button>
            <Link href="/dashboard" className="rq-interactive w-full px-3 py-2 text-center text-sm font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] sm:w-auto">← Back to dashboard</Link>
          </div>
        </form>

        {result && (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">Your Workout</h2>

            <pre className="rq-surface mt-6 whitespace-pre-wrap rounded-2xl p-6 shadow-[0_12px_32px_rgba(20,40,20,0.08)]">
              {result}
            </pre>
            <button
  type="button"
    onClick={handleSaveWorkout}
              className="rq-accent-button rq-interactive mx-auto mt-4 block w-fit rounded-full px-6 py-3 font-bold sm:mx-0"
>
  Save Workout
</button>

{saveMessage && (
  <p className="mt-4 text-green-400">
    {saveMessage}
  </p>
)}

{saveError && (
  <p className="mt-4 text-red-400">
    {saveError}
  </p>
)}
          </div>
        )}
      </div>
    </main>
  );
}

export default function AIWorkout() {
  return (
    <RequireAuth>
      <AIWorkoutContent />
    </RequireAuth>
  );
}
