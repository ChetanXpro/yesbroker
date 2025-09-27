import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hackathon-secret-key";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("yesbroker_token")?.value;

  const protectedPaths = ["/owner", "/renter"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing protected path without token, redirect to home
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If accessing dashboard without token, redirect to home
  if (request.nextUrl.pathname === "/dashboard" && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token) {
    try {
      const userData = jwt.verify(token, JWT_SECRET) as any;

      // If token is expired, clear it and redirect
      if (userData.exp && userData.exp < Date.now() / 1000) {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("yesbroker_token");
        return response;
      }

      // If user is on /dashboard but already has a userType, redirect to their dashboard
      if (request.nextUrl.pathname === "/dashboard" && userData.userType) {
        return NextResponse.redirect(
          new URL(`/${userData.userType}/dashboard`, request.url)
        );
      }

      // If user is accessing protected path
      if (isProtectedPath) {
        // If user doesn't have userType yet, redirect to dashboard for selection
        if (!userData.userType) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // Check if user is accessing the correct path for their type
        const userType = request.nextUrl.pathname.startsWith("/owner")
          ? "owner"
          : "renter";

        if (userData.userType !== userType) {
          return NextResponse.redirect(
            new URL(`/${userData.userType}/dashboard`, request.url)
          );
        }
      }

      // If user has token but no userType and is not on dashboard, redirect to dashboard
      if (!userData.userType && request.nextUrl.pathname !== "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      // Invalid token, clear it and redirect to home
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("yesbroker_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
