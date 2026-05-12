// app/preprocessing/page.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Type } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  PageHeader,
  Alert,
  Stat,
  Badge,
  FadeIn,
} from "@/components/ui/primitives";
import { useExperiment } from "@/lib/store/experiment";
import { preprocessText } from "@/lib/nlp/preprocess";
import { formatNumber } from "@/lib/utils";

const VOCAB_PRESETS = [500, 1000, 5000, 0];

export default function PreprocessingPage() {
  const {
    rawText,
    preprocessOptions,
    setPreprocessOptions,
    preprocessed,
    setPreprocessed,
  } = useExperiment();

  function runPreprocess() {
    if (!rawText) return;
    const result = preprocessText(rawText, preprocessOptions);
    setPreprocessed(result);
  }

  // Auto-run when the user changes any setting — cheap on small corpora.
  const cached = useMemo(() => preprocessed, [preprocessed]);

  const topTokens = useMemo(() => {
    if (!cached) return [];
    return Object.entries(cached.freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [cached]);

  const noCorpus = !rawText || rawText.trim().length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Preprocessing"
        description="Normalize the corpus, add sentence boundaries, and shrink the vocabulary by replacing rare words with <UNK>."
        step={{ current: 2, total: 8 }}
      >
        <Button variant="outline" onClick={runPreprocess} disabled={noCorpus}>
          <RefreshCw className="h-4 w-4" /> Run
        </Button>
        <Link href="/split">
          <Button disabled={!cached}>
            Next: Split <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      {noCorpus && (
        <Alert variant="warn" className="mb-6">
          No corpus loaded yet. <Link href="/corpus" className="underline">Pick one first.</Link>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Tweak and re-run.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "lowercase", label: "Lowercase" },
                { key: "removeExtraSpaces", label: "Collapse extra spaces" },
                { key: "keepPunctuation", label: "Keep punctuation as tokens" },
                { key: "addSentenceBoundaries", label: "Add <s> and </s>" },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="text-sm">{opt.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(
                      preprocessOptions[opt.key as keyof typeof preprocessOptions]
                    )}
                    onChange={(e) =>
                      setPreprocessOptions({ [opt.key]: e.target.checked } as any)
                    }
                    className="h-4 w-4 rounded border-ink-300 text-accent-500 focus:ring-accent-400"
                  />
                </label>
              ))}

              <div>
                <div className="flex justify-between text-sm">
                  <span>Vocabulary cap</span>
                  <span className="font-mono text-xs text-ink-500">
                    {preprocessOptions.vocabSize === 0
                      ? "no cap"
                      : preprocessOptions.vocabSize}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {VOCAB_PRESETS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setPreprocessOptions({ vocabSize: v })}
                      className={`rounded-md border text-xs py-1.5 transition-colors ${
                        preprocessOptions.vocabSize === v
                          ? "border-accent-400 bg-accent-400/10 text-accent-700 dark:text-accent-300"
                          : "border-ink-200 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-800/40"
                      }`}
                    >
                      {v === 0 ? "all" : v}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={preprocessOptions.vocabSize}
                  onChange={(e) =>
                    setPreprocessOptions({
                      vocabSize: Math.max(0, parseInt(e.target.value || "0", 10)),
                    })
                  }
                  className="mt-2 w-full rounded-md border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <TokenField
                  label="Start"
                  value={preprocessOptions.startToken}
                  onChange={(v) => setPreprocessOptions({ startToken: v })}
                />
                <TokenField
                  label="End"
                  value={preprocessOptions.endToken}
                  onChange={(v) => setPreprocessOptions({ endToken: v })}
                />
                <TokenField
                  label="Unknown"
                  value={preprocessOptions.unkToken}
                  onChange={(v) => setPreprocessOptions({ unkToken: v })}
                />
              </div>

              <Button
                onClick={runPreprocess}
                disabled={noCorpus}
                className="w-full"
              >
                <Type className="h-4 w-4" /> Apply preprocessing
              </Button>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Outputs */}
        <FadeIn delay={0.1} className="lg:col-span-2 space-y-6">
          {cached ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Total tokens" value={formatNumber(cached.tokens.length)} accent />
                <Stat label="Unique before" value={formatNumber(cached.uniqueBefore)} />
                <Stat label="Unique after" value={formatNumber(cached.uniqueAfter)} />
                <Stat
                  label="<UNK> replaced"
                  value={formatNumber(cached.unkReplacements)}
                  sublabel={`${((cached.unkReplacements / Math.max(cached.tokens.length, 1)) * 100).toFixed(1)}% of stream`}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tokenized stream</CardTitle>
                  <CardDescription>
                    First 200 tokens with sentence boundaries visualized.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 max-h-60 overflow-auto scrollbar-thin">
                    {cached.tokens.slice(0, 200).map((t, i) => {
                      const isBoundary =
                        t === preprocessOptions.startToken ||
                        t === preprocessOptions.endToken;
                      const isUnk = t === preprocessOptions.unkToken;
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono ${
                            isBoundary
                              ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                              : isUnk
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                : "bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200"
                          }`}
                        >
                          {t}
                        </span>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top 20 tokens</CardTitle>
                  <CardDescription>
                    Most frequent items in the cleaned vocabulary.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400 border-b border-ink-200 dark:border-ink-800">
                          <th className="py-2 pr-4">Rank</th>
                          <th className="py-2 pr-4">Token</th>
                          <th className="py-2 pr-4 text-right">Count</th>
                          <th className="py-2 pr-4 text-right">Frequency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topTokens.map(([tok, count], i) => (
                          <tr
                            key={tok}
                            className="border-b border-ink-100/60 dark:border-ink-800/60"
                          >
                            <td className="py-1.5 pr-4 text-ink-500 dark:text-ink-400 text-xs">
                              #{i + 1}
                            </td>
                            <td className="py-1.5 pr-4 font-mono">{tok}</td>
                            <td className="py-1.5 pr-4 text-right font-mono">
                              {count}
                            </td>
                            <td className="py-1.5 pr-4 text-right font-mono text-ink-500 dark:text-ink-400">
                              {((count / cached.tokens.length) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-ink-500 dark:text-ink-400">
                <Type className="h-10 w-10 mx-auto opacity-40 mb-3" />
                Click <Badge variant="default" className="mx-1">Apply preprocessing</Badge>
                to see the tokenized output.
              </CardContent>
            </Card>
          )}
        </FadeIn>
      </div>
    </div>
  );
}

function TokenField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-ink-500 dark:text-ink-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent-400"
      />
    </label>
  );
}
