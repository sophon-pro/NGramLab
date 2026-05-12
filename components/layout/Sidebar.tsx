// components/layout/Sidebar.tsx
// Persistent left sidebar for the workflow. On mobile, slides in as a drawer.
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Type,
  Scissors,
  Brain,
  SlidersHorizontal,
  Gauge,
  Wand2,
  LayoutDashboard,
  FileText,
  GraduationCap,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useExperiment } from "@/lib/store/experiment";
import { cn } from "@/lib/utils";
import logoMark from "@/NGram.png";

type Step = {
  href: string;
  label: string;
  icon: typeof BookOpen;
  step?: number; // numbered workflow steps only
  isDoneKey: keyof DoneFlags;
};

type DoneFlags = {
  corpus: boolean;
  preprocess: boolean;
  split: boolean;
  training: boolean;
  tuning: boolean;
  evaluation: boolean;
  generator: boolean;
  report: boolean;
};

const STEPS: Step[] = [
  { href: "/corpus", label: "Corpus", icon: BookOpen, step: 1, isDoneKey: "corpus" },
  { href: "/preprocessing", label: "Preprocess", icon: Type, step: 2, isDoneKey: "preprocess" },
  { href: "/split", label: "Split", icon: Scissors, step: 3, isDoneKey: "split" },
  { href: "/training", label: "Train", icon: Brain, step: 4, isDoneKey: "training" },
  { href: "/tuning", label: "Tune", icon: SlidersHorizontal, step: 5, isDoneKey: "tuning" },
  { href: "/evaluation", label: "Evaluate", icon: Gauge, step: 6, isDoneKey: "evaluation" },
  { href: "/generator", label: "Generate", icon: Wand2, step: 7, isDoneKey: "generator" },
  { href: "/report", label: "Report", icon: FileText, step: 8, isDoneKey: "report" },
];

const AUX_LINKS: Step[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, isDoneKey: "corpus" },
  { href: "/explain", label: "Methodology", icon: GraduationCap, isDoneKey: "corpus" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer when the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when the drawer is open.
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Derive step completion from the store.
  const {
    rawText,
    preprocessed,
    split,
    lm1Result,
    lm2Result,
    bestHyperparameters,
    generatedExamples,
  } = useExperiment();

  const done: DoneFlags = {
    corpus: rawText.trim().length > 0,
    preprocess: !!preprocessed && preprocessed.tokens.length > 0,
    split:
      !!split &&
      split.train.length > 0 &&
      split.validation.length > 0 &&
      split.test.length > 0,
    training: !!lm1Result || !!lm2Result,
    tuning: !!bestHyperparameters,
    evaluation: !!lm1Result && !!lm2Result,
    generator: generatedExamples.length > 0,
    report: !!lm1Result && !!lm2Result && !!preprocessed,
  };

  const completedCount = STEPS.filter((s) => done[s.isDoneKey]).length;
  const activeStep =
    STEPS.find(
      (s) =>
        pathname === s.href || (s.href !== "/" && pathname?.startsWith(s.href))
    )?.step ?? 0;
  const progressStep = activeStep || completedCount;

  return (
    <>
      {/* Mobile hamburger — fixed top-left */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200/60 dark:border-ink-800/80 bg-ink-50/90 dark:bg-ink-950/90 backdrop-blur-md text-ink-700 dark:text-ink-200 shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — desktop fixed, mobile slide-in */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen lg:h-screen w-72 lg:w-64 shrink-0",
          "border-r border-ink-200/60 dark:border-ink-800/80",
          "bg-ink-50/95 dark:bg-ink-950/95 backdrop-blur-md",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-ink-200/60 dark:border-ink-800/80">
            <Link
              href="/"
              className="flex items-center gap-2 group"
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src={logoMark}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg shadow-glow"
                priority
              />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-display text-base font-bold tracking-tight">
                  NGramLab
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500 dark:text-ink-400">
                  Digital Data Academy
                </span>
              </div>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress meter */}
          <div className="px-4 py-3 border-b border-ink-200/60 dark:border-ink-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400">
                Progress
              </span>
              <span className="text-xs font-mono text-ink-600 dark:text-ink-300">
                Step {progressStep}/{STEPS.length}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-200/70 dark:bg-ink-800/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-400 to-violetx-500 transition-all duration-500"
                style={{
                  width: `${(progressStep / STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Workflow steps */}
          <nav className="flex-1 overflow-hidden px-2 py-3">
            <div className="px-2 mb-1 text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400">
              Workflow
            </div>
            <ul className="space-y-0.5">
              {STEPS.map((s) => {
                const Icon = s.icon;
                const active =
                  pathname === s.href ||
                  (s.href !== "/" && pathname?.startsWith(s.href));
                const isDone = done[s.isDoneKey];
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent-400/10 text-accent-700 dark:text-accent-200"
                          : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800/60"
                      )}
                    >
                      {/* Step number / check */}
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-mono font-semibold",
                          isDone
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                            : active
                              ? "bg-accent-400/20 text-accent-700 dark:text-accent-200"
                              : "bg-ink-200/60 dark:bg-ink-800 text-ink-500 dark:text-ink-400"
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          s.step
                        )}
                      </span>
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-accent-600 dark:text-accent-300"
                            : "text-ink-500 dark:text-ink-400 group-hover:text-ink-700 dark:group-hover:text-ink-200"
                        )}
                      />
                      <span className="flex-1 font-medium">{s.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Auxiliary */}
            <div className="px-2 mt-5 mb-1 text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400">
              Overview
            </div>
            <ul className="space-y-0.5">
              {AUX_LINKS.map((s) => {
                const Icon = s.icon;
                const active =
                  pathname === s.href ||
                  (s.href !== "/" && pathname?.startsWith(s.href));
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-violetx-400/10 text-violetx-700 dark:text-violetx-200"
                          : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800/60"
                      )}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink-200/40 dark:bg-ink-800/60">
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5",
                            active
                              ? "text-violetx-600 dark:text-violetx-300"
                              : "text-ink-500 dark:text-ink-400"
                          )}
                        />
                      </span>
                      <span className="flex-1 font-medium">{s.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer: theme toggle + version */}
          <div className="h-16 border-t border-ink-200/60 dark:border-ink-800/80 px-3 flex items-center justify-between gap-2">
            <span className="text-[10px] text-ink-500 dark:text-ink-400">
              NGramLab · v1.0
            </span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}



