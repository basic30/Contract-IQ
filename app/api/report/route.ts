import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/lib/store";

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

    // Look up analysis in store
    const report = getReport(id);

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
