import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeRegulation } from "./lib/ai";
import { insertMessageSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  app.get("/api/messages", async (_req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.delete("/api/messages", async (_req, res) => {
    await storage.clearMessages();
    res.json({ success: true });
  });

  app.post("/api/analyze", async (req, res) => {
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    try {
      const analysis = await analyzeRegulation(result.data.content);
      const message = await storage.createMessage({
        content: result.data.content,
        response: JSON.stringify(analysis)
      });
      res.json(message);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
  });

  return createServer(app);
}