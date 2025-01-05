import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateTechnicalQuestion, generateBehavioralQuestion, analyzeBehavioralAnswer } from "./openai";

export function registerRoutes(app: Express): Server {
  // Health check endpoint for AWS Elastic Beanstalk
  app.get("/health", (_req, res) => {
    // Check core application dependencies
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apiVersion: "1.0",
      services: {
        database: process.env.DATABASE_URL ? "configured" : "not configured",
        openai: process.env.OPENAI_API_KEY ? "configured" : "not configured"
      }
    };
    res.status(200).json(healthStatus);
  });

  // Technical interview question generation
  app.post("/api/technical/question", async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      if (!topic || !difficulty) {
        return res.status(400).json({ error: "Topic and difficulty are required" });
      }

      const question = await generateTechnicalQuestion(topic, difficulty);
      res.json(question);
    } catch (error: any) {
      console.error("Error generating technical question:", error);
      res.status(500).json({ error: "Failed to generate question. Please try again later." });
    }
  });

  // Behavioral interview question generation
  app.post("/api/behavioral/question", async (req, res) => {
    try {
      const { previousQuestions } = req.body;
      const question = await generateBehavioralQuestion(previousQuestions || []);
      res.json(question);
    } catch (error: any) {
      console.error("Error generating behavioral question:", error);
      res.status(500).json({ error: "Failed to generate question. Please try again later." });
    }
  });

  // Behavioral answer analysis
  app.post("/api/behavioral/analyze", async (req, res) => {
    try {
      const { question, answer } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required" });
      }

      const analysis = await analyzeBehavioralAnswer(question, answer);
      res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing behavioral answer:", error);
      res.status(500).json({ error: "Failed to analyze answer. Please try again later." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}