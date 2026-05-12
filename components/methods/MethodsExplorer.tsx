"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, X } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  FadeIn,
  PageHeader,
} from "@/components/ui/primitives";
import { LearningPath } from "@/components/methods/LearningPath";
import { MethodCard } from "@/components/methods/MethodCard";
import { MethodComparisonTable } from "@/components/methods/MethodComparisonTable";
import {
  MethodFilters,
  type MethodFilterState,
} from "@/components/methods/MethodFilters";
import { NLP_METHODS, type NlpMethod } from "@/data/methods";

const DEFAULT_FILTERS: MethodFilterState = {
  search: "",
  category: "All",
  difficulty: "All",
  status: "All",
};

export function MethodsExplorer() {
  const [filters, setFilters] = useState<MethodFilterState>(DEFAULT_FILTERS);
  const [previewMethod, setPreviewMethod] = useState<NlpMethod | null>(null);

  const filteredMethods = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return NLP_METHODS.filter((method) => {
      const matchesSearch =
        query.length === 0 ||
        method.name.toLowerCase().includes(query) ||
        method.description.toLowerCase().includes(query) ||
        method.category.toLowerCase().includes(query);
      const matchesCategory =
        filters.category === "All" || method.category === filters.category;
      const matchesDifficulty =
        filters.difficulty === "All" || method.difficulty === filters.difficulty;
      const matchesStatus =
        filters.status === "All" || method.status === filters.status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty &&
        matchesStatus
      );
    });
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="NLP Methods Explorer"
        description="Browse classical and modern NLP methods, then open interactive demos to understand how each method works step by step."
      />

      <FadeIn>
        <div className="space-y-8">
          <MethodFilters value={filters} onChange={setFilters} />

          <section aria-labelledby="method-grid-title">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="method-grid-title" className="font-display text-2xl font-semibold">
                  Method Catalog
                </h2>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                  Showing {filteredMethods.length} of {NLP_METHODS.length} methods.
                </p>
              </div>
              {filteredMethods.length !== NLP_METHODS.length && (
                <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Clear filters
                </Button>
              )}
            </div>

            {filteredMethods.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-8 text-center dark:border-ink-800 dark:bg-ink-900/60">
                <h3 className="font-display text-xl font-semibold">
                  No methods found
                </h3>
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                  Try a broader search term or reset the filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.025 }}
                  >
                    <MethodCard
                      method={method}
                      onLearnMore={setPreviewMethod}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <MethodComparisonTable />

          <LearningPath />
        </div>
      </FadeIn>

      {previewMethod && (
        <MethodologyPreview
          method={previewMethod}
          onClose={() => setPreviewMethod(null)}
        />
      )}
    </div>
  );
}

function MethodologyPreview({
  method,
  onClose,
}: {
  method: NlpMethod;
  onClose: () => void;
}) {
  const demoEntryRoute = method.id === "4gram" ? "/4gram/corpus" : method.route;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-preview-title"
      onClick={onClose}
    >
      <Card
        className="max-h-[88vh] w-full max-w-4xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-200 px-5 py-4 dark:border-ink-800">
          <div>
            <Badge variant="accent" className="mb-2">
              Methodology Preview
            </Badge>
            <h2
              id="methodology-preview-title"
              className="font-display text-2xl font-semibold"
            >
              {method.name}
            </h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              A quick view of the methodology before starting the interactive
              demo.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close methodology preview"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-ink-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(88vh-9rem)] overflow-y-auto">
          <CardContent className="space-y-5 p-5">
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 dark:border-ink-800 dark:bg-ink-950/40">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-ink-100">
                <BookOpen className="h-4 w-4 text-accent-600 dark:text-accent-300" />
                How this method works
              </div>
              <p className="mt-3 text-sm leading-7 text-ink-700 dark:text-ink-300">
                A 4-gram language model predicts the next word from the previous
                three tokens. It estimates probability from observed counts,
                then compares a simple backoff model with an interpolated
                add-k-smoothed model.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <PreviewBlock
                label="01"
                title="Tokenize and Count"
                text="Text is normalized into tokens, sentence boundaries are added when needed, and unigram through 4-gram count tables are built."
              />
              <PreviewBlock
                label="02"
                title="Estimate Probability"
                text="The demo shows how observed counts become conditional probabilities for predicting the next word."
              />
              <PreviewBlock
                label="03"
                title="Handle Unseen Contexts"
                text="Backoff falls to shorter contexts, while interpolation mixes orders and add-k smoothing assigns non-zero probability."
              />
              <PreviewBlock
                label="04"
                title="Evaluate and Generate"
                text="Perplexity measures held-out performance, and the generator exposes the selected words and probability trace."
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Visible in the demo
              </p>
              <ul className="mt-2 grid gap-2 text-sm text-ink-700 dark:text-ink-300 sm:grid-cols-2">
                {method.inspectItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-ink-200 px-5 py-4 dark:border-ink-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {demoEntryRoute && (
            <Link href={demoEntryRoute}>
              <Button>
                Start Demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}

function PreviewBlock({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-ink-200 p-4 dark:border-ink-800">
      <Badge variant="default">{label}</Badge>
      <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-300">
        {text}
      </p>
    </div>
  );
}
