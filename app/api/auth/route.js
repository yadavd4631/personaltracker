import { NextResponse } from "next/server";

export async function POST(req) {
  const { pin } = await req.json();

  // PIN configure hi nahi hai toh open mode
  if (!process.env.APP_PIN) return NextResponse.json({ ok: true });

  if (pin === process.env.APP_PIN) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("pt_pin", pin, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 120, // 120 din — poore mission ke liye kaafi
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ ok: false, error: "Galat PIN" }, { status: 401 });
}
