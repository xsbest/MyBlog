import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPostByCategoryAndSlug } from "../../../../../../lib/content";
import {
  AUTH_COOKIE,
  USER_COOKIE,
  isAuthorizedCookie,
} from "../../../../../../lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ category: string; slug: string }> }
) {
  const store = await cookies();
  const authValue = store.get(AUTH_COOKIE)?.value;
  const userValue = store.get(USER_COOKIE)?.value;
  if (!isAuthorizedCookie(authValue, userValue)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category);
  const slug = decodeURIComponent(resolvedParams.slug);
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
