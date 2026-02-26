import { NextResponse } from "next/server";
import { getAllTags } from "../../../lib/content";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  USER_COOKIE,
  isAuthorizedCookie,
} from "../../../lib/auth";

export async function GET() {
  const store = await cookies();
  const authValue = store.get(AUTH_COOKIE)?.value;
  const userValue = store.get(USER_COOKIE)?.value;
  if (!isAuthorizedCookie(authValue, userValue)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ tags: getAllTags(userValue || undefined) });
}
