"use client";

import { useState } from "react";

const colors = { Iron: "#4b5563", Bronze: "#b87333", Silver: "#aeb7c2", Gold: "#d6a928", Platinum: "#218c8d", Diamond: "#8b5cf6" } as const;
type ColorName = keyof typeof colors;

export default function AccentPalette() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ColorName | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem("repquest-accent-tier") as ColorName | null;
    return saved && saved in colors ? saved : null;
  });

  function choose(color: ColorName | null) {
    setSelected(color);
    if (color) window.localStorage.setItem("repquest-accent-tier", color);
    else window.localStorage.removeItem("repquest-accent-tier");
    document.documentElement.style.setProperty("--accent", color ? colors[color] : "#a3e635");
    document.documentElement.style.setProperty("--accent-ink", color ? "#102010" : "#1c2b0d");
    setOpen(false);
  }

  return <div className="rq-accent-palette fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-24 sm:right-5">
    {open && <div className="rq-surface w-44 rounded-xl border border-[var(--accent)]/25 p-2 shadow-xl"><p className="rq-muted px-2 pb-1 text-[10px] font-black uppercase tracking-wider">Accent color</p><button type="button" onClick={() => choose(null)} aria-pressed={selected === null} className="rq-interactive flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold"><span className="h-3 w-3 rounded-full bg-[#a3e635]" />Default lime</button>{Object.entries(colors).map(([name, color]) => <button type="button" key={name} onClick={() => choose(name as ColorName)} aria-pressed={selected === name} className="rq-interactive flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />{name}</button>)}</div>}
    <button type="button" onClick={() => setOpen((value) => !value)} className="rq-interactive grid h-9 w-9 place-items-center rounded-full border border-[var(--accent)]/45 bg-[var(--nav)]/95 text-sm text-[var(--accent)] opacity-85 shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:opacity-100 sm:h-12 sm:w-12" aria-label="Choose accent color" aria-expanded={open}>◐</button>
  </div>;
}
