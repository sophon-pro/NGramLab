export type MethodDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type MethodStatus = "Interactive Demo Available" | "Coming Soon";

export type MethodCategory =
  | "Statistical Language Model"
  | "Vector Space Model"
  | "Embedding Model"
  | "Neural Language Model"
  | "Transformer Model"
  | "Retrieval-Based Model";

export type NlpMethod = {
  id: string;
  name: string;
  slug: string;
  category: MethodCategory;
  difficulty: MethodDifficulty;
  status: MethodStatus;
  description: string;
  inspectItems: string[];
  route?: string;
  featured?: boolean;
};

export const METHOD_CATEGORIES: MethodCategory[] = [
  "Statistical Language Model",
  "Vector Space Model",
  "Embedding Model",
  "Neural Language Model",
  "Transformer Model",
  "Retrieval-Based Model",
];

export const METHOD_DIFFICULTIES: MethodDifficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export const METHOD_STATUSES: MethodStatus[] = [
  "Interactive Demo Available",
  "Coming Soon",
];

export const NLP_METHODS: NlpMethod[] = [
  {
    id: "4gram",
    name: "4-Gram Language Model",
    slug: "4gram",
    category: "Statistical Language Model",
    difficulty: "Beginner",
    status: "Interactive Demo Available",
    description: "Predicts the next word from the previous three words.",
    inspectItems: [
      "token counts",
      "vocabulary size",
      "n-gram frequency",
      "smoothing",
      "perplexity",
      "generated text trace",
    ],
    route: "/methods/4gram",
    featured: true,
  },
  {
    id: "bigram",
    name: "Bigram Language Model",
    slug: "bigram",
    category: "Statistical Language Model",
    difficulty: "Beginner",
    status: "Coming Soon",
    description: "Predicts the next word using only one previous word.",
    inspectItems: ["bigram counts", "transition probability", "generated sequence"],
  },
  {
    id: "trigram",
    name: "Trigram Language Model",
    slug: "trigram",
    category: "Statistical Language Model",
    difficulty: "Beginner",
    status: "Coming Soon",
    description: "Predicts the next word using two previous words.",
    inspectItems: ["trigram counts", "conditional probability", "generation trace"],
  },
  {
    id: "markov-chain",
    name: "Markov Chain Text Generator",
    slug: "markov-chain",
    category: "Statistical Language Model",
    difficulty: "Beginner",
    status: "Coming Soon",
    description:
      "Generates text by moving from one state to another based on learned probabilities.",
    inspectItems: ["state transition table", "probability graph", "generated path"],
  },
  {
    id: "tfidf",
    name: "TF-IDF",
    slug: "tfidf",
    category: "Vector Space Model",
    difficulty: "Beginner",
    status: "Coming Soon",
    description: "Measures how important a word is inside a document collection.",
    inspectItems: ["term frequency", "inverse document frequency", "document score table"],
  },
  {
    id: "word2vec",
    name: "Word2Vec",
    slug: "word2vec",
    category: "Embedding Model",
    difficulty: "Intermediate",
    status: "Coming Soon",
    description:
      "Learns word meaning by placing similar words close together in vector space.",
    inspectItems: ["word vectors", "nearest words", "similarity score"],
  },
  {
    id: "rnn",
    name: "RNN Language Model",
    slug: "rnn",
    category: "Neural Language Model",
    difficulty: "Intermediate",
    status: "Coming Soon",
    description: "Processes text step by step using hidden states.",
    inspectItems: ["hidden state flow", "sequence prediction", "training loss"],
  },
  {
    id: "lstm",
    name: "LSTM Language Model",
    slug: "lstm",
    category: "Neural Language Model",
    difficulty: "Intermediate",
    status: "Coming Soon",
    description:
      "Improves RNNs by remembering useful information over longer sequences.",
    inspectItems: ["memory cell", "gates", "sequence prediction"],
  },
  {
    id: "seq2seq-attention",
    name: "Seq2Seq with Attention",
    slug: "seq2seq-attention",
    category: "Neural Language Model",
    difficulty: "Intermediate",
    status: "Coming Soon",
    description:
      "Maps one sequence to another while using attention to focus on the most relevant input tokens.",
    inspectItems: ["encoder states", "attention alignment", "decoded sequence"],
  },
  {
    id: "transformer",
    name: "Transformer Language Model",
    slug: "transformer",
    category: "Transformer Model",
    difficulty: "Advanced",
    status: "Coming Soon",
    description:
      "Uses attention to learn relationships between words across longer context.",
    inspectItems: ["attention weights", "token embeddings", "generated output"],
  },
  {
    id: "bert",
    name: "BERT",
    slug: "bert",
    category: "Transformer Model",
    difficulty: "Advanced",
    status: "Coming Soon",
    description:
      "Learns bidirectional context for language understanding tasks such as classification and question answering.",
    inspectItems: ["masked tokens", "context embeddings", "classification logits"],
  },
  {
    id: "rag",
    name: "RAG",
    slug: "rag",
    category: "Retrieval-Based Model",
    difficulty: "Advanced",
    status: "Coming Soon",
    description:
      "Combines document search with text generation to create grounded answers.",
    inspectItems: ["retrieved documents", "context chunks", "generated answer"],
  },
];
