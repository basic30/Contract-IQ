// Risk level classification
export type RiskLevel = "low" | "medium" | "high";

// Represents one analyzed contract clause
export interface Clause {
  id: string;
  index: number;
  text: string;
  risk: RiskLevel;
  intent: string;
  explanation: string;
  reasoning: string;
  highlightedText: string;
  suggestion: string;
  confidenceScore?: number;
}

// Risk distribution counts
export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
}

// Summary of a significant risky clause
export interface TopIssue {
  clauseId: string;
  title: string;
  description: string;
  risk: RiskLevel;
}

// Complete output of one contract analysis
export interface AnalysisReport {
  id: string;
  score: number;
  totalClauses: number;
  riskDistribution: RiskDistribution;
  topIssues: TopIssue[];
  clauses: Clause[];
  analyzedAt: string;
}

// Request for clause simulation
export interface SimulateRequest {
  clauseId: string;
  newText: string;
  allClauses: Clause[];
}

// Response from clause simulation
export interface SimulateResponse {
  updatedClause: Clause;
  newScore: number;
  newRiskDistribution: RiskDistribution;
}

// Rule match result from deterministic scanner
export interface RuleMatch {
  risk: RiskLevel;
  matchedText: string;
  reason: string;
}

// AI analysis result for a single clause
export interface AIClauseAnalysis {
  risk: RiskLevel;
  intent: string;
  explanation: string;
  reasoning: string;
  highlightedText: string;
  suggestion: string;
  confidenceScore?: number;
}
