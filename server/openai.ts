import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  toneAnalysis: {
    confidence: number;
    clarity: number;
    professionalism: number;
    enthusiasm: number;
    observations: string[];
  };
}

export async function generateTechnicalQuestion(topic: string, difficulty: string): Promise<TechnicalQuestion> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Generate a technical interview question with 4 options. Return in JSON format with fields: question, options (array of 4 strings), correctAnswer (index 0-3), explanation"
      },
      {
        role: "user",
        content: `Generate a ${difficulty} level question about ${topic}.`
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateBehavioralQuestion(previousQuestions: string[] = []): Promise<BehavioralQuestion> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Generate a behavioral interview question with context and follow-up questions. Return in JSON format with fields: question, context, followUp (array of strings)"
      },
      {
        role: "user",
        content: `Generate a behavioral question. Previous questions: ${previousQuestions.join(", ")}`
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function analyzeBehavioralAnswer(question: string, answer: string): Promise<AnswerAnalysis> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert interview coach specializing in communication skills and behavioral interviews. 
        Analyze the candidate's response considering both content and communication style. 
        Return in JSON format with fields:
        - strengths (array of strings)
        - improvements (array of strings)
        - betterAnswer (string)
        - score (number between 0-100)
        - toneAnalysis (object with:
            - confidence (number 0-100)
            - clarity (number 0-100)
            - professionalism (number 0-100)
            - enthusiasm (number 0-100)
            - observations (array of strings about tone, pace, word choice, etc.)
          )`
      },
      {
        role: "user",
        content: `Question: ${question}\n\nCandidate's Answer: ${answer}`
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}