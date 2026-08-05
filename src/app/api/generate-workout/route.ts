import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { goal, equipment, experience, time, workoutType } = body;
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
Workout type: ${workoutType}

Return:
1. A warm-up
2. Three to five exercises
3. Sets and repetitions
4. Rest times
5. A cool-down
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