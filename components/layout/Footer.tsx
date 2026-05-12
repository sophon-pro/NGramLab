// components/layout/Footer.tsx
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "border-t border-ink-200/60 dark:border-ink-800/80 py-6 mt-12",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-ink-500 dark:text-ink-400">
          NLPLearningLab · Browser NLP Methods · v1.0
        </p>
        <a
          href="https://github.com/sophon-pro/NLPLearningLab"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400 hover:text-accent-600 dark:hover:text-accent-300 transition-colors"
        >
          <Github className="h-3.5 w-3.5" /> View on GitHub
        </a>
      </div>
    </footer>
  );
}
