// app/corpus/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  ClipboardPaste,
  Sparkles,
  Globe2,
  Loader2,
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

type Mode = "sample" | "paste" | "upload" | "website";

export default function CorpusPage() {
  const { rawText, setRawText } = useExperiment();
  const [mode, setMode] = useState<Mode>("sample");
  const [selectedSample, setSelectedSample] = useState<string>(SAMPLE_CORPORA[0].id);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteStatus, setWebsiteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [websiteMessage, setWebsiteMessage] = useState("");
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

  function normalizeWebsiteUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) throw new Error("Enter a website URL first.");
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Only http and https URLs are supported.");
    }
    return parsed.toString();
  }

  function extractParagraphTextFromHtml(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script, style, noscript, template").forEach((el) => {
      el.remove();
    });

    return Array.from(doc.querySelectorAll("p"))
      .map((p) => p.textContent?.trim() ?? "")
      .filter(Boolean)
      .join(" ");
  }

  function cleanWebsiteText(text: string) {
    return text
      .replace(/\[[^\]]*\]/g, " ")
      .toLowerCase()
      .replace(/[^a-z0-9\s.]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isHtmlResponse(text: string, contentType: string | null) {
    return (
      contentType?.toLowerCase().includes("text/html") ||
      /^\s*(?:<!doctype\s+html|<html[\s>]|<body[\s>]|<p[\s>])/i.test(text)
    );
  }

  async function loadWebsiteText(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setWebsiteStatus("loading");
    setWebsiteMessage("");

    try {
      const normalizedUrl = normalizeWebsiteUrl(websiteUrl);
      let response: Response;

      try {
        response = await fetch(normalizedUrl);
      } catch {
        const readerUrl = `https://r.jina.ai/${normalizedUrl}`;
        response = await fetch(readerUrl, {
          headers: {
            "x-respond-with": "text",
          },
        });
      }

      if (!response.ok) {
        throw new Error(`Text extraction failed (${response.status}).`);
      }

      const rawText = await response.text();
      const sourceText = isHtmlResponse(rawText, response.headers.get("content-type"))
        ? extractParagraphTextFromHtml(rawText)
        : rawText;
      const text = cleanWebsiteText(sourceText);

      if (text.length < 80) {
        throw new Error("The page did not return enough readable text.");
      }

      setRawText(text);
      setWebsiteUrl(normalizedUrl);
      setWebsiteStatus("success");
      setWebsiteMessage(`Extracted ${formatNumber(text.length)} characters from the page.`);
    } catch (err) {
      setWebsiteStatus("error");
      setWebsiteMessage(
        err instanceof Error
          ? err.message
          : "Unable to extract text from that website."
      );
    }
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
        description="Pick a sample, paste text, upload a .txt file, or extract readable text from a website URL."
        step={{ current: 1, total: 8 }}
      >
        <Link href="/4gram/preprocessing">
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
                Switching tabs preserves the underlying text.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { id: "sample", label: "Sample", icon: Sparkles },
                  { id: "paste", label: "Paste", icon: ClipboardPaste },
                  { id: "upload", label: "Upload", icon: Upload },
                  { id: "website", label: "Website", icon: Globe2 },
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

              {mode === "website" && (
                <div className="space-y-3">
                  <form onSubmit={loadWebsiteText} className="space-y-3">
                    <div>
                      <label
                        htmlFor="website-url"
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-ink-400"
                      >
                        Website URL
                      </label>
                      <input
                        id="website-url"
                        type="text"
                        inputMode="url"
                        value={websiteUrl}
                        onChange={(e) => {
                          setWebsiteUrl(e.target.value);
                          setWebsiteStatus("idle");
                          setWebsiteMessage("");
                        }}
                        placeholder="https://example.com/article"
                        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-400 dark:border-ink-800 dark:bg-ink-950 dark:text-ink-100"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="submit"
                        disabled={websiteStatus === "loading"}
                      >
                        {websiteStatus === "loading" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Globe2 className="h-4 w-4" />
                        )}
                        Extract text
                      </Button>
                      <span className="text-xs text-ink-500 dark:text-ink-400">
                        Best for article-style pages and documentation.
                      </span>
                    </div>
                  </form>

                  {websiteStatus === "success" && (
                    <Alert variant="success">
                      <CheckCircle2 className="inline h-4 w-4 mr-1" />
                      {websiteMessage}
                    </Alert>
                  )}

                  {websiteStatus === "error" && (
                    <Alert variant="danger">
                      <AlertTriangle className="inline h-4 w-4 mr-1" />
                      {websiteMessage}
                    </Alert>
                  )}

                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    Website extraction sends the URL to Jina Reader and stores
                    only the extracted text in this browser.
                  </p>
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
              <FileText className="h-3 w-3" /> Corpus text stored locally
            </Badge>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
