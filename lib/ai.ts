import OpenAI from "openai";
import type { AIClauseAnalysis, RiskLevel } from "@/types";

const SYSTEM_PROMPT = `You are an expert legal analyst specializing in contract review. Your role is to analyze contract clauses and explain them in plain English that a non-lawyer can understand.

For each clause, you will:
1. Determine the risk level (low, medium, or high) based on how potentially harmful the clause could be to the party signing the contract
2. Identify the intent/purpose of the clause
3. Provide a clear, plain-English explanation of what the clause means
4. Explain why the clause carries its assigned risk level
5. Highlight the specific text that is most relevant to the risk assessment
6. Suggest safer alternative language or additions if applicable

Risk Level Guidelines:
- HIGH: Clauses that could cause significant financial, legal, or professional harm. Examples: unlimited liability, irrevocable assignments, one-sided termination rights, overly broad indemnification.
- MEDIUM: Clauses that warrant attention but are common in contracts. Examples: confidentiality terms, non-competes, IP assignment, arbitration clauses.
- LOW: Standard clauses that are fair and balanced. Examples: mutual obligations, standard definitions, reasonable payment terms.

Always respond with valid JSON in the exact format specified.`;

interface AnalyzeClauseParams {
  clauseText: string;
  clauseIndex: number;
  ruleHint?: string;
}

/**
 * Analyze a single clause using GPT-4o
 */
export async function analyzeClauseWithAI(
  params: AnalyzeClauseParams
): Promise<AIClauseAnalysis> {
  const { clauseText, clauseIndex, ruleHint } = params;

  // Check if OpenAI API is configured
  if (!isAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  const userPrompt = `Analyze the following contract clause (Clause #${clauseIndex + 1}):

---
${clauseText}
---

${ruleHint ? `Pre-scan hint from rule engine:\n${ruleHint}\n\n` : ""}Respond with a JSON object containing exactly these fields:
{
  "risk": "low" | "medium" | "high",
  "intent": "Brief label for the clause's purpose (e.g., 'Liability Limitation', 'IP Assignment')",
  "explanation": "Plain-English explanation of what this clause means for someone signing the contract",
  "reasoning": "Why this clause has the assigned risk level",
  "highlightedText": "The specific phrase or sentence in the clause that is most relevant to the risk assessment",
  "suggestion": "Recommended safer alternative language or what to negotiate, or 'No changes needed' if low risk"
}`;

  try {
    // FIXED: Initialize OpenAI directly inside the function where it is actually used
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    const parsed = JSON.parse(content) as AIClauseAnalysis;

    // Validate and normalize the response
    return {
      risk: validateRiskLevel(parsed.risk),
      intent: parsed.intent || "General Clause",
      explanation: parsed.explanation || "Unable to generate explanation.",
      reasoning: parsed.reasoning || "Unable to generate reasoning.",
      highlightedText: parsed.highlightedText || clauseText.slice(0, 100),
      suggestion: parsed.suggestion || "Review with legal counsel.",
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    throw error;
  }
}

/**
 * Validate and normalize risk level
 */
function validateRiskLevel(risk: string): RiskLevel {
  const normalized = risk?.toLowerCase();
  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }
  return "medium"; // Default to medium if unknown
}

/**
 * Check if OpenAI API is configured
 */
export function isAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}