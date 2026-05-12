// components/layout/ThemeToggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ngramlab-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ngramlab-theme", "light");
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggle}
      aria-label="Toggle theme"
      className="group inline-flex h-8 w-14 items-center rounded-full border border-ink-200/70 bg-white px-1 transition-colors hover:border-ink-300 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-ink-600"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-transform ${
          isDark
            ? "translate-x-6 bg-accent-400 text-ink-950"
            : "translate-x-0 bg-ink-100 text-ink-700"
        }`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
