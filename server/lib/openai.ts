import OpenAI from "openai";
import { aiResponseSchema, type AIResponse } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeRegulation(text: string): Promise<AIResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert in Indonesian constitutional law and Pancasila principles. 
          Analyze regulations and events through the lens of Pancasila and the Indonesian Constitution.
          Be critical but respectful. Provide detailed analysis with references.
          Format response as JSON with: analysis, pancasilaPrinciples (array), constitutionalReferences (array), and recommendation.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    const result = JSON.parse(content);
    return aiResponseSchema.parse(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
    throw new Error("Failed to analyze text: Unknown error");
  }
}