import { messages, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage & { response: string }): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(): Promise<Message[]> {
    const allMessages = await db.select().from(messages).orderBy(messages.timestamp);
    return allMessages;
  }

  async createMessage(insertMessage: InsertMessage & { response: string }): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async clearMessages(): Promise<void> {
    await db.delete(messages);
  }
}

export const storage = new DatabaseStorage();