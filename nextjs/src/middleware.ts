import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"])
const isRedirectedRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/sign-in(.*)",
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()

  if (isRedirectedRoute(req)) {
    if (auth().userId) {
      const url = new URL('/dashboard', req.url);
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
