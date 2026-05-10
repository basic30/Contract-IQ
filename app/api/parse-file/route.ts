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
  return new Promise((resolve, reject) => {
    try {
      const PDFParser = require("pdf2json");
      const pdfParser = new PDFParser(null, 1); // 1 = extract text only
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF Parser Error:", errData.parserError);
        reject(new Error("Failed to parse PDF"));
      });
      
      pdfParser.on("pdfParser_dataReady", () => {
        let text = pdfParser.getRawTextContent();
        try {
          // pdf2json sometimes URL-encodes the output, so we safely decode it
          text = decodeURIComponent(text);
        } catch (e) {
          // If decoding fails, we just fall back to the raw text
        }
        resolve(text || "");
      });
      
      pdfParser.parseBuffer(buffer);
    } catch (err) {
      reject(err);
    }
  });
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}