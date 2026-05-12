"use client";

import Link from "next/link";
import { Activity, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@/components/ui/primitives";
import type { NlpMethod } from "@/data/methods";

const OUTPUTS = [
  "Corpus size",
  "Token count",
  "Vocabulary size",
  "Train / validation / test split",
  "Smoothing method",
  "Perplexity",
  "Generation trace",
];

export function FeaturedMethod({ method }: { method: NlpMethod }) {
  return (
    <section aria-labelledby="featured-method-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="featured-method-title" className="font-display text-2xl font-semibold">
            Featured Method
          </h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Start with the current interactive demo and inspect each modeling step.
          </p>
        </div>
        <Badge variant="success">Interactive Demo Available</Badge>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent-400/30 bg-accent-400/10 text-accent-700 dark:text-accent-300">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold">
              {method.name}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-600 dark:text-ink-300">
              A 4-gram model predicts the next word using the previous three
              words. It is a simple but powerful way to understand statistical
              text generation.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/methods/4gram">
                <Button>
                  Open 4-Gram Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/4gram/explain">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4" />
                  View Methodology
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 dark:border-ink-800 dark:bg-ink-950/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Visible learning outputs
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {OUTPUTS.map((output) => (
                <div
                  key={output}
                  className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-ink-700 ring-1 ring-ink-200 dark:bg-ink-900 dark:text-ink-200 dark:ring-ink-800"
                >
                  <CheckCircle2 className="h-4 w-4 text-accent-600 dark:text-accent-300" />
                  {output}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
