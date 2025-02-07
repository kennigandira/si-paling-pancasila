import { aiResponseSchema, researchResponseSchema, type AIResponse, type ResearchResponse } from "@shared/schema";

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

async function deepseekAnalysis(research: ResearchResponse, originalText: string): Promise<AIResponse> {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a highly critical Indonesian constitutional law expert with deep understanding of Pancasila principles. Your task is to provide an extremely thorough and critical analysis of regulations based on provided research data.

Given the following research references, analyze through Pancasila principles and constitutional framework. Be extremely critical, highlight potential issues, conflicts, and implications.

Research Data:
${JSON.stringify(research, null, 2)}

Return ONLY a JSON object in this format:
{
  "analysis": "extremely detailed critical analysis",
  "pancasilaPrinciples": ["relevant principles with critical examination"],
  "constitutionalReferences": ["relevant articles with critical context"],
  "recommendation": "thorough recommendations based on critical analysis",
  "research": [provided research data]
}

Remember:
1. Be deeply analytical and critical
2. Question assumptions and implications
3. Consider societal impact
4. Highlight potential conflicts
5. Suggest concrete improvements`
          },
          {
            role: "user",
            content: `Please provide a critical analysis of this topic: ${originalText}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Deepseek API error: ${error}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    if (!content) {
      throw new Error("No response content from Deepseek");
    }

    // Extract JSON from response
    const match = content.match(/\{[\s\S]*\}/);
    const jsonContent = match ? match[0] : content;

    const parsedResult = JSON.parse(jsonContent);
    // Include the original research in the response
    parsedResult.research = research;

    return aiResponseSchema.parse(parsedResult);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Critical analysis failed: ${error.message}`);
    }
    throw new Error("Critical analysis failed: Unknown error");
  }
}

export async function analyzeRegulation(text: string): Promise<AIResponse> {
  try {
    // Step 1: Gather research using Perplexity
    const research = await gatherResearch(text);

    // Step 2: Critical analysis using Deepseek (temporary fallback to Perplexity until Deepseek is ready)
    let analysis: AIResponse;
    try {
      analysis = await deepseekAnalysis(research, text);
    } catch {
      // Fallback to Perplexity for analysis until Deepseek is implemented
      const response = await perplexityRequest([
        {
          role: "system",
          content: `You are an expert in Indonesian constitutional law and Pancasila principles. Your task is to analyze regulations and return ONLY a JSON object in the exact format specified below. DO NOT include any explanatory text outside the JSON object.

Required JSON format:
{
  "analysis": "detailed analysis of the regulation/event",
  "pancasilaPrinciples": ["array of relevant Pancasila principles"],
  "constitutionalReferences": ["array of relevant UUD 1945 articles"],
  "recommendation": "recommendation based on the analysis",
  "research": ${JSON.stringify(research)}
}

Remember:
1. ONLY return the JSON object, no other text
2. Keep all field names exactly as shown
3. Ensure all string values are properly escaped
4. Be critical and thorough in your analysis
5. Use the provided research data`
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

      const match = content.match(/\{[\s\S]*\}/);
      const jsonContent = match ? match[0] : content;
      const result = JSON.parse(jsonContent);
      analysis = aiResponseSchema.parse(result);
    }

    return analysis;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
    throw new Error("Failed to analyze text: Unknown error");
  }
}