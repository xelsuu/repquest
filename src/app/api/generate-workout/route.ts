import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { goal, equipment, experience, time, workoutType, workout } = body;
    if (!goal || !experience || !time || !workoutType) {
  return NextResponse.json(
    { error: "Please complete all required workout fields." },
    { status: 400 }
  );
}

    const response = await openai.responses.create({
      model: "gpt-5-nano-2025-08-07",
      input: `
Create a safe and practical workout.

Goal: ${goal}
Equipment: ${equipment || "Bodyweight"}
Experience: ${experience}
Time available: ${time} minutes
Workout: ${workout}
Workout type: ${workoutType}

Return valid JSON only, with this exact shape:
{
  "warmup": "short warm-up instructions",
  "exercises": [{ "name": "exercise name", "sets": 3, "reps": 10 }],
  "cooldown": "short cool-down instructions"
}
Return three to five exercises that fit the selected workout and type. Use integer reps and sets.
`,
    });

    return NextResponse.json({
      workout: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not generate workout." },
      { status: 500 }
    );
  }
}
