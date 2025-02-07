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

export const aiResponseSchema = z.object({
  analysis: z.string(),
  pancasilaPrinciples: z.array(z.string()),
  constitutionalReferences: z.array(z.string()),
  recommendation: z.string(),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type AIResponse = z.infer<typeof aiResponseSchema>;
