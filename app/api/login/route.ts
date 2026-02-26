import { NextResponse } from "next/server";
import { AUTH_USER, AUTH_PASS, AUTH_COOKIE, USER_COOKIE } from "../../../lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = body?.username as string;
  const password = body?.password as string;

  if (username !== AUTH_USER || password !== AUTH_PASS) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, user: AUTH_USER });
  res.cookies.set(AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  res.cookies.set(USER_COOKIE, AUTH_USER, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
