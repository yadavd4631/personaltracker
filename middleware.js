import { NextResponse } from "next/server";

// PIN lock: APP_PIN env var set hai toh har page/API pe login zaroori
export function middleware(req) {
  const pin = process.env.APP_PIN;
  if (!pin) return NextResponse.next(); // PIN set nahi = open mode

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("pt_pin")?.value;
  if (cookie === pin) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized — pehle login karo" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
