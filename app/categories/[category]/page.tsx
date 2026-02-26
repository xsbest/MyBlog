import Link from "next/link";
import { cookies } from "next/headers";
import { getPostsByCategory, getAllCategories } from "../../../lib/content";
import { USER_COOKIE } from "../../../lib/auth";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const store = await cookies();
  const resolvedParams = await params;
  const currentUser = store.get(USER_COOKIE)?.value;
  const posts = getPostsByCategory(
    resolvedParams.category,
    currentUser || undefined
  );
  const categoryMeta = getAllCategories(currentUser || undefined).find(
    (item) => item.slug === resolvedParams.category
  );
  const title = categoryMeta?.category ?? resolvedParams.category;

  return (
    <div className="min-h-screen bg-sand">
      <div className="container">
        <header className="page-header">
          <div>
            <p className="hero__eyebrow">分类</p>
            <h1>{title}</h1>
            <p className="page-header__subtitle">
              共 {posts.length} 篇文章。
            </p>
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
