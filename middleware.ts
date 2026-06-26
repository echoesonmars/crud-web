import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("session-token")?.value

  // Define public paths that don't need auth
  const isLoginPage = pathname === "/login"
  const isAuthApi = pathname.startsWith("/api/auth")
  const isStaticFile = pathname.includes(".") || pathname.startsWith("/_next")

  if (!token && !isLoginPage && !isAuthApi && !isStaticFile) {
    // Redirect to login page if unauthenticated
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (token && isLoginPage) {
    // Redirect to dashboard (home) if already logged in and visiting /login
    const homeUrl = new URL("/", request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

// Apply middleware to all routes except static assets
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|data/|placeholder.svg).*)"],
}
