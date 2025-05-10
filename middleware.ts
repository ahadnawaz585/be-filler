import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
}

// Configure which paths the middleware should run for
export const config = {
  matcher: ["/user/:path*", "/dashboard/:path*", "/profile/:path*"], // Adjust to match your protected routes
}
