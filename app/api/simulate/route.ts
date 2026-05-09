import { NextRequest, NextResponse } from "next/server";
import type { SimulateRequest, SimulateResponse, Clause } from "@/types";
import { analyzeClauseForSimulation } from "@/lib/analyzer";
import { computeScore, computeRiskDistribution } from "@/lib/scoring";

const MIN_CLAUSE_LENGTH = 10;

export async function POST(request: NextRequest) {
  try {
    const body: SimulateRequest = await request.json();
    const { clauseId, newText, allClauses } = body;

    // Validate inputs
    if (!clauseId) {
      return NextResponse.json(
        { error: "Missing clause ID." },
        { status: 400 }
      );
    }

    if (!newText || newText.trim().length < MIN_CLAUSE_LENGTH) {
      return NextResponse.json(
        { error: "Clause text must be at least 10 characters." },
        { status: 400 }
      );
    }

    if (!allClauses || !Array.isArray(allClauses)) {
      return NextResponse.json(
        { error: "Missing or invalid clauses array." },
        { status: 400 }
      );
    }

    // Find the clause to update
    const clauseIndex = allClauses.findIndex((c) => c.id === clauseId);
    if (clauseIndex === -1) {
      return NextResponse.json(
        { error: "Clause not found." },
        { status: 404 }
      );
    }

    const originalClause = allClauses[clauseIndex];

    // Re-analyze the edited clause
    const analysisResult = await analyzeClauseForSimulation(
      newText.trim(),
      originalClause.index
    );

    // Create updated clause object
    const updatedClause: Clause = {
      id: clauseId,
      index: originalClause.index,
      text: newText.trim(),
      risk: analysisResult.risk,
      intent: analysisResult.intent,
      explanation: analysisResult.explanation,
      reasoning: analysisResult.reasoning,
      highlightedText: analysisResult.highlightedText,
      suggestion: analysisResult.suggestion,
    };

    // Replace the clause in the array and compute new metrics
    const updatedClauses = [...allClauses];
    updatedClauses[clauseIndex] = updatedClause;

    const newScore = computeScore(updatedClauses);
    const newRiskDistribution = computeRiskDistribution(updatedClauses);

    const response: SimulateResponse = {
      updatedClause,
      newScore,
      newRiskDistribution,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Simulation error:", error);

    return NextResponse.json(
      { error: "Simulation failed. Please try again." },
      { status: 500 }
    );
  }
}
