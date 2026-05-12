// lib/store/experiment.ts
// Single source of truth for the whole experiment across pages.
// Persists to localStorage so users can refresh / navigate freely.

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AllCounts,
  DatasetSplit,
  GenerationStep,
  LambdaWeights,
  ModelResult,
  PreprocessOptions,
  PreprocessResult,
} from "@/types/nlp";
import { DEFAULT_PREPROCESS_OPTIONS } from "@/lib/nlp/preprocess";

// AllCounts contains Maps which don't survive JSON serialization, so we
// keep them out of the persisted snapshot and rebuild on demand from tokens.
interface SerializableState {
  rawText: string;
  preprocessOptions: PreprocessOptions;
  preprocessed: PreprocessResult | null;
  splitRatios: { train: number; validation: number; test: number };
  split: DatasetSplit | null;
  lambdas: LambdaWeights;
  k: number;
  lm1Result: ModelResult | null;
  lm2Result: ModelResult | null;
  bestHyperparameters:
    | { lambdas: LambdaWeights; k: number; perplexity: number }
    | null;
  generatedExamples: string[];
  lastGenerationSteps: GenerationStep[];
  trainedAt: string | null;
}

interface NonSerializableState {
  // Rebuilt from `preprocessed.tokens` + split on demand.
  counts: AllCounts | null;
}

interface Actions {
  setRawText: (s: string) => void;
  setPreprocessOptions: (o: Partial<PreprocessOptions>) => void;
  setPreprocessed: (p: PreprocessResult | null) => void;
  setSplitRatios: (r: {
    train: number;
    validation: number;
    test: number;
  }) => void;
  setSplit: (s: DatasetSplit | null) => void;
  setCounts: (c: AllCounts | null) => void;
  setLambdas: (l: LambdaWeights) => void;
  setK: (k: number) => void;
  setLM1Result: (r: ModelResult | null) => void;
  setLM2Result: (r: ModelResult | null) => void;
  setBestHyperparameters: (
    h: { lambdas: LambdaWeights; k: number; perplexity: number } | null
  ) => void;
  addGeneratedExample: (s: string) => void;
  setLastGenerationSteps: (s: GenerationStep[]) => void;
  setTrainedAt: (s: string | null) => void;
  reset: () => void;
}

type Store = SerializableState & NonSerializableState & Actions;

const initialState: SerializableState & NonSerializableState = {
  rawText: "",
  preprocessOptions: DEFAULT_PREPROCESS_OPTIONS,
  preprocessed: null,
  splitRatios: { train: 0.7, validation: 0.1, test: 0.2 },
  split: null,
  counts: null,
  lambdas: { unigram: 0.05, bigram: 0.15, trigram: 0.3, fourgram: 0.5 },
  k: 0.1,
  lm1Result: null,
  lm2Result: null,
  bestHyperparameters: null,
  generatedExamples: [],
  lastGenerationSteps: [],
  trainedAt: null,
};

function clearDerivedState() {
  return {
    preprocessed: null,
    split: null,
    counts: null,
    lm1Result: null,
    lm2Result: null,
    bestHyperparameters: null,
    generatedExamples: [],
    lastGenerationSteps: [],
    trainedAt: null,
  };
}

export const useExperiment = create<Store>()(
  persist(
    (set) => ({
      ...initialState,
      setRawText: (s) =>
        set((st) =>
          st.rawText === s ? { rawText: s } : { rawText: s, ...clearDerivedState() }
        ),
      setPreprocessOptions: (o) =>
        set((st) => ({ preprocessOptions: { ...st.preprocessOptions, ...o } })),
      setPreprocessed: (p) => set({ preprocessed: p }),
      setSplitRatios: (r) => set({ splitRatios: r }),
      setSplit: (s) => set({ split: s }),
      setCounts: (c) => set({ counts: c }),
      setLambdas: (l) => set({ lambdas: l }),
      setK: (k) => set({ k }),
      setLM1Result: (r) => set({ lm1Result: r }),
      setLM2Result: (r) => set({ lm2Result: r }),
      setBestHyperparameters: (h) => set({ bestHyperparameters: h }),
      addGeneratedExample: (s) =>
        set((st) => ({
          generatedExamples: [s, ...st.generatedExamples].slice(0, 10),
        })),
      setLastGenerationSteps: (s) => set({ lastGenerationSteps: s }),
      setTrainedAt: (s) => set({ trainedAt: s }),
      reset: () => set(initialState),
    }),
    {
      name: "ngramlab-experiment",
      storage: createJSONStorage(() => localStorage),
      // Only persist serializable fields. counts is recomputed on demand.
      partialize: (state) => {
        const { counts, ...rest } = state as Store;
        return rest;
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<Store> | undefined;
        const merged = { ...currentState, ...persisted };

        if (!merged.rawText?.trim()) {
          return { ...merged, ...clearDerivedState() };
        }

        return merged;
      },
    }
  )
);
