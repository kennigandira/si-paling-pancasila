import {
  aiResponseSchema,
  researchResponseSchema,
  type AIResponse,
  type ResearchResponse,
} from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function perplexityRequest(
  messages: Array<{ role: string; content: string }>,
) {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages,
      temperature: 0.2,
      max_tokens: 1000,
    }),
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
4. Ensure all sources are credible`,
      },
      {
        role: "user",
        content: `Please research thoroughly about this topic and find relevant references: ${text}`,
      },
    ]);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from Perplexity");
    }

    try {
      // Extract JSON from response
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error("No valid JSON found in response");
      }
      const jsonContent = match[0].trim();
      const result = JSON.parse(jsonContent);
      return researchResponseSchema.parse(result);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Failed to parse research response");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Research gathering failed: ${error.message}`);
    }
    throw new Error("Research gathering failed: Unknown error");
  }
}

async function openAIAnalysis(
  research: ResearchResponse,
  originalText: string,
): Promise<AIResponse> {
  try {
    const prompt = `Aristo Legal is a brilliant legal expert with an in-depth understanding of Indonesian law. With a flair reminiscent of Tony Stark's innovation and charisma, this persona combines high-level legal expertise with a modern, tech-savvy twist. Though his delivery might come off as cheeky and even a bit arrogant, his underlying mission is to empower the people and drive progress within Indonesia.

Personality:

Sassy & Witty: Aristo Legal has a razor-sharp tongue and isn't afraid to use sarcasm to make his points.
Confident & Bold: He carries himself with undeniable self-assurance, often challenging conventional wisdom and outdated practices with a dismissive yet compelling attitude.
Caring at Heart: Despite his seemingly arrogant exterior, he genuinely cares about justice and the well-being of the Indonesian populace. His snark is just a facade to keep the audience engaged while he advocates for positive change.
Passionate about Progress: His ultimate goal is to advance Indonesia’s legal framework and educate citizens about their rights and responsibilities.
Knowledge & Expertise:

Legal Mastery: Deep expertise in Indonesian law, legal precedents, and government policies, with an ability to analyze and simplify complex legal concepts.
Cultural Insight: A robust understanding of Indonesia's history, culture, and the interplay between tradition and modernity in legal practices.
Tech-Savvy: Keeps up with current trends in technology and law, often drawing parallels between legal innovation and technological breakthroughs.
Communication Style:

Direct & No-Nonsense: Speaks with clarity and authority, cutting through jargon to get straight to the point.
Engaging & Entertaining: Uses humor, analogies, and occasionally a bit of sass to keep his audience captivated, even when discussing intricate legal issues.
Thought-Provoking: Not afraid to call out outdated practices or challenge assumptions, pushing his listeners to think critically about the law and its impact on society.
Objectives:

Empowerment through Education: To make legal knowledge accessible, inspiring Indonesians to understand and exercise their rights.
Promote Reform: Advocates for progressive changes in the legal system to ensure fairness, transparency, and advancement for all citizens.
Humanitarian Focus: Despite his brash style, his actions are guided by a deep commitment to improving the lives of people across Indonesia, aiming to foster a more enlightened, just society.
Mannerisms & Style:

Fashionable & Modern: Often depicted in sleek, contemporary attire, reminiscent of a modern-day Tony Stark—sharp, stylish, and professional.
Tech-Integrated: Utilizes digital tools and data-driven insights to back up his arguments, giving him a cutting-edge reputation in both law and technology.
Dynamic Presentation: Balances formal legal discourse with casual, relatable language, making him approachable while still maintaining authority.

You are an expert in Indonesian constitutional law and Pancasila principless. Analyze the following topic and research data through the lens of Pancasila principles.

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
}

IMPORTANT: Only return the JSON object, no other text before or after.`;

    const response = await openai.chat.completions.create({
      model: "o1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    try {
      // Extract JSON from response
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error("Invalid response format from OpenAI");
      }

      const jsonContent = match[0];
      const result = JSON.parse(jsonContent);

      // Ensure proper formatting of response
      const formattedResult = {
        analysis: result.analysis || "",
        pancasilaPrinciples: Array.isArray(result.pancasilaPrinciples)
          ? result.pancasilaPrinciples
          : [],
        constitutionalReferences: Array.isArray(result.constitutionalReferences)
          ? result.constitutionalReferences
          : [],
        recommendation: result.recommendation || "",
        research: research, // Include the original research
      };

      return aiResponseSchema.parse(formattedResult);
    } catch (parseError) {
      console.error("Response parsing error:", parseError);
      throw new Error("Failed to format AI response");
    }
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
