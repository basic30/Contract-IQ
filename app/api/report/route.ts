import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/lib/store";
import { getRecordById } from "@/lib/localHistory";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing report ID parameter." },
        { status: 400 }
      );
    }

    // 1. Look up analysis in temporary in-memory store first 
    // (This handles guest users who don't have database records)
    let report = getReport(id);

    // 2. If not in memory, fetch it from Supabase database!
    // (This handles authenticated users opening old history records)
    if (!report) {
      const dbRecord = await getRecordById(id);
      
      if (dbRecord) {
        const clauses = dbRecord.clauses || [];
        
        // Reconstruct the Top Issues list dynamically from the saved clauses
        const topIssues = clauses
          .filter((c: any) => c.risk === 'high' || c.risk === 'medium')
          .sort((a: any, b: any) => {
            if (a.risk === 'high' && b.risk !== 'high') return -1;
            if (a.risk !== 'high' && b.risk === 'high') return 1;
            return 0;
          })
          .slice(0, 3)
          .map((c: any) => ({
            clauseId: c.id,
            risk: c.risk,
            intent: c.intent,
            summary: c.explanation || c.reasoning
          }));

        // Format it exactly how the frontend expects it
        report = {
          id: dbRecord.id,
          score: dbRecord.overall_score,
          totalClauses: clauses.length,
          riskDistribution: dbRecord.risk_summary,
          topIssues: topIssues,
          clauses: clauses,
          analyzedAt: dbRecord.created_at,
        };
      }
    }

    if (!report) {
      return NextResponse.json(
        { error: "Report not found or expired. Please analyze again." },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Report fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch report. Please try again." },
      { status: 500 }
    );
  }
}