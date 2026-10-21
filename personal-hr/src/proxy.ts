import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt, SESSION_TTL_MS } from "@/lib/auth/token";

const protectedRoutes = ["/dashboard", "/employee", "/projects", "/leave", "/overtime", "/payroll", "/documents"];
const publicRoutes = ["/login"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  const res = NextResponse.next();

  // Sliding session: an active user keeps a fresh 1 day window, an idle
  // session dies after 1 day.
  if (session?.userId) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const token = await encrypt({
      userId: session.userId,
      role: session.role,
      expiresAt,
      sv: session.sv ?? 0,
    });

    res.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
