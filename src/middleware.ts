import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple hash function for visitor identification
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only track page visits, not API calls or static assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Create visitor hash from IP and User-Agent for anonymization
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const visitorHash = simpleHash(`${ip}-${userAgent}`);

  // Record the visit asynchronously (non-blocking)
  const baseUrl = request.nextUrl.origin;

  // Use edge-compatible fetch to record visit
  // This runs in the background and doesn't block the response
  fetch(`${baseUrl}/api/analytics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pagePath: pathname,
      visitorHash,
    }),
  }).catch(() => {
    // Silently fail - analytics shouldn't break the site
  });

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (static files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
