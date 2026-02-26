import { NextResponse } from "next/server";
import { getAllPosts } from "../../../lib/content";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  USER_COOKIE,
  isAuthorizedCookie,
} from "../../../lib/auth";

export async function GET(req: Request) {
  const store = await cookies();
  const authValue = store.get(AUTH_COOKIE)?.value;
  const userValue = store.get(USER_COOKIE)?.value;
  if (!isAuthorizedCookie(authValue, userValue)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const posts = getAllPosts({
    query: q,
    searchBody: true,
    author: userValue || undefined,
  });
  return NextResponse.json({ posts });
}
