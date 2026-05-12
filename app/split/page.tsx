// app/split/page.tsx
"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Scissors } from "lucide-react";
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
  FadeIn,
  Badge,
} from "@/components/ui/primitives";
import { useExperiment } from "@/lib/store/experiment";
import { splitDataset } from "@/lib/nlp/split";
import { formatNumber } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#22d3ee", "#a78bfa", "#34d399"];

export default function SplitPage() {
  const {
    preprocessed,
    splitRatios,
    setSplitRatios,
    split,
    setSplit,
  } = useExperiment();

  const total = splitRatios.train + splitRatios.validation + splitRatios.test;
  const valid = Math.abs(total - 1) < 0.005;

  // Apply split whenever ratios or tokens change AND ratios are valid.
  useEffect(() => {
    if (!preprocessed || !valid) {
      if (!preprocessed) setSplit(null);
      return;
    }
    try {
      const r = splitDataset(
        preprocessed.tokens,
        splitRatios.train,
        splitRatios.validation,
        splitRatios.test
      );
      setSplit(r);
    } catch {
      // fall through silently — UI shows the validation error
    }
  }, [preprocessed, splitRatios, valid, setSplit]);

  const chartData = useMemo(
    () => [
      { name: "Training", value: Math.round(splitRatios.train * 100) },
      { name: "Validation", value: Math.round(splitRatios.validation * 100) },
      { name: "Test", value: Math.round(splitRatios.test * 100) },
    ],
    [splitRatios]
  );

  const noPreprocess = !preprocessed;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Dataset split"
        description="Reserve a slice of the token stream for validation (tuning) and testing (final evaluation)."
        step={{ current: 3, total: 8 }}
      >
        <Button
          variant="outline"
          onClick={() => setSplitRatios({ train: 0.7, validation: 0.1, test: 0.2 })}
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        <Link href="/4gram/training">
          <Button disabled={!split}>
            Next: Train <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      {noPreprocess && (
        <Alert variant="warn" className="mb-6">
          You need to preprocess the corpus before splitting it.{" "}
          <Link href="/4gram/preprocessing" className="underline">Go to preprocessing.</Link>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeIn className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ratios</CardTitle>
              <CardDescription>
                Sliders must sum to 100%. The default is the conventional 70 / 10 / 20.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {(["train", "validation", "test"] as const).map((k, idx) => (
                <div key={k}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium capitalize">{k}</span>
                    <span className="font-mono text-xs tabular-nums">
                      {Math.round(splitRatios[k] * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={splitRatios[k]}
                    onChange={(e) =>
                      setSplitRatios({
                        ...splitRatios,
                        [k]: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                    style={{ accentColor: COLORS[idx] }}
                  />
                </div>
              ))}

              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500 dark:text-ink-400">Total</span>
                <Badge variant={valid ? "success" : "danger"}>
                  {Math.round(total * 100)}%
                </Badge>
              </div>
              {!valid && (
                <Alert variant="danger">
                  Ratios must sum to 100%. Adjust the sliders.
                </Alert>
              )}
            </CardContent>
          </Card>

          {split && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <Stat label="Train tokens" value={formatNumber(split.train.length)} accent />
              <Stat label="Validation tokens" value={formatNumber(split.validation.length)} />
              <Stat label="Test tokens" value={formatNumber(split.test.length)} />
            </div>
          )}

          {split && (
            <Card className="hidden">
              <CardHeader>
                <CardTitle>Preview each split</CardTitle>
                <CardDescription>
                  First few tokens of each portion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(["train", "validation", "test"] as const).map((k, idx) => (
                  <div key={k} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: COLORS[idx] }}
                      />
                      <span className="text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400 font-medium">
                        {k} · {split[k].length.toLocaleString()} tokens
                      </span>
                    </div>
                    <div className="rounded-md bg-ink-50 dark:bg-ink-950 ring-1 ring-inset ring-ink-200/60 dark:ring-ink-800/80 p-2 font-mono text-xs scrollbar-thin overflow-x-auto whitespace-nowrap">
                      {split[k].slice(0, 40).join(" ") || (
                        <span className="text-ink-400">— empty —</span>
                      )}
                      {split[k].length > 40 && (
                        <span className="text-ink-400"> …</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </FadeIn>

        {/* Chart */}
        <FadeIn delay={0.1} className="h-full">
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>Distribution</CardTitle>
              <CardDescription>How tokens are allocated.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid rgba(0,0,0,.08)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1 text-center text-xs">
                {chartData.map((d, i) => (
                  <div key={d.name}>
                    <div
                      className="inline-block h-2 w-2 rounded-full mr-1 align-middle"
                      style={{ background: COLORS[i] }}
                    />
                    {d.name}
                  </div>
                ))}
              </div>
              <div className="mt-auto rounded-lg border border-accent-400/30 bg-accent-400/10 px-3 py-2 text-xs leading-relaxed text-accent-800 dark:text-accent-200">
                <strong>Tip:</strong> The split uses contiguous token slices:
                train first, validation next, test last.
              </div>
            </CardContent>
          </Card>

          <Alert
            variant="info"
            className="hidden"
          >
            The split is taken as <strong>contiguous slices</strong> of the
            token stream — train is the prefix, then validation, then test.
            This preserves sentence-level coherence and matches what the
            project rubric expects.
          </Alert>
        </FadeIn>

        {split && (
          <FadeIn className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Preview each split</CardTitle>
                <CardDescription>
                  First few tokens of each portion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  {(["train", "validation", "test"] as const).map((k, idx) => (
                    <div
                      key={k}
                      className="flex min-h-[200px] flex-col rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-950/40"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: COLORS[idx] }}
                        />
                        <span className="text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-ink-400">
                          {k} · {split[k].length.toLocaleString()} tokens
                        </span>
                      </div>
                      <div className="flex-1 whitespace-normal break-words rounded-md bg-ink-50 p-3 font-mono text-xs leading-relaxed ring-1 ring-inset ring-ink-200/60 dark:bg-ink-950 dark:ring-ink-800/80">
                        {split[k].slice(0, 40).join(" ") || (
                          <span className="text-ink-400">— empty —</span>
                        )}
                        {split[k].length > 40 && (
                          <span className="text-ink-400"> …</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
