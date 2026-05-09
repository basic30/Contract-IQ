import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert image to base64
    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = buffer.toString("base64");
    const mimeType = image.type || "image/jpeg";

    // Use GPT-4 Vision to extract text
    if (!process.env.OPENAI_API_KEY) {
      // Fallback: return a message that OCR requires API key
      return NextResponse.json(
        { error: "OCR requires OpenAI API key. Please add your OPENAI_API_KEY to use this feature." },
        { status: 400 }
      );
    }

    // MOVED INSIDE THE FUNCTION: Now it only initializes when the route is actually called!
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this document image. Return ONLY the extracted text, preserving the original formatting and structure as much as possible. Do not add any commentary or explanations.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    const extractedText = response.choices[0]?.message?.content;

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from the image. Please try a clearer image." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: extractedText.trim() });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "Failed to process image. Please try again." },
      { status: 500 }
    );
  }
}