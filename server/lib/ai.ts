import { aiResponseSchema, researchResponseSchema, type AIResponse, type ResearchResponse } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function perplexityRequest(messages: Array<{ role: string; content: string }>) {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages,
      temperature: 0.2,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API error: ${error}`);
  }

  return await response.json();
}

async function gatherResearch(text: string): Promise<ResearchResponse> {
  try {
    const response = await perplexityRequest([
      {
        role: "system",
        content: `You are a thorough researcher specializing in Indonesian law and regulations. Your task is to gather comprehensive references and return ONLY a JSON object with findings. DO NOT include any text outside the JSON.

Required JSON format:
{
  "references": [
    {
      "source": "source name or URL",
      "content": "relevant excerpt or summary",
      "type": "law" | "article" | "paper" | "document"
    }
  ],
  "summary": "brief summary of findings"
}

Focus on:
1. Relevant laws and regulations
2. Academic papers and articles
3. Government documents
4. Case studies if applicable

Remember:
1. Only return valid JSON
2. Include specific article numbers for laws
3. Provide direct quotes where possible
4. Ensure all sources are credible`
      },
      {
        role: "user",
        content: `Please research thoroughly about this topic and find relevant references: ${text}`
      }
    ]);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from Perplexity");
    }

    // Extract JSON from response
    const match = content.match(/\{[\s\S]*\}/);
    const jsonContent = match ? match[0] : content;
    const result = JSON.parse(jsonContent);
    return researchResponseSchema.parse(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Research gathering failed: ${error.message}`);
    }
    throw new Error("Research gathering failed: Unknown error");
  }
}

async function openAIAnalysis(research: ResearchResponse, originalText: string): Promise<AIResponse> {
  try {
    const prompt = `You are an expert in Indonesian constitutional law and Pancasila principles. Analyze the following topic and research data through the lens of Pancasila principles.

Topic: ${originalText}

Research Data:
${JSON.stringify(research, null, 2)}

Return your analysis ONLY as a JSON object in this exact format (no other text):
{
  "analysis": "detailed analysis of the regulation/event through Pancasila lens",
  "pancasilaPrinciples": ["relevant principles with analysis"],
  "constitutionalReferences": ["relevant UUD 1945 articles"],
  "recommendation": "recommendations based on analysis",
  "research": [provided research data]
}`;

    const response = await openai.chat.completions.create({
      model: "o1-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    const result = JSON.parse(content);
    // Include the original research in the response
    result.research = research;

    return aiResponseSchema.parse(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
    throw new Error("Analysis failed: Unknown error");
  }
}

export async function analyzeRegulation(text: string): Promise<AIResponse> {
  try {
    // Step 1: Gather research using Perplexity
    const research = await gatherResearch(text);

    // Step 2: Analyze using OpenAI o1-mini
    const analysis = await openAIAnalysis(research, text);

    return analysis;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
    throw new Error("Failed to analyze text: Unknown error");
  }
}