"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  GraduationCap,
  LayoutGrid,
  Microscope,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FadeIn,
  PageHeader,
} from "@/components/ui/primitives";

const PRINCIPLES = [
  {
    title: "Concept First",
    text: "Each topic starts with the core idea, the assumptions behind it, and the questions it helps answer.",
    icon: BookMarked,
  },
  {
    title: "Interactive Practice",
    text: "Demos turn abstract NLP methods into visible experiments that can be adjusted, compared, and repeated.",
    icon: Microscope,
  },
  {
    title: "Method Library",
    text: "The project groups statistical, vector-space, embedding, neural, transformer, and retrieval methods in one learning path.",
    icon: LayoutGrid,
  },
  {
    title: "Learning Support",
    text: "Pages are written for study, classroom discussion, demonstration, and project-based exploration.",
    icon: GraduationCap,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="About NLPLearningLab"
        description="NLPLearningLab is a browser-based learning space for exploring NLP methods through clear, interactive demos."
      >
        <Link href="/methods">
          <Button>
            Explore Methods <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      <FadeIn>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <Badge variant="accent" className="w-fit">
                Project Overview
              </Badge>
              <CardTitle className="mt-3 text-2xl">
                Learn NLP through visible, step-by-step experiments.
              </CardTitle>
              <CardDescription>
                The project is designed for students and developers who want to
                understand NLP methods before moving into larger frameworks,
                neural networks, and transformer-based systems.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-ink-700 dark:text-ink-300">
              <p>
                NLPLearningLab organizes NLP methods into a method explorer,
                then connects each available method to an interactive demo. The
                first complete demo is the 4-Gram lab, which shows tokenization,
                n-gram counting, smoothing, perplexity, and text generation.
              </p>
              <p>
                Everything runs in the browser. There is no backend dependency,
                no API key, and no hidden training service. The goal is to make
                each step visible enough for learning, presentation, and clean
                academic reporting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Scope</CardTitle>
              <CardDescription>
                NLPLearningLab is the main learning site, not one individual
                method demo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-ink-700 dark:text-ink-300">
              <p>
                The site acts as an entry point for multiple NLP topics. Some
                methods include hands-on labs, while others provide concise
                explanations and a clear path for future interactive demos.
              </p>
              <p>
                Individual demos can have their own workflow, metrics, and
                reports. The About Project page stays focused on the broader
                educational platform.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="font-display text-2xl font-semibold">
              Learning Principles
            </h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              The main site is organized around reusable learning goals.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="h-full">
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-400/30 bg-accent-400/10 text-accent-700 dark:text-accent-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-300">
                      {item.text}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>What Users Can Explore</CardTitle>
              <CardDescription>
                NLPLearningLab presents NLP as a connected set of methods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm text-ink-700 dark:text-ink-300 sm:grid-cols-2">
                {[
                  "statistical language models",
                  "vector-space methods",
                  "embedding models",
                  "neural language models",
                  "transformer concepts",
                  "retrieval-based systems",
                  "method comparisons",
                  "interactive learning demos",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Who It Is For</CardTitle>
              <CardDescription>
                Built as a compact educational site for NLP fundamentals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-ink-700 dark:text-ink-300">
              <p>
                Students can use it to understand NLP concepts without
                installing a heavy ML framework.
              </p>
              <p>
                Developers can use it as a readable reference for method
                inspection, concept review, and browser-friendly NLP
                experimentation.
              </p>
            </CardContent>
          </Card>
        </section>
      </FadeIn>
    </div>
  );
}
