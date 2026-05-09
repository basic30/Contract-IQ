import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { analyzeContract } from "@/lib/analyzer";
import { sampleContract } from "@/lib/sampleContract";
import { saveReport } from "@/lib/store";
import { createRecord } from "@/lib/localHistory";

const MAX_INPUT_LENGTH = 50000;
const MIN_INPUT_LENGTH = 50;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let contractText: string | null = null;
    let contractName: string = "Untitled Contract";
    let userId: string | null = null;

    // Handle multipart form data
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      // Get user ID if provided
      const formUserId = formData.get("userId") as string | null;
      if (formUserId) {
        userId = formUserId;
      }

      // Get file name if provided
      const fileName = formData.get("fileName") as string | null;
      if (fileName) {
        contractName = fileName;
      }

      // Check for file upload that needs parsing
      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        try {
          // Parse the file using our parse-file API
          const parseFormData = new FormData();
          parseFormData.append("file", file);
          
          const parseResponse = await fetch(new URL("/api/parse-file", request.url).toString(), {
            method: "POST",
            body: parseFormData,
          });
          
          const parseData = await parseResponse.json();
          
          if (!parseResponse.ok) {
            throw new Error(parseData.error || "Failed to parse file");
          }
          
          contractText = parseData.text;
          contractName = file.name;
        } catch (fileError) {
          console.error("File parse error:", fileError);
          return NextResponse.json(
            {
              error: fileError instanceof Error ? fileError.message : "Failed to parse file. Please try pasting the text directly.",
            },
            { status: 400 }
          );
        }
      }

      // Check for raw text
      if (!contractText) {
        const rawText = formData.get("text") as string | null;
        if (rawText) {
          contractText = rawText;
        }
      }

      // Check for useSample flag
      if (!contractText) {
        const useSample = formData.get("useSample") as string | null;
        if (useSample === "true") {
          contractText = sampleContract;
          contractName = "Sample Freelance Service Agreement";
        }
      }
    } else if (contentType.includes("application/json")) {
      // Handle JSON body
      const body = await request.json();

      if (body.text) {
        contractText = body.text;
      } else if (body.useSample) {
        contractText = sampleContract;
        contractName = "Sample Freelance Service Agreement";
      }
      
      if (body.userId) {
        userId = body.userId;
      }
      
      if (body.fileName) {
        contractName = body.fileName;
      }
    }

    // Validate input
    if (!contractText) {
      return NextResponse.json(
        { error: "No contract text provided. Please upload a file or paste text." },
        { status: 400 }
      );
    }

    contractText = contractText.trim();

    if (contractText.length < MIN_INPUT_LENGTH) {
      return NextResponse.json(
        { error: "Contract is too short. Please provide at least 50 characters." },
        { status: 400 }
      );
    }

    if (contractText.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Contract is too large. Please use a document under 50,000 characters.",
        },
        { status: 400 }
      );
    }

    // Generate analysis ID
    const analysisId = uuidv4();

    // Run the analysis pipeline
    const report = await analyzeContract(contractText, analysisId);

    // Persist to in-memory store (for immediate retrieval)
    saveReport(report);

    // If user is authenticated, save to local history
    if (userId) {
      try {
        createRecord({
          id: analysisId,
          userId,
          contractName,
          contractText: contractText.substring(0, 10000),
          overallScore: report.score,
          riskSummary: report.riskSummary,
          clauses: report.clauses,
          createdAt: new Date().toISOString(),
        });
      } catch (dbError) {
        // Log but don't fail the request
        console.error("Failed to save to history:", dbError);
      }
    }

    // Return success with ID and score
    return NextResponse.json({
      id: report.id,
      score: report.score,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Check for specific error types
    if (message.includes("No readable content")) {
      return NextResponse.json(
        {
          error:
            "No readable content found. Please check your input file or text.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
