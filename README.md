# NLPLearningLab

Browser-based NLP learning site with a method catalog and an interactive 4-gram
language model demo.

Live site:

https://sophon-pro.github.io/NLPLearningLab/

Repository:

https://github.com/sophon-pro/NLPLearningLab

## Overview

NLPLearningLab is a static Next.js app for learning natural language processing
methods through concise explanations and interactive browser demos. The main site
introduces a catalog of NLP methods, while the current completed demo,
NGramLab, focuses on classical 4-gram language modeling.

The 4-gram demo runs fully in the browser. It lets users load text, preprocess
tokens, split data, train two language models, tune smoothing settings, evaluate
perplexity, generate text, and export a report.

## Current Demo

NGramLab compares two 4-gram language models:

- LM1 Backoff: falls back from 4-gram to trigram, bigram, and unigram counts.
- LM2 Interpolation + Add-k: mixes all n-gram orders with add-k smoothing.

The demo is designed for transparent learning rather than production NLP. Users
can inspect corpus size, token counts, vocabulary size, n-gram frequencies,
smoothing settings, perplexity, and generation traces.

## Features

- Main NLPLearningLab landing page and About Project page
- NLP Method Catalog with 12 method cards
- In-page methodology preview modal for available demos
- Disabled Learn More actions for coming-soon methods
- Direct Start Demo flow into the namespaced `/4gram/corpus/` workflow
- Corpus input by paste, file upload, sample corpus, or website text extraction
- Preprocessing controls for lowercasing, punctuation, sentence boundaries, and vocabulary cap
- Train / validation / test split controls
- N-gram count tables for unigram through 4-gram orders
- Hyperparameter tuning for interpolation weights and add-k smoothing
- Perplexity evaluation for both models
- Text generation with greedy, weighted, and top-k sampling
- Academic report export as Markdown or JSON
- Client-side state persistence with localStorage

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React
- Zustand

All NLP logic is implemented in TypeScript under `lib/nlp/`. There is no Python
backend, API key, database, or server dependency.

## Run Locally

Requires Node.js 18.17 or later.

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

To test the production static export:

```bash
npm run build
```

The exported site is written to `out/`.

## GitHub Pages Configuration

This repo is configured for GitHub Pages at:

```text
https://sophon-pro.github.io/NLPLearningLab/
```

Important settings:

```js
// next.config.js
output: "export"
basePath: "/NLPLearningLab"
images: { unoptimized: true }
trailingSlash: true
```

The included workflow at `.github/workflows/deploy.yml` builds the static export
and deploys the `out/` directory with GitHub Pages.

After pushing to `main`, make sure the repository's Pages settings use:

- Source: GitHub Actions
- Branch: not required when using the workflow

## Project Structure

```text
app/
  about/              Main-site About Project page
  methods/            NLP method catalog and 4-gram intro page
  4gram/              Public NGramLab workflow routes
  corpus/             Workflow step 1
  preprocessing/      Workflow step 2
  split/              Workflow step 3
  training/           Workflow step 4
  tuning/             Workflow step 5
  evaluation/         Workflow step 6
  generator/          Workflow step 7
  report/             Workflow step 8
  explain/            NGramLab methodology page

components/
  layout/             Navbar, sidebar, footer, shell, theme controls
  methods/            Method catalog, filters, cards, comparison, learning path
  ui/                 Shared UI primitives

data/
  methods.ts          Method catalog data

lib/
  nlp/                Tokenization, counts, smoothing, perplexity, generation
  store/              Zustand experiment state
  report.ts           Report builder and Markdown serializer
  sample-corpus.ts    Bundled sample corpora

types/
  nlp.ts              Shared NLP types
```

## Scripts

```bash
npm run dev      # start local dev server
npm run build    # create static export in out/
npm run start    # start Next production server
npm run lint     # run Next lint, if available in the local Next setup
```

## License

MIT
