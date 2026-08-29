import { NextRequest, NextResponse } from "next/server";

/**
 * Protects the /deploy route — only accessible with the correct DEPLOY_SECRET
 * passed as a query parameter: /deploy?key=<DEPLOY_SECRET>
 *
 * This prevents anyone from accidentally triggering the contract deployment.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/deploy")) {
    const secret = process.env.DEPLOY_SECRET?.trim();
    const provided = searchParams.get("key")?.trim();

    // If secret is configured and the key doesn't match, block access
    if (secret && provided !== secret) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>403 – Access Denied</title>
  <style>
    body { background: #060b14; color: #94a3b8; font-family: monospace; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .box { text-align: center; }
    h1 { font-size: 3rem; color: #2FBF9F; margin: 0 0 0.5rem; }
    p { font-size: 0.9rem; opacity: 0.6; }
  </style>
</head>
<body>
  <div class="box">
    <h1>403</h1>
    <p>Access Denied — Deploy key required.</p>
  </div>
</body>
</html>`,
        {
          status: 403,
          headers: { "Content-Type": "text/html" },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/deploy/:path*"],
};
