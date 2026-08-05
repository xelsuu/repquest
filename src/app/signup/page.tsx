"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    alert(
      "Account created. Check your email if confirmation is required."
    );

    router.push("/login")
  }

  return (
    <main className="min-h-screen bg-black p-4 text-white sm:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-zinc-900"
            placeholder="Email"
          />

          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-zinc-900"
            placeholder="Password"
          />

          <button
            type="submit"
            className="bg-purple-600 px-6 py-3 rounded"
          >
            Sign Up
          </button>
        </form>

        {message && (
          <p className="mt-6 text-zinc-300">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
