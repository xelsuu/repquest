"use client";

import { useState } from "react";
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
    <main className="min-h-screen bg-black p-4 text-white sm:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold sm:text-4xl">
          Generate Your Workout
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block text-sm text-zinc-400">
            What is your fitness goal?
          </label>
          <input
            required
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full rounded bg-zinc-900 p-3"
            placeholder="Fitness goal, for example: Build Muscle"
          />

          <label className="block text-sm text-zinc-400">
            What equipment do you have?
          </label>
          <input
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="w-full rounded bg-zinc-900 p-3"
            placeholder="Available equipment"
          />

          <label className="block text-sm text-zinc-400">
  What is your experience level?
</label>

<select
  value={experience}
  onChange={(e) => setExperience(e.target.value)}
  className="w-full rounded bg-zinc-900 p-3"
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
              className="w-full rounded bg-zinc-900 p-3"
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
            className="w-full rounded bg-zinc-900 p-3"
            placeholder="Workout type, for example: Upper Body"
          />

          <button
            type="submit"
            disabled={generating}
            className="mx-auto block w-fit rounded bg-purple-600 px-6 py-3 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:mx-0"
          >
            {generating ? "Generating..." : "Generate Workout"}
          </button>
        </form>

        {result && (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">Your Workout</h2>

            <pre className="whitespace-pre-wrap rounded-xl bg-zinc-900 p-6">
              {result}
            </pre>
            <button
  type="button"
    onClick={handleSaveWorkout}
              className="mx-auto mt-4 block w-fit rounded bg-green-600 px-6 py-3 hover:bg-green-700 sm:mx-0"
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
