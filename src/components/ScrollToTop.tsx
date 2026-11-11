"use client";

export default function ScrollToTop() {
  return <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="rq-scroll-top rq-interactive fixed bottom-4 right-4 left-auto z-40 grid h-12 w-12 place-items-center rounded-full border border-[var(--accent)]/45 bg-[var(--nav)]/90 text-[var(--accent)] opacity-80 shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:border-[var(--accent)] hover:opacity-100 sm:bottom-5 sm:right-5 sm:h-16 sm:w-16" aria-label="Return to top"><span aria-hidden="true" className="rq-scroll-chevron" /></button>;
}
