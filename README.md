# NGramLab

**Interactive 4-Gram Language Model and Text Generation Demo**

NGramLab is a fully browser-based web app that demonstrates two classical 4-gram
language models — **backoff** and **linear interpolation with add-k smoothing** —
end-to-end, from raw text all the way to perplexity evaluation and live text
generation. Built as M-DAS Mini Project 1 (Text Generation).

Everything runs client-side in TypeScript: there is no Python backend, no API
call, no server. That means it deploys for free to GitHub Pages, Vercel,
Netlify, or any static host.

---

## ✨ Features

- **Corpus input** — paste text, upload a `.txt` file, or choose one of four
  bundled sample corpora (Wikipedia-style, news, literature, data-science).
- **Preprocessing controls** — lowercase, whitespace collapse, punctuation
  policy, sentence boundary tokens `<s>` / `</s>`, vocabulary cap with `<UNK>`
  substitution, and live token-stream visualization.
- **Dataset split** — interactive train / validation / test sliders with a live
  pie chart and per-split previews.
- **N-gram training** — counts for unigrams, bigrams, trigrams and 4-grams with
  searchable top-N tables.
- **LM1: Backoff** — unsmoothed 4-gram → trigram → bigram → unigram fallback.
- **LM2: Interpolation + Add-k** — λ-weighted mix of all four orders, each term
  using add-k smoothing.
- **Hyperparameter tuning** — automated 20-config sweep (4 λ presets × 5 k
  values) on the validation set with a sortable result table and best-config
  badge.
- **Evaluation** — test-set perplexity for both models, side-by-side bar chart,
  and a plain-language interpretation of why one wins.
- **Text generator** — greedy, weighted, and top-K sampling with temperature
  control plus a full step-by-step generation trace.
- **Dashboard** — summary stats, top tokens, split, and perplexity charts.
- **Auto report** — generates a clean academic markdown report. Export as `.md`,
  `.json`, copy to clipboard, or print as PDF.
- **Methodology explainer** — every concept used in the pipeline, in plain
  English, with formulas.
- **State persistence** — your experiment survives page navigation and refresh
  via `localStorage`.

---

## 🧠 NLP Methodology

### LM1 — Backoff 4-gram

For a 4-gram context `wᵢ₋₃ wᵢ₋₂ wᵢ₋₁ → wᵢ`, compute:

```
P(wᵢ | wᵢ₋₃ wᵢ₋₂ wᵢ₋₁)
= 4-gram MLE         if Count(wᵢ₋₃ wᵢ₋₂ wᵢ₋₁) > 0
  trigram MLE        else if Count(wᵢ₋₂ wᵢ₋₁) > 0
  bigram MLE         else if Count(wᵢ₋₁) > 0
  unigram MLE        else
  ε (1e-10)          if everything is unseen
```

No smoothing. Simple. Can produce ∞ perplexity if an unseen 4-gram has unseen
shorter contexts too.

### LM2 — Linear Interpolation with Add-k

Mix all four orders with weights that sum to 1, smoothing each term:

```
P(wᵢ | h) = λ₁·P̂₁(wᵢ) + λ₂·P̂₂(wᵢ|h₂) + λ₃·P̂₃(wᵢ|h₃) + λ₄·P̂₄(wᵢ|h₄)

where  P̂_n(w | h) = (Count(h, w) + k) / (Count(h) + k · |V|)
```

Default values: `λ = [0.05, 0.15, 0.30, 0.50]`, `k = 0.1`. The Tuning page
sweeps `k ∈ {0.01, 0.05, 0.1, 0.5, 1.0}` over four λ presets and picks the
configuration with the lowest validation perplexity.

### Perplexity

```
PP(W) = exp( − (1 / N) · Σᵢ log P(wᵢ | context) )
```

Accumulated in log-space with a floor of `log(1e-22) ≈ −50` to keep things
numerically sane.

---

## 🛠 Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** with a custom palette
- **Framer Motion** for fade-ins
- **Recharts** for all charts
- **Lucide React** for icons
- **Zustand** (with `persist`) for state

All NLP logic is in plain TypeScript under `lib/nlp/` — zero external NLP
dependencies.

---

## 🚀 Run locally

Requires Node.js 18.17 or later.

```bash
# 1. install
npm install

# 2. dev server
npm run dev
# → open http://localhost:3000

# 3. production build
npm run build
npm run start
```

---

## ☁️ Deploy

### Option 1 — Vercel (recommended, zero-config)

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → "Add New Project" → import the repo.
3. Accept defaults. Vercel detects Next.js automatically.
4. Done — every push deploys.

### Option 2 — GitHub Pages (static export)

Open `next.config.js` and uncomment the three lines marked for GitHub Pages:

```js
// output: "export",
// basePath: "/ngramlab",
// images: { unoptimized: true },
```

Then:

```bash
npm run build
# produces /out — push the contents to the gh-pages branch
```

Note: a few Next.js features (Image optimization, on-demand revalidation) are
unavailable under `output: "export"`, but NGramLab doesn't use them.

### Option 3 — Netlify, Cloudflare Pages, etc.

Build command `npm run build`, publish directory `.next` (or `out/` if you
enabled static export).

---

## 📁 Project structure

```
ngramlab/
├── app/                       # Next.js App Router pages
│   ├── page.tsx               # Home
│   ├── corpus/                # 1. Corpus input
│   ├── preprocessing/         # 2. Tokenization & vocab
│   ├── split/                 # 3. Train/val/test
│   ├── training/              # 4. N-gram counts + train both models
│   ├── tuning/                # 5. λ / k sweep (LM2)
│   ├── evaluation/            # 6. Test-set perplexity comparison
│   ├── generator/             # 7. Interactive text generation
│   ├── dashboard/             #    Summary view
│   ├── report/                # 8. Auto-generated markdown report
│   └── explain/               #    Methodology explainer
│
├── components/
│   ├── layout/                # Navbar, Footer, ThemeToggle, ThemeScript
│   └── ui/                    # Card, Button, Badge, Alert, Stat, FadeIn…
│
├── lib/
│   ├── nlp/
│   │   ├── preprocess.ts      # Tokenization, sentence boundaries, UNK
│   │   ├── split.ts           # Dataset partitioning
│   │   ├── ngrams.ts          # Unigram → 4-gram counters + context counts
│   │   ├── smoothing.ts       # Add-k
│   │   ├── backoff.ts         # LM1 probability
│   │   ├── interpolation.ts   # LM2 probability + λ helpers
│   │   ├── perplexity.ts      # Log-space PP for both models
│   │   └── generator.ts       # Greedy / weighted / top-K sampling
│   ├── store/
│   │   └── experiment.ts      # Zustand store with localStorage persist
│   ├── sample-corpus.ts       # 4 bundled corpora
│   ├── report.ts              # buildReport + markdown serializer
│   └── utils.ts
│
├── types/
│   └── nlp.ts                 # Shared TypeScript types
│
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 🧭 How to use

The intended flow is left-to-right through the navigation:

1. **Corpus** — pick or paste your text.
2. **Preprocess** — tokenize, set vocabulary size.
3. **Split** — choose train / validation / test ratios.
4. **Train** — count n-grams, train LM1 and LM2.
5. **Tune** — sweep λ and k on the validation set, apply the winner.
6. **Evaluate** — compare both models on the held-out test set.
7. **Generate** — produce text with either model.
8. **Report** — export a markdown or JSON summary.

Use the **Dashboard** as a live overview at any time, and the **Explain** page
to refresh on the underlying concepts before presenting.

---

## ⚠️ Known limitations

- The corpus must fit in memory (browser tab). Tested comfortably up to ~50k
  tokens; very large texts will slow down generation because every step scores
  the full vocabulary.
- Text generation is O(|V|) per step. Tighten the vocabulary cap or use Top-K
  sampling to speed it up.
- Tokenization is intentionally simple (Unicode word boundaries). No
  subword/BPE.
- LM1 has no smoothing — that's the pedagogical point, but it means perplexity
  may legitimately be `∞` on a small corpus.

---

## 🔮 Future improvements

- Support for larger corpora via streaming counts.
- BPE / WordPiece tokenization.
- Side-by-side comparison with a small RNN or Transformer.
- Sentence-level perplexity breakdowns.
- Word cloud and Markov-chain transition visualisation.
- Save/load trained models as `.json`.
- Multi-language support (the regex tokenizer already handles Unicode).

---

## 📜 License

MIT.
