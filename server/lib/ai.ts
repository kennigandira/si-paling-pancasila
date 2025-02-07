import { aiResponseSchema, type AIResponse } from "@shared/schema";

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

export async function analyzeRegulation(text: string): Promise<AIResponse> {
  try {
    const response = await perplexityRequest([
      {
        role: "system",
        content: `You are an expert in Indonesian constitutional law and Pancasila principles. Your task is to analyze regulations and return ONLY a JSON object in the exact format specified below. DO NOT include any explanatory text outside the JSON object.

Required JSON format:
{
  "analysis": "detailed analysis of the regulation/event",
  "pancasilaPrinciples": ["array of relevant Pancasila principles"],
  "constitutionalReferences": ["array of relevant UUD 1945 articles"],
  "recommendation": "recommendation based on the analysis"
}

Remember:
1. ONLY return the JSON object, no other text
2. Keep all field names exactly as shown
3. Ensure all string values are properly escaped
4. Array values must be strings`
      },
      {
        role: "user",
        content: text
      }
    ]);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from Perplexity");
    }

    // Try to extract JSON if the response contains any extra text
    let jsonContent = content;
    try {
      // Find JSON-like content between curly braces if there's extra text
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        jsonContent = match[0];
      }
      const result = JSON.parse(jsonContent);
      return aiResponseSchema.parse(result);
    } catch (parseError) {
      throw new Error(`Failed to parse response as JSON: ${content}`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
    throw new Error("Failed to analyze text: Unknown error");
  }
}