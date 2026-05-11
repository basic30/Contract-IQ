import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { textObj, targetLanguage } = await request.json();

    if (!process.env.PUTER_AUTH_TOKEN) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 400 });
    }

    // We ask the AI to strictly return a translated JSON object
    const prompt = `Translate the string values of this JSON object to ${targetLanguage}. Return ONLY valid JSON with the exact same keys, no markdown blocks or extra text:\n\n${JSON.stringify(textObj)}`;

    const response = await fetch("https://api.puter.com/puterai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PUTER_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.0,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error("Translation failed");

    const data = await response.json();
    const translatedObj = JSON.parse(data.choices[0]?.message?.content);

    return NextResponse.json({ translated: translatedObj });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Failed to translate" }, { status: 500 });
  }
}