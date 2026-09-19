import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, category, message } = body;

    if (!rating || !category || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || "Unknown";

    const feedback = {
      id: "mock-" + Date.now(),
      rating,
      category,
      message,
      userAgent,
      createdAt: new Date(),
    };

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error: any) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
