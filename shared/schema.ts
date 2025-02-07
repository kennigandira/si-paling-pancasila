import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true
});

export const researchResponseSchema = z.object({
  references: z.array(z.object({
    source: z.string(),
    content: z.string(),
    type: z.enum(["law", "article", "paper", "document"]),
  })),
  summary: z.string(),
});

export const aiResponseSchema = z.object({
  analysis: z.string(),
  pancasilaPrinciples: z.array(z.string()).or(z.array(z.record(z.any()))).transform(principles => 
    principles.map(p => typeof p === 'string' ? p : JSON.stringify(p))
  ),
  constitutionalReferences: z.array(z.string()),
  recommendation: z.string(),
  // Add research data to the response
  research: researchResponseSchema,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type AIResponse = z.infer<typeof aiResponseSchema>;
export type ResearchResponse = z.infer<typeof researchResponseSchema>;