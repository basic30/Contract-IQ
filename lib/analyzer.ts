import { v4 as uuidv4 } from "uuid";
import type { AnalysisReport, Clause, RiskLevel } from "@/types";
import { parseContractText } from "./parser";
import { scanClauseWithRules, getHighestRisk, formatRuleHint } from "./rules";
import { analyzeClauseWithAI, isAIConfigured } from "./ai";
import {
  computeScore,
  computeRiskDistribution,
  extractTopIssues,
} from "./scoring";

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 500;

/**
 * Main orchestration function for contract analysis
 * Pipeline: parse → rules → AI (with fallback) → score → assemble report
 * Handles missing OpenAI API key gracefully by falling back to rule-based analysis
 */
export async function analyzeContract(
  rawText: string,
  analysisId?: string
): Promise<AnalysisReport> {
  const id = analysisId || uuidv4();

  // Step 1: Parse text into clause strings
  const clauseTexts = parseContractText(rawText);

  if (clauseTexts.length === 0) {
    throw new Error("No readable content found in the contract.");
  }

  // Step 2 & 3: Run rules engine and AI enrichment for each clause
  const clauses = await processClausesInBatches(clauseTexts);

  // Step 4: Compute score, distribution, and top issues
  const score = computeScore(clauses);
  const riskDistribution = computeRiskDistribution(clauses);
  const topIssues = extractTopIssues(clauses);

  // Step 5: Assemble and return the report
  const report: AnalysisReport = {
    id,
    score,
    totalClauses: clauses.length,
    riskDistribution,
    topIssues,
    clauses,
    analyzedAt: new Date().toISOString(),
  };

  return report;
}

/**
 * Process clauses in parallel batches to manage rate limits
 */
async function processClausesInBatches(clauseTexts: string[]): Promise<Clause[]> {
  const allClauses: Clause[] = [];
  const aiConfigured = isAIConfigured();

  for (let i = 0; i < clauseTexts.length; i += BATCH_SIZE) {
    const batch = clauseTexts.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (text, batchIndex) => {
      const globalIndex = i + batchIndex;
      return processClause(text, globalIndex, aiConfigured);
    });

    const batchResults = await Promise.all(batchPromises);
    allClauses.push(...batchResults);

    // Add delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < clauseTexts.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return allClauses;
}

/**
 * Process a single clause through rules and optionally AI
 */
async function processClause(
  text: string,
  index: number,
  useAI: boolean
): Promise<Clause> {
  const clauseId = uuidv4();

  // Run rule-based pre-scan
  const ruleMatches = scanClauseWithRules(text);
  const ruleRisk = getHighestRisk(ruleMatches);
  const ruleHint = formatRuleHint(ruleMatches);

  // If AI is configured, use it for enrichment
  if (useAI) {
    try {
      const aiAnalysis = await analyzeClauseWithAI({
        clauseText: text,
        clauseIndex: index,
        ruleHint: ruleMatches.length > 0 ? ruleHint : undefined,
      });

      return {
        id: clauseId,
        index,
        text,
        risk: aiAnalysis.risk,
        intent: aiAnalysis.intent,
        explanation: aiAnalysis.explanation,
        reasoning: aiAnalysis.reasoning,
        highlightedText: aiAnalysis.highlightedText,
        suggestion: aiAnalysis.suggestion,
      };
    } catch (error) {
      console.error(`AI analysis failed for clause ${index}, falling back to rules:`, error);
      // Fall through to rule-based fallback
    }
  }

  // Fallback: Use rule-based analysis only
  return createRuleBasedClause(clauseId, index, text, ruleMatches, ruleRisk);
}

/**
 * Create a clause object using only rule-based analysis
 */
function createRuleBasedClause(
  id: string,
  index: number,
  text: string,
  ruleMatches: { risk: RiskLevel; matchedText: string; reason: string }[],
  risk: RiskLevel
): Clause {
  const primaryMatch = ruleMatches[0];

  // Generate intent based on common patterns
  const intent = detectIntent(text);

  // Generate explanation based on risk
  let explanation: string;
  let reasoning: string;
  let suggestion: string;

  if (risk === "high" && primaryMatch) {
    explanation = `This clause contains language that could significantly impact your rights or obligations. Key phrase: "${primaryMatch.matchedText}".`;
    reasoning = primaryMatch.reason;
    suggestion = "Consider negotiating this clause or seeking legal advice before signing.";
  } else if (risk === "medium" && primaryMatch) {
    explanation = `This clause contains terms that warrant attention. Key phrase: "${primaryMatch.matchedText}".`;
    reasoning = primaryMatch.reason;
    suggestion = "Review this clause carefully and consider if the terms are acceptable for your situation.";
  } else {
    explanation = "This appears to be a standard clause with balanced terms.";
    reasoning = "No significant risk patterns detected in this clause.";
    suggestion = "No changes needed.";
  }

  return {
    id,
    index,
    text,
    risk,
    intent,
    explanation,
    reasoning,
    highlightedText: primaryMatch?.matchedText || text.slice(0, 100),
    suggestion,
  };
}

/**
 * Detect the likely intent of a clause based on keywords
 */
function detectIntent(text: string): string {
  const lowerText = text.toLowerCase();

  const intentPatterns: { pattern: RegExp; intent: string }[] = [
    { pattern: /indemnif/i, intent: "Indemnification" },
    { pattern: /liabil/i, intent: "Liability Limitation" },
    { pattern: /confidential/i, intent: "Confidentiality" },
    { pattern: /intellectual\s+property|ip\s+|copyright|patent/i, intent: "IP Rights" },
    { pattern: /terminat/i, intent: "Termination" },
    { pattern: /payment|compensat|fee/i, intent: "Payment Terms" },
    { pattern: /non[\s-]?compete/i, intent: "Non-Compete" },
    { pattern: /non[\s-]?solicitation/i, intent: "Non-Solicitation" },
    { pattern: /arbitration|dispute/i, intent: "Dispute Resolution" },
    { pattern: /govern(?:ing|ed)\s+(?:by\s+)?law/i, intent: "Governing Law" },
    { pattern: /force\s+majeure/i, intent: "Force Majeure" },
    { pattern: /warrant/i, intent: "Warranties" },
    { pattern: /assign(?:ment)?/i, intent: "Assignment" },
    { pattern: /scope\s+of\s+(?:work|service)/i, intent: "Scope of Services" },
    { pattern: /whereas|recital/i, intent: "Recital" },
    { pattern: /witness\s+whereof/i, intent: "Signature Block" },
    { pattern: /renew/i, intent: "Renewal Terms" },
  ];

  for (const { pattern, intent } of intentPatterns) {
    if (pattern.test(lowerText)) {
      return intent;
    }
  }

  return "General Provision";
}

/**
 * Utility function for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Analyze a single clause for simulation purposes
 */
export async function analyzeClauseForSimulation(
  clauseText: string,
  clauseIndex: number
): Promise<Omit<Clause, "id">> {
  const aiConfigured = isAIConfigured();
  const ruleMatches = scanClauseWithRules(clauseText);
  const ruleRisk = getHighestRisk(ruleMatches);
  const ruleHint = formatRuleHint(ruleMatches);

  if (aiConfigured) {
    try {
      const aiAnalysis = await analyzeClauseWithAI({
        clauseText,
        clauseIndex,
        ruleHint: ruleMatches.length > 0 ? ruleHint : undefined,
      });

      return {
        index: clauseIndex,
        text: clauseText,
        risk: aiAnalysis.risk,
        intent: aiAnalysis.intent,
        explanation: aiAnalysis.explanation,
        reasoning: aiAnalysis.reasoning,
        highlightedText: aiAnalysis.highlightedText,
        suggestion: aiAnalysis.suggestion,
      };
    } catch (error) {
      console.error("AI simulation analysis failed:", error);
    }
  }

  // Fallback to rule-based
  const primaryMatch = ruleMatches[0];
  return {
    index: clauseIndex,
    text: clauseText,
    risk: ruleRisk,
    intent: detectIntent(clauseText),
    explanation: primaryMatch
      ? `Updated analysis: "${primaryMatch.matchedText}" - ${primaryMatch.reason}`
      : "This clause appears to have balanced terms.",
    reasoning: primaryMatch?.reason || "No significant risk patterns detected.",
    highlightedText: primaryMatch?.matchedText || clauseText.slice(0, 100),
    suggestion: ruleRisk === "low" ? "No changes needed." : "Consider further review.",
  };
}
