import type { Clause, RiskDistribution, TopIssue } from "@/types";

/**
 * Compute overall contract safety score
 * Starts at 100, subtracts 20 per HIGH clause, 8 per MEDIUM clause
 * Returns a value clamped between 0 and 100
 */
export function computeScore(clauses: Clause[]): number {
  let score = 100;

  for (const clause of clauses) {
    if (clause.risk === "high") {
      score -= 20;
    } else if (clause.risk === "medium") {
      score -= 8;
    }
    // LOW risk clauses don't affect the score
  }

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Compute the distribution of clauses by risk level
 */
export function computeRiskDistribution(clauses: Clause[]): RiskDistribution {
  const distribution: RiskDistribution = {
    low: 0,
    medium: 0,
    high: 0,
  };

  for (const clause of clauses) {
    distribution[clause.risk]++;
  }

  return distribution;
}

/**
 * Extract the top issues (most significant risky clauses)
 * Returns up to 5 issues, sorted by severity (HIGH first, then MEDIUM)
 */
export function extractTopIssues(clauses: Clause[]): TopIssue[] {
  // Filter to only risky clauses (HIGH and MEDIUM)
  const riskyClauses = clauses.filter(
    (clause) => clause.risk === "high" || clause.risk === "medium"
  );

  // Sort by severity (HIGH first, then MEDIUM), then by index
  const sorted = riskyClauses.sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 };
    const riskDiff = riskOrder[a.risk] - riskOrder[b.risk];
    if (riskDiff !== 0) return riskDiff;
    return a.index - b.index;
  });

  // Take top 5 and transform to TopIssue format
  return sorted.slice(0, 5).map((clause) => ({
    clauseId: clause.id,
    title: clause.intent,
    description: clause.reasoning,
    risk: clause.risk,
  }));
}

/**
 * Get a letter grade based on the score
 */
export function getScoreGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/**
 * Get a human-readable label for the score
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return "Safe";
  if (score >= 50) return "Caution";
  return "High Risk";
}

/**
 * Get the color category for a score
 */
export function getScoreColor(score: number): "green" | "amber" | "red" {
  if (score >= 80) return "green";
  if (score >= 50) return "amber";
  return "red";
}
