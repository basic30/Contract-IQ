import { NextRequest, NextResponse } from "next/server";

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

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = buffer.toString("base64");
    const mimeType = image.type || "image/jpeg";

    if (!process.env.PUTER_AUTH_TOKEN) {
      return NextResponse.json(
        { error: "OCR requires PUTER_AUTH_TOKEN. Please add it to your environment variables." },
        { status: 400 }
      );
    }

    // Direct fetch to Puter API using gpt-4o (Vision support needed for OCR)
    const response = await fetch("https://api.puter.com/puterai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PUTER_AUTH_TOKEN}`
      },
      body: JSON.stringify({
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
      })
    });

    if (!response.ok) {
      throw new Error(`Puter API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content;

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