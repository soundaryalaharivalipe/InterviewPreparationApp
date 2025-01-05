import { useMutation } from "@tanstack/react-query";

interface TechnicalQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface BehavioralQuestion {
  question: string;
  context: string;
  followUp: string[];
}

interface AnswerAnalysis {
  strengths: string[];
  improvements: string[];
  betterAnswer: string;
  score: number;
}

export function useGenerateTechnicalQuestion() {
  return useMutation({
    mutationFn: async ({ topic, difficulty }: { topic: string; difficulty: string }) => {
      const response = await fetch("/api/technical/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate question");
      }

      return response.json() as Promise<TechnicalQuestion>;
    },
  });
}

export function useGenerateBehavioralQuestion() {
  return useMutation({
    mutationFn: async (previousQuestions: string[]) => {
      const response = await fetch("/api/behavioral/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previousQuestions }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate question");
      }

      return response.json() as Promise<BehavioralQuestion>;
    },
  });
}

export function useAnalyzeBehavioralAnswer() {
  return useMutation({
    mutationFn: async ({ question, answer }: { question: string; answer: string }) => {
      const response = await fetch("/api/behavioral/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze answer");
      }

      return response.json() as Promise<AnswerAnalysis>;
    },
  });
}