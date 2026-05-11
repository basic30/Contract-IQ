import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { textsToTranslate, targetLanguage } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const prompt = `Translate the string values inside this JSON object into ${targetLanguage}. 
    Return EXACTLY the same JSON structure, just with the strings translated. 
    Do not translate the JSON keys (like explanation, reasoning, suggestion, or the ID hashes), ONLY translate the text values. 
    Return ONLY valid JSON without any markdown formatting, code blocks, or backticks.
    
    JSON to translate:
    ${JSON.stringify(textsToTranslate)}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1, 
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error("Failed to fetch from Gemini");
    }

    const data = await response.json();
    let translatedTextRaw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translatedTextRaw) {
      throw new Error("No translation returned from Gemini");
    }

    // CRITICAL FIX: Aggressively strip markdown backticks in case Gemini sneaks them in
    translatedTextRaw = translatedTextRaw.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();

    const translatedObject = JSON.parse(translatedTextRaw);

    return NextResponse.json({ translatedText: translatedObject });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json({ error: "Failed to translate" }, { status: 500 });
  }
}