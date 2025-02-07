import OpenAI from "openai";
import { aiResponseSchema, type AIResponse } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeRegulation(text: string): Promise<AIResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert in Indonesian constitutional law and Pancasila principles. 
          Your role is to analyze regulations and events through the lens of Pancasila's five principles:
          1. Belief in One Supreme God (Ketuhanan Yang Maha Esa)
          2. Just and Civilized Humanity (Kemanusiaan yang Adil dan Beradab)
          3. Unity of Indonesia (Persatuan Indonesia)
          4. Democracy guided by wisdom in deliberation/representation (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan)
          5. Social Justice for all Indonesian people (Keadilan Sosial bagi Seluruh Rakyat Indonesia)

          Analyze how the given text aligns or conflicts with these principles and the Indonesian Constitution (UUD 1945).
          Be critical but respectful. Provide detailed analysis with specific references.
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