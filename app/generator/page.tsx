// app/generator/page.tsx
// Interactive text generation using either LM1 (backoff) or LM2 (interpolation).
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Copy,
  Trash2,
  Wand2,
  Info,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  PageHeader,
  Alert,
  Badge,
  FadeIn,
} from "@/components/ui/primitives";
import { useExperiment } from "@/lib/store/experiment";
import { buildAllCounts } from "@/lib/nlp/ngrams";
import {
  generateText,
  makeBackoffScorer,
  makeInterpolationScorer,
} from "@/lib/nlp/generator";
import type { GenerationStrategy } from "@/types/nlp";
import { formatNumber } from "@/lib/utils";

type ModelChoice = "lm1" | "lm2";

export default function GeneratorPage() {
  const {
    preprocessed,
    split,
    counts,
    setCounts,
    lambdas,
    k,
    lastGenerationSteps,
    setLastGenerationSteps,
    addGeneratedExample,
    generatedExamples,
  } = useExperiment();

  useEffect(() => {
    if (!counts && split) {
      setCounts(buildAllCounts(split.train, preprocessed?.vocabulary ?? []));
    }
  }, [counts, split, preprocessed, setCounts]);

  const [model, setModel] = useState<ModelChoice>("lm2");
  const [seed, setSeed] = useState("the quick");
  const [maxWords, setMaxWords] = useState(50);
  const [temperature, setTemperature] = useState(0.9);
  const [strategy, setStrategy] = useState<GenerationStrategy>("weighted");
  const [topK, setTopK] = useState(10);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const vocabulary = useMemo(
    () => preprocessed?.vocabulary ?? [],
    [preprocessed]
  );

  const ready = !!preprocessed && !!split && !!counts && vocabulary.length > 0;

  function runGeneration() {
    if (!ready || !counts) return;
    setRunning(true);

    setTimeout(() => {
      const scorer =
        model === "lm1"
          ? makeBackoffScorer(counts)
          : makeInterpolationScorer(counts, lambdas, k);
      const result = generateText(seed, vocabulary, scorer, {
        maxWords,
        temperature,
        topK,
        strategy,
      });
      setOutput(result.generatedText);
      setLastGenerationSteps(result.steps);
      addGeneratedExample(result.generatedText);
      setRunning(false);
    }, 40);
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  function clearOutput() {
    setOutput("");
    setLastGenerationSteps([]);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        step={{ current: 7, total: 8 }}
        title="Text Generator"
        description="Use a trained 4-gram model to predict the next words from a seed. Switch between backoff and interpolation to see how smoothing changes what gets sampled."
      />

      {!ready && (
        <Alert variant="warn" className="mb-6">
          <strong>No trained model in memory.</strong> Visit the{" "}
          <Link href="/4gram/training" className="underline">
            Training page
          </Link>{" "}
          to build the n-gram counts first.
        </Alert>
      )}

      <FadeIn>
        <div className="mb-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Controls</CardTitle>
              <CardDescription>Configure the generation run.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-ink-600 dark:text-ink-300">
                  Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setModel("lm1")}
                    className={`min-h-14 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      model === "lm1"
                        ? "border-accent-400 bg-accent-400/10 text-accent-700 shadow-sm dark:text-accent-200"
                        : "border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50 dark:border-ink-800 dark:text-ink-300 dark:hover:border-ink-700 dark:hover:bg-ink-800/40"
                    }`}
                  >
                    LM1 Backoff
                  </button>
                  <button
                    onClick={() => setModel("lm2")}
                    className={`min-h-14 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      model === "lm2"
                        ? "border-violet-400 bg-violet-500/10 text-violet-700 shadow-sm dark:text-violet-200"
                        : "border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50 dark:border-ink-800 dark:text-ink-300 dark:hover:border-ink-700 dark:hover:bg-ink-800/40"
                    }`}
                  >
                    LM2 Interpolation
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink-600 dark:text-ink-300">
                  Seed text
                </label>
                <input
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="e.g. the model predicts"
                  className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/20 dark:border-ink-800 dark:bg-ink-950 dark:text-ink-100 dark:placeholder:text-ink-500"
                />
                <p className="mt-2 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
                  The last 3 words form the 4-gram context. Start-tokens fill
                  the gap if the seed is shorter.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink-600 dark:text-ink-300">
                  Length:{" "}
                  <span className="text-accent-600 dark:text-accent-300">
                    {maxWords}
                  </span>{" "}
                  words
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[20, 50, 100].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMaxWords(n)}
                      className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                        maxWords === n
                          ? "border-accent-400 bg-accent-400/10 text-accent-700 shadow-sm dark:text-accent-200"
                          : "border-ink-200 text-ink-500 hover:border-ink-300 hover:bg-ink-50 dark:border-ink-800 dark:text-ink-300 dark:hover:border-ink-700 dark:hover:bg-ink-800/40"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink-600 dark:text-ink-300">
                  Temperature:{" "}
                  <span className="text-accent-600 dark:text-accent-300">
                    {temperature.toFixed(2)}
                  </span>
                </label>
                <input
                  type="range"
                  min={0.2}
                  max={1.5}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-accent-400"
                />
                <div className="mt-1 flex justify-between text-[11px] text-ink-500 dark:text-ink-400">
                  <span>0.2 sharp</span>
                  <span>1.0 neutral</span>
                  <span>1.5 diverse</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink-600 dark:text-ink-300">
                  Sampling strategy
                </label>
                <div className="space-y-2">
                  {(
                    [
                      ["greedy", "Greedy - always pick the most likely word"],
                      ["weighted", "Weighted - sample proportional to probability"],
                      ["top-k", "Top-K - sample only from the top K candidates"],
                    ] as [GenerationStrategy, string][]
                  ).map(([val, label]) => (
                    <label
                      key={val}
                      className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                        strategy === val
                          ? "border-accent-400 bg-accent-400/10 shadow-sm"
                          : "border-ink-200 hover:border-ink-300 hover:bg-ink-50 dark:border-ink-800 dark:hover:border-ink-700 dark:hover:bg-ink-800/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="strategy"
                        value={val}
                        checked={strategy === val}
                        onChange={() => setStrategy(val)}
                        className="mt-1 accent-accent-400"
                      />
                      <span className="leading-relaxed text-ink-600 dark:text-ink-300">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {strategy === "top-k" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink-600 dark:text-ink-300">
                    Top-K size:{" "}
                    <span className="text-accent-600 dark:text-accent-300">
                      {topK}
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 20].map((n) => (
                      <button
                        key={n}
                        onClick={() => setTopK(n)}
                        className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                          topK === n
                            ? "border-accent-400 bg-accent-400/10 text-accent-700 shadow-sm dark:text-accent-200"
                            : "border-ink-200 text-ink-500 hover:border-ink-300 hover:bg-ink-50 dark:border-ink-800 dark:text-ink-300 dark:hover:border-ink-700 dark:hover:bg-ink-800/40"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={runGeneration}
                disabled={!ready || running || !seed.trim()}
                className="w-full"
                size="lg"
              >
                {running ? (
                  <>
                    <Wand2 className="h-4 w-4 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="flex h-full min-h-0 flex-col gap-6">
            <Card className="flex min-h-0 flex-1 flex-col">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Generated text</CardTitle>
                    <CardDescription>
                      Produced by{" "}
                      <Badge variant={model === "lm1" ? "accent" : "violet"}>
                        {model === "lm1" ? "LM1 Backoff" : "LM2 Interpolation"}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyOutput}
                      disabled={!output}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearOutput}
                      disabled={!output}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col">
                <div
                  className={`min-h-[220px] flex-1 overflow-auto rounded-lg border p-6 text-base leading-relaxed sm:text-lg ${
                    output
                      ? "border-ink-200 bg-ink-50 text-ink-900 shadow-inner dark:border-ink-800 dark:bg-ink-950 dark:text-ink-100"
                      : "border-dashed border-ink-300 bg-ink-50 text-ink-500 italic dark:border-ink-800 dark:bg-ink-950/50 dark:text-ink-400"
                  }`}
                >
                  {output ||
                    "Choose a model, enter a seed, then click Generate. The output will appear here."}
                </div>

                {output && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-500 dark:text-ink-400 sm:grid-cols-4">
                    <span>
                      Length:{" "}
                      <span className="font-medium text-ink-700 dark:text-ink-300">
                        {formatNumber(output.split(/\s+/).length)} words
                      </span>
                    </span>
                    <span>
                      Steps:{" "}
                      <span className="font-medium text-ink-700 dark:text-ink-300">
                        {formatNumber(lastGenerationSteps.length)}
                      </span>
                    </span>
                    <span>
                      Strategy:{" "}
                      <span className="font-medium text-ink-700 dark:text-ink-300">
                        {strategy}
                      </span>
                    </span>
                    <span>
                      Temperature:{" "}
                      <span className="font-medium text-ink-700 dark:text-ink-300">
                        {temperature.toFixed(2)}
                      </span>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {lastGenerationSteps.length > 0 && (
              <Card className="flex max-h-[360px] min-h-0 flex-col">
                <CardHeader>
                  <CardTitle>Generation trace</CardTitle>
                  <CardDescription>
                    For each step we show the 3-word context, the picked word,
                    and the probability assigned to that pick after temperature.
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-0">
                  <div className="max-h-[216px] overflow-auto rounded-lg border border-ink-200 dark:border-ink-800">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-ink-50 text-left text-ink-600 dark:bg-ink-950 dark:text-ink-300">
                        <tr>
                          <th className="px-3 py-2 font-medium">Step</th>
                          <th className="px-3 py-2 font-medium">Context</th>
                          <th className="px-3 py-2 font-medium">
                            Picked word
                          </th>
                          <th className="px-3 py-2 font-medium text-right">
                            Probability
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                        {lastGenerationSteps.slice(0, 60).map((s) => (
                          <tr
                            key={s.step}
                            className="hover:bg-ink-50/80 dark:hover:bg-ink-800/30"
                          >
                            <td className="px-3 py-2 text-ink-500 dark:text-ink-400">
                              {s.step}
                            </td>
                            <td className="px-3 py-2 font-mono text-xs text-ink-600 dark:text-ink-300">
                              {s.context || "-"}
                            </td>
                            <td className="px-3 py-2 font-mono font-medium text-accent-700 dark:text-accent-300">
                              {s.selectedWord}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-ink-600 dark:text-ink-300">
                              {s.probability.toExponential(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {lastGenerationSteps.length > 60 && (
                    <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
                      Showing first 60 steps of {lastGenerationSteps.length}.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {generatedExamples.length > 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent generations</CardTitle>
              <CardDescription>
                The 10 most recent outputs are kept across pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {generatedExamples.slice(0, 5).map((ex, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm leading-relaxed text-ink-800 dark:border-ink-800 dark:bg-ink-950 dark:text-ink-200"
                  >
                    <span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-medium text-ink-500 ring-1 ring-ink-200 dark:bg-ink-900 dark:text-ink-400 dark:ring-ink-800">
                      {i + 1}
                    </span>
                    {ex}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Alert variant="info" className="mb-8">
          <Info className="h-4 w-4 inline mr-1 -mt-1" />
          <strong>Tip:</strong> LM1 may produce repetitive output because it
          collapses to a unigram fallback when the 4-gram context is unseen.
          LM2's interpolation always mixes in shorter contexts, which usually
          makes generation more varied.
        </Alert>

        <div className="flex justify-end">
          <Link href="/4gram/report">
            <Button>
              Continue to Report
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
