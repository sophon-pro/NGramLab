// app/corpus/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  ClipboardPaste,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
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
  Stat,
  Badge,
  FadeIn,
} from "@/components/ui/primitives";
import { useExperiment } from "@/lib/store/experiment";
import { SAMPLE_CORPORA } from "@/lib/sample-corpus";
import { rawCorpusStats } from "@/lib/nlp/preprocess";
import { cn, formatNumber } from "@/lib/utils";

type Mode = "sample" | "paste" | "upload";

export default function CorpusPage() {
  const { rawText, setRawText } = useExperiment();
  const [mode, setMode] = useState<Mode>("sample");
  const [selectedSample, setSelectedSample] = useState<string>(SAMPLE_CORPORA[0].id);
  const [hydrated, setHydrated] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setHydrated(true), []);

  // If the user is on the "sample" tab and no text is loaded, pre-load one
  // so the preview is never empty on first visit.
  useEffect(() => {
    if (!hydrated) return;
    if (mode === "sample" && rawText.trim().length === 0) {
      const sample = SAMPLE_CORPORA.find((c) => c.id === selectedSample);
      if (sample) setRawText(sample.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, mode]);

  const stats = rawCorpusStats(rawText || "");

  function loadSample(id: string) {
    setSelectedSample(id);
    const sample = SAMPLE_CORPORA.find((c) => c.id === id);
    if (sample) setRawText(sample.text);
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setRawText(String(reader.result ?? ""));
    reader.readAsText(f);
  }

  // Validation flags
  const tooShort = stats.words < 100;
  const tooFewVocab = stats.uniqueWords < 30;
  const noisy =
    rawText.length > 0 && rawText.replace(/[^\p{L}\p{N}\s]/gu, "").length / rawText.length < 0.6;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Corpus"
        description="Pick a sample, paste your own text, or upload a .txt file. The whole pipeline runs against whatever you load here."
        step={{ current: 1, total: 8 }}
      >
        <Link href="/preprocessing">
          <Button>
            Next: Preprocess <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: source picker */}
        <FadeIn className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Choose a source</CardTitle>
              <CardDescription>
                Three ways in. Switching tabs preserves the underlying text.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { id: "sample", label: "Sample", icon: Sparkles },
                  { id: "paste", label: "Paste", icon: ClipboardPaste },
                  { id: "upload", label: "Upload", icon: Upload },
                ].map((t) => {
                  const Icon = t.icon;
                  const active = mode === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setMode(t.id as Mode)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                        active
                          ? "border-accent-400 bg-accent-400/10 text-accent-700 dark:text-accent-300"
                          : "border-ink-200 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-800/40"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {mode === "sample" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SAMPLE_CORPORA.map((c) => {
                      const active = selectedSample === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => loadSample(c.id)}
                          className={cn(
                            "text-left rounded-xl border p-4 transition-all",
                            active
                              ? "border-accent-400 bg-accent-400/5 shadow-glow"
                              : "border-ink-200 dark:border-ink-800 hover:border-ink-300 dark:hover:border-ink-700"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-display font-semibold">
                              {c.name}
                            </div>
                            {active && (
                              <CheckCircle2 className="h-4 w-4 text-accent-500" />
                            )}
                          </div>
                          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
                            {c.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {mode === "paste" && (
                <textarea
                  className="w-full min-h-[200px] rounded-lg border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 p-3 text-sm font-mono scrollbar-thin focus:outline-none focus:ring-2 focus:ring-accent-400"
                  placeholder="Paste your corpus text here. At least a couple of paragraphs works best."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              )}

              {mode === "upload" && (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-ink-200 dark:border-ink-800 p-10 text-center cursor-pointer hover:border-accent-400 hover:bg-accent-400/5 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto text-ink-400" />
                  <p className="mt-3 text-sm font-medium">
                    Click to upload a .txt file
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
                    Plain text only · up to ~5 MB
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,text/plain"
                    className="hidden"
                    onChange={onFileChosen}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Raw text preview</CardTitle>
              <CardDescription>
                First few hundred characters — exactly what the preprocessor will see.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-ink-50 dark:bg-ink-950 ring-1 ring-inset ring-ink-200/60 dark:ring-ink-800/80 p-4 text-sm font-mono scrollbar-thin max-h-72 overflow-auto whitespace-pre-wrap">
                {rawText || (
                  <span className="text-ink-400">— no text loaded —</span>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Right: stats + warnings */}
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>
                Computed live from the raw text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Stat label="Characters" value={formatNumber(stats.characters)} />
              <Stat label="Words (whitespace)" value={formatNumber(stats.words)} />
              <Stat label="Sentences" value={formatNumber(stats.sentences)} />
              <Stat
                label="Estimated vocabulary"
                value={formatNumber(stats.uniqueWords)}
                sublabel="Before any cleaning or limiting"
                accent
              />
            </CardContent>
          </Card>

          <div className="mt-4 space-y-3">
            {tooShort && (
              <Alert variant="warn">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                The corpus is quite short ({stats.words} words). 4-grams need
                at least a few hundred words to be meaningful.
              </Alert>
            )}
            {tooFewVocab && stats.words > 0 && (
              <Alert variant="warn">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Vocabulary looks very small ({stats.uniqueWords} unique words).
                Generation may sound repetitive.
              </Alert>
            )}
            {noisy && (
              <Alert variant="warn">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Lots of non-alphanumeric symbols detected. Consider enabling
                "remove punctuation" on the preprocessing page.
              </Alert>
            )}
            {!tooShort && !tooFewVocab && rawText.length > 0 && (
              <Alert variant="success">
                <CheckCircle2 className="inline h-4 w-4 mr-1" />
                Corpus looks healthy — proceed to preprocessing.
              </Alert>
            )}
            <Badge variant="default" className="w-full justify-center">
              <FileText className="h-3 w-3" /> Stored locally · never uploaded
            </Badge>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
