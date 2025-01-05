// server/index.ts
import express2 from "express";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// server/routes.ts
import { createServer } from "http";

// server/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function generateTechnicalQuestion(topic, difficulty) {
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
async function generateBehavioralQuestion(previousQuestions = []) {
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
async function analyzeBehavioralAnswer(question, answer) {
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
        content: `Question: ${question}

Candidate's Answer: ${answer}`
      }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(response.choices[0].message.content);
}

// server/routes.ts
function registerRoutes(app2) {
  app2.get("/health", (_req, res) => {
    const healthStatus = {
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV,
      apiVersion: "1.0",
      services: {
        database: process.env.DATABASE_URL ? "configured" : "not configured",
        openai: process.env.OPENAI_API_KEY ? "configured" : "not configured"
      }
    };
    res.status(200).json(healthStatus);
  });
  app2.post("/api/technical/question", async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      if (!topic || !difficulty) {
        return res.status(400).json({ error: "Topic and difficulty are required" });
      }
      const question = await generateTechnicalQuestion(topic, difficulty);
      res.json(question);
    } catch (error) {
      console.error("Error generating technical question:", error);
      res.status(500).json({ error: "Failed to generate question. Please try again later." });
    }
  });
  app2.post("/api/behavioral/question", async (req, res) => {
    try {
      const { previousQuestions } = req.body;
      const question = await generateBehavioralQuestion(previousQuestions || []);
      res.json(question);
    } catch (error) {
      console.error("Error generating behavioral question:", error);
      res.status(500).json({ error: "Failed to generate question. Please try again later." });
    }
  });
  app2.post("/api/behavioral/analyze", async (req, res) => {
    try {
      const { question, answer } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required" });
      }
      const analysis = await analyzeBehavioralAnswer(question, answer);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing behavioral answer:", error);
      res.status(500).json({ error: "Failed to analyze answer. Please try again later." });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        if (msg.includes("[TypeScript] Found 0 errors. Watching for file changes")) {
          log("no errors found", "tsc");
          return;
        }
        if (msg.includes("[TypeScript] ")) {
          const [errors, summary] = msg.split("[TypeScript] ", 2);
          log(`${summary} ${errors}\x1B[0m`, "tsc");
          return;
        } else {
          viteLogger.error(msg, options);
          process.exit(1);
        }
      }
    },
    server: {
      middlewareMode: true,
      hmr: { server }
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      const template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/index.ts
import path3 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = path3.dirname(__filename3);
var app = express2();
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", limiter);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https://api.openai.com"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" }
}));
app.use(compression());
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = registerRoutes(app);
  app.use((err, _req, res, _next) => {
    console.error("Server error:", err);
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    const publicPath = path3.resolve(__dirname3, "..", "dist", "public");
    console.log("Serving static files from:", publicPath);
    app.use(express2.static(publicPath, {
      maxAge: "1d",
      etag: true
    }));
    app.use("*", (_req, res) => {
      res.sendFile(path3.resolve(publicPath, "index.html"));
    });
  }
  const PORT = parseInt(process.env.PORT || "5000", 10);
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
})();
