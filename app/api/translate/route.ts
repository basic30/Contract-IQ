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

    // We ask Gemini to translate the values of the JSON object, but keep the IDs/keys intact
    const prompt = `Translate the string values inside this JSON object into ${targetLanguage}. 
    Return EXACTLY the same JSON structure, just with the strings translated. 
    Do not translate the JSON keys (like explanation, reasoning, suggestion, or the ID hashes), ONLY translate the text values. 
    Return ONLY valid JSON.
    
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
            responseMimeType: "application/json" // Forces Gemini to return a clean JSON object
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
    const translatedTextRaw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translatedTextRaw) {
      throw new Error("No translation returned from Gemini");
    }

    // Parse the returned JSON string back into an object
    const translatedObject = JSON.parse(translatedTextRaw);

    return NextResponse.json({ translatedText: translatedObject });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json({ error: "Failed to translate" }, { status: 500 });
  }
}