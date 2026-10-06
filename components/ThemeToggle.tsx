"use client";

import { useSyncExternalStore } from "react";
import Tooltip from "@/components/Tooltip";

export type Theme = "dark" | "light";

const listeners = new Set<() => void>();

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// React calls this once right after hydration and automatically re-renders
// if it differs from getServerSnapshot() below — this is the built-in fix
// for exactly this "value only known on the client" problem, no effect
// (and no setState-in-effect lint violation) required.
export function getThemeSnapshot(): Theme {
  return (document.documentElement.dataset.theme as Theme) || "dark";
}

export function getServerThemeSnapshot(): Theme {
  return "dark";
}

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // localStorage can throw in private browsing — theme just won't persist.
  }
  listeners.forEach((listener) => listener());
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  return (
    <Tooltip label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <button
        type="button"
        onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle light / dark theme"
        className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base hover:bg-(--overlay-strong)"
      >
        <span>{theme === "dark" ? "🌙" : "☀️"}</span>
      </button>
    </Tooltip>
  );
}
