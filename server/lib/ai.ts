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
        content: `You are an expert in Indonesian constitutional law and Pancasila principles. 
        Your role is to analyze regulations and events through the lens of Pancasila's five principles:
        1. Belief in One Supreme God (Ketuhanan Yang Maha Esa)
        2. Just and Civilized Humanity (Kemanusiaan yang Adil dan Beradab)
        3. Unity of Indonesia (Persatuan Indonesia)
        4. Democracy guided by wisdom in deliberation/representation (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan)
        5. Social Justice for all Indonesian people (Keadilan Sosial bagi Seluruh Rakyat Indonesia)

        Analyze how the given text aligns or conflicts with these principles and the Indonesian Constitution (UUD 1945).
        Be critical but respectful. Provide detailed analysis with specific references.
        
        Format your response EXACTLY as a JSON object with these fields:
        {
          "analysis": "detailed analysis of the regulation/event",
          "pancasilaPrinciples": ["array of relevant Pancasila principles"],
          "constitutionalReferences": ["array of relevant UUD 1945 articles"],
          "recommendation": "recommendation based on the analysis"
        }`
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

    const result = JSON.parse(content);
    return aiResponseSchema.parse(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
    throw new Error("Failed to analyze text: Unknown error");
  }
}
