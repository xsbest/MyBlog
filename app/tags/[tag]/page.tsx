import Link from "next/link";
import { cookies } from "next/headers";
import { getPostsByTag } from "../../../lib/content";
import { USER_COOKIE } from "../../../lib/auth";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const resolvedParams = await params;
  const tagName = decodeURIComponent(resolvedParams.tag);
  const store = await cookies();
  const currentUser = store.get(USER_COOKIE)?.value;
  const posts = getPostsByTag(tagName, currentUser || undefined);

  return (
    <div className="min-h-screen bg-sand">
      <div className="container">
        <header className="page-header">
          <div>
            <p className="hero__eyebrow">标签</p>
            <h1>{tagName}</h1>
            <p className="page-header__subtitle">共 {posts.length} 篇文章。</p>
          </div>
        </header>
        <div className="list">
          {posts.map((post) => (
            <article key={`${post.categorySlug}-${post.slug}`} className="list__item">
              <div>
                <div className="card__meta">
                  <span>{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
              </div>
              <div className="list__meta">
                <span>{post.readingMinutes} min</span>
                <Link
                  className="text-link"
                  href={`/posts/${encodeURIComponent(
                    post.categorySlug
                  )}/${encodeURIComponent(post.slug)}`}
                >
                  阅读 →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
