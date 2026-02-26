import { NextResponse } from "next/server";
import { getPostByCategoryAndSlug } from "../../../../../lib/content";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  USER_COOKIE,
  isAuthorizedCookie,
} from "../../../../../lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { category: string; slug: string } }
) {
  const store = await cookies();
  const authValue = store.get(AUTH_COOKIE)?.value;
  const userValue = store.get(USER_COOKIE)?.value;
  if (!isAuthorizedCookie(authValue, userValue)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const category = decodeURIComponent(params.category);
  const slug = decodeURIComponent(params.slug);
  const post = getPostByCategoryAndSlug(
    category,
    slug,
    userValue || undefined
  );
  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}
