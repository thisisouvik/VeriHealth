import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROK_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = {
      role: "system",
      content: `You are the VeriHealth Support AI (powered by Groq). 
You are a helpful, concise assistant embedded in the VeriHealth application.
VeriHealth is a Zero-Knowledge health credential network built on the Midnight blockchain.
Key concepts:
- 1 AM Wallet: A browser extension required to sign Zero-Knowledge proofs on Midnight (Preprod network).
- Zero-Knowledge (ZK): Patient data remains locally in their wallet; only a cryptographic commitment (hash) is stored on-chain.
- Issuers: Registered hospitals/clinics that issue credentials (like COVID-19 or Allergy records) to patients.
- Verifiers: Entities (like airlines or employers) that request ZK proofs from patients without seeing raw data.

Keep your answers short, friendly, and helpful. Format with clear spacing. If you don't know something about the platform, suggest checking the FAQ tab.`,
    };

    const payload = {
      model: "openai/gpt-oss-20b",
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 300,
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json(
        { error: "Failed to communicate with AI" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
