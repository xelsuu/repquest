"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-4 text-white sm:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Log In
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-zinc-900"
            placeholder="Password"
          />

          <button
            type="submit"
            className="bg-blue-600 px-6 py-3 rounded"
          >
            Log In
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
