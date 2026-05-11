import { v4 as uuidv4 } from "uuid";
import type { AnalysisReport, Clause } from "@/types";
import { parseContractText } from "./parser";
import { scanClauseWithRules, formatRuleHint } from "./rules";
import { analyzeClauseWithAI } from "./ai";
import {
  computeScore,
  computeRiskDistribution,
  extractTopIssues,
} from "./scoring";

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 500;

export async function analyzeContract(
  rawText: string,
  analysisId?: string
): Promise<AnalysisReport> {
  const id = analysisId || uuidv4();
  const clauseTexts = parseContractText(rawText);

  if (clauseTexts.length === 0) {
    throw new Error("No readable content found in the contract.");
  }

  // Process all clauses strictly using AI
  const clauses = await processClausesInBatches(clauseTexts);

  const score = computeScore(clauses);
  const riskDistribution = computeRiskDistribution(clauses);
  const topIssues = extractTopIssues(clauses);

  return {
    id,
    score,
    totalClauses: clauses.length,
    riskDistribution,
    topIssues,
    clauses,
    analyzedAt: new Date().toISOString(),
  };
}

async function processClausesInBatches(clauseTexts: string[]): Promise<Clause[]> {
  const allClauses: Clause[] = [];

  for (let i = 0; i < clauseTexts.length; i += BATCH_SIZE) {
    const batch = clauseTexts.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (text, batchIndex) => {
      const globalIndex = i + batchIndex;
      return processClause(text, globalIndex);
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

async function processClause(text: string, index: number): Promise<Clause> {
  const clauseId = uuidv4();

  // We still use rules just to give the AI a helpful hint
  const ruleMatches = scanClauseWithRules(text);
  const ruleHint = formatRuleHint(ruleMatches);

  // Force AI analysis on every clause (No fallback)
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
    confidenceScore: aiAnalysis.confidenceScore,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeClauseForSimulation(
  clauseText: string,
  clauseIndex: number
): Promise<Omit<Clause, "id">> {
  const ruleMatches = scanClauseWithRules(clauseText);
  const ruleHint = formatRuleHint(ruleMatches);

  // Force AI analysis for simulation
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
}