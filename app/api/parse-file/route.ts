import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let extractedText = "";

    if (fileName.endsWith(".pdf")) {
      extractedText = await extractPdfText(buffer);
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      extractedText = await extractDocxText(buffer);
    } else if (fileName.endsWith(".txt")) {
      extractedText = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, DOC, or TXT files." },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from the file. The file might be empty, scanned, or corrupted." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: extractedText.trim() });
  } catch (error) {
    console.error("File parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse file. Please try again or paste the text directly." },
      { status: 500 }
    );
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Use pdf-parse for PDF extraction
    const pdfParseModule = await import("pdf-parse");
    
    // Safely handle both CommonJS and ES Module resolution
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    // Use mammoth for DOCX extraction
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}
