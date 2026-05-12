// app/explain/page.tsx
// Educational page explaining each concept in plain language.
"use client";

import Link from "next/link";
import {
  BookOpen,
  Type,
  Layers,
  ArrowDownToLine,
  Blend,
  Shield,
  Gauge,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  PageHeader,
  FadeIn,
  Badge,
  Button,
} from "@/components/ui/primitives";

export default function ExplainPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <PageHeader
        title="How NGramLab works"
        description="Each concept used in the pipeline, explained without jargon. Useful before your presentation."
      />

      <FadeIn>
        <div className="grid grid-cols-1 gap-6">
          {/* CORPUS */}
          <Concept
            icon={<BookOpen className="h-5 w-5" />}
            label="01"
            title="What is a corpus?"
            tag="Foundation"
          >
            <p>
              A <strong>corpus</strong> is just a body of text — newspaper
              articles, a novel, Wikipedia pages, tweets, anything written. The
              model learns its statistics: which words appear, and which words
              tend to follow which other words. A bigger and more in-domain
              corpus generally means better predictions.
            </p>
            <p className="text-ink-400">
              In NGramLab you can paste your own text, upload a{" "}
              <code>.txt</code> file, or pick one of four bundled samples
              (Wikipedia-style, news, literature, data-science).
            </p>
          </Concept>

          {/* TOKENIZATION */}
          <Concept
            icon={<Type className="h-5 w-5" />}
            label="02"
            title="What is tokenization?"
            tag="Preprocessing"
          >
            <p>
              Computers don't understand "sentences" — they need a list of
              discrete units called <strong>tokens</strong>. Tokenization is
              the step that turns a raw string into that list.
            </p>
            <Example
              before='"I love NLP."'
              after='["i", "love", "nlp"]'
            />
            <p className="text-ink-400">
              NGramLab additionally inserts sentence-boundary tokens{" "}
              <code className="text-violetx-300">&lt;s&gt;</code> and{" "}
              <code className="text-violetx-300">&lt;/s&gt;</code> at the start
              and end of every sentence so the model can learn how sentences
              tend to begin and end. Rare words that fall outside the
              vocabulary cap are replaced with{" "}
              <code className="text-amber-300">&lt;UNK&gt;</code>.
            </p>
          </Concept>

          {/* N-GRAM */}
          <Concept
            icon={<Layers className="h-5 w-5" />}
            label="03"
            title="What is an n-gram?"
            tag="Core idea"
          >
            <p>
              An <strong>n-gram</strong> is a contiguous sequence of{" "}
              <em>n</em> tokens. We use them to estimate{" "}
              <em>"how likely is this next word given the last few words?"</em>.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <Tile name="unigram" example="['the']" />
              <Tile name="bigram" example="['the','quick']" />
              <Tile name="trigram" example="['the','quick','brown']" />
              <Tile name="4-gram" example="['the','quick','brown','fox']" />
            </div>
            <p className="text-ink-400">
              A 4-gram model conditions on the previous 3 words to predict the
              4th. The probability is estimated by counting:
            </p>
            <Formula>
              P(w₄ | w₁ w₂ w₃) ≈ Count(w₁ w₂ w₃ w₄) / Count(w₁ w₂ w₃)
            </Formula>
          </Concept>

          {/* BACKOFF */}
          <Concept
            icon={<ArrowDownToLine className="h-5 w-5" />}
            label="04"
            title="What is backoff?"
            tag="LM1"
          >
            <p>
              When the 4-gram you need was never seen in training, the
              numerator is zero. <strong>Backoff</strong> says: in that case,
              fall back to a shorter context and use the trigram. If the
              trigram is also unseen, try the bigram. Then the unigram. Then
              give up.
            </p>
            <Formula>4-gram → trigram → bigram → unigram → ε</Formula>
            <p className="text-ink-400">
              LM1 uses backoff with <em>no smoothing</em>. This is simple but
              brittle: a single unseen 4-letter (and shorter) sequence pushes
              the probability to zero and perplexity to infinity.
            </p>
          </Concept>

          {/* INTERPOLATION */}
          <Concept
            icon={<Blend className="h-5 w-5" />}
            label="05"
            title="What is interpolation?"
            tag="LM2"
          >
            <p>
              Instead of picking <em>one</em> order, interpolation{" "}
              <strong>mixes them all</strong> with weights λ that sum to 1:
            </p>
            <Formula>
              P(w | h) = λ₁ · P₁(w) + λ₂ · P₂(w|h) + λ₃ · P₃(w|h) + λ₄ · P₄(w|h)
            </Formula>
            <p className="text-ink-400">
              Heavier weight on the 4-gram trusts long context more; heavier
              weight on the unigram falls back to overall word frequencies.
              Tuning these on a validation set is what the Tuning page does.
            </p>
          </Concept>

          {/* SMOOTHING */}
          <Concept
            icon={<Shield className="h-5 w-5" />}
            label="06"
            title="What is smoothing?"
            tag="Add-k"
          >
            <p>
              Smoothing keeps probabilities away from exactly zero by adding a
              small constant <code>k</code> to every count:
            </p>
            <Formula>P(w | h) = (Count(h, w) + k) / (Count(h) + k · V)</Formula>
            <p className="text-ink-400">
              <code>V</code> is the vocabulary size. Pick <code>k = 1</code> and
              this becomes the classic Laplace (add-one) smoothing.{" "}
              <code>k = 0.1</code> is gentler and usually performs better on
              small corpora. NGramLab applies add-k inside each n-gram term of
              the interpolation, so even unseen 4-grams contribute a non-zero
              probability.
            </p>
          </Concept>

          {/* PERPLEXITY */}
          <Concept
            icon={<Gauge className="h-5 w-5" />}
            label="07"
            title="What is perplexity?"
            tag="Evaluation"
          >
            <p>
              <strong>Perplexity</strong> measures how surprised the model is
              by held-out text. It's defined as the exponential of the
              negative average log-probability:
            </p>
            <Formula>PP(W) = exp( − (1 / N) · Σᵢ log P(wᵢ | context) )</Formula>
            <p className="text-ink-400">
              Lower is better. A perplexity of 50 means the model is roughly
              "as confused as if it had 50 equally likely choices at every
              step". Perplexity blows up if any probability hits zero — which
              is exactly why LM1's number can be ∞ and LM2's stays finite.
            </p>
          </Concept>

          {/* TEMPERATURE & SAMPLING */}
          <Concept
            icon={<Layers className="h-5 w-5" />}
            label="08"
            title="Temperature & sampling"
            tag="Generation"
          >
            <p>
              When generating, we can be deterministic or random:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-ink-300">
              <li>
                <strong>Greedy</strong> — always pick the top word. Predictable
                but repetitive.
              </li>
              <li>
                <strong>Weighted random</strong> — sample proportional to
                probability. More natural variation.
              </li>
              <li>
                <strong>Top-K</strong> — keep only the K most likely words,
                then sample. Cuts off the long tail.
              </li>
            </ul>
            <p className="text-ink-400">
              <strong>Temperature</strong> rescales the distribution before
              sampling. <code>t &lt; 1</code> sharpens (more confident);{" "}
              <code>t &gt; 1</code> flattens (more diverse).
            </p>
          </Concept>
        </div>

        <div className="mt-10 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-sm text-ink-400 hover:text-ink-100"
          >
            ← Back to dashboard
          </Link>
          <Link href="/">
            <Button variant="secondary">
              Back to start
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}

/* ───────────── helpers ───────────── */

function Concept({
  icon,
  label,
  title,
  tag,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-ink-800 bg-ink-950 p-2 text-accent-300">
              {icon}
            </div>
            <div>
              <CardDescription className="text-[10px] tracking-widest uppercase">
                {label}
              </CardDescription>
              <CardTitle className="text-xl">{title}</CardTitle>
            </div>
          </div>
          <Badge variant="default">{tag}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm text-ink-200 leading-relaxed">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function Example({ before, after }: { before: string; after: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1">
      <div className="rounded-md border border-ink-800 bg-ink-950 px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-1">
          Input
        </div>
        <code className="text-ink-100">{before}</code>
      </div>
      <div className="rounded-md border border-ink-800 bg-ink-950 px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-1">
          Output
        </div>
        <code className="text-accent-300">{after}</code>
      </div>
    </div>
  );
}

function Tile({ name, example }: { name: string; example: string }) {
  return (
    <div className="rounded-md border border-ink-800 bg-ink-950 px-2 py-1.5 text-center">
      <div className="text-[10px] uppercase tracking-wider text-ink-500">
        {name}
      </div>
      <code className="text-xs text-violetx-300">{example}</code>
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <pre className="rounded-lg border border-ink-800 bg-ink-950 p-3 text-xs text-accent-200 overflow-x-auto">
      {children}
    </pre>
  );
}
