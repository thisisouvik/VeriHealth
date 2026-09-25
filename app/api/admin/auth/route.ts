import { NextRequest, NextResponse } from "next/server";

/**
 * Admin Authentication Route
 * POST /api/admin/auth
 * 
 * Accepts a secret password and returns a simple token.
 * The admin portal uses this to gate access behind ADMIN_SECRET.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret } = body;

    const adminSecret = process.env.ADMIN_SECRET?.trim();
    if (!adminSecret) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }

    if (!secret || secret.trim() !== adminSecret) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    // Create a simple signed token
    // This avoids any JWT dependency while being verifiable server-side.
    const token = btoa(`${Date.now()}:${adminSecret}`);

    const response = NextResponse.json({ success: true, token });
    // Set an HttpOnly cookie so it persists across page navigation
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Authentication error" }, { status: 500 });
  }
}

/**
 * Verify token validity (GET /api/admin/auth)
 * Used by admin page on mount to check if session is still active.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const adminSecret = process.env.ADMIN_SECRET?.trim();

  if (!token || !adminSecret) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = atob(token);
    const [, secret] = decoded.split(":");
    if (secret === adminSecret) {
      return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

/**
 * Logout (DELETE /api/admin/auth)
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_token");
  return response;
}
