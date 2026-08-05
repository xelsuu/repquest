"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) {
          router.replace("/login");
          return;
        }

        setChecking(false);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-2xl font-bold">Checking your session...</h1>
      </main>
    );
  }

  return children;
}
