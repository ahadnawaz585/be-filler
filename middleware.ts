import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  console.log(`Middleware triggered for: ${request.url}`)

  // Get the token from cookies
  const token = request.cookies.get("userToken")?.value // Replace 'userToken' with your actual cookie name

  // Define protected routes (e.g., user pages)
  const protectedPaths = ["/user", "/dashboard", "/profile"] // Adjust these to your actual protected routes

  // Check if the current path is a protected route
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // If the path is protected and no token is found, redirect to login (or another page)
  if (isProtectedPath && !token) {
    console.log("No token found, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url)) // Redirect to login page
  }

  // If token exists or the path is not protected, proceed with the request
  return NextResponse.next()
}

// Configure which paths the middleware should run for
export const config = {
  matcher: ["/user/:path*", "/dashboard/:path*", "/profile/:path*"], // Adjust to match your protected routes
}
