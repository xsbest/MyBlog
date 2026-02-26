import Link from "next/link";
import { cookies } from "next/headers";
import {
  getAllPosts,
  getAllCategories,
  getAllTags,
  getCounts,
} from "../../lib/content";
import { USER_COOKIE } from "../../lib/auth";

function highlightText(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "gi");
  const parts = text.split(regex);
  const matches = text.match(regex);
  if (!matches) return text;
  return parts.flatMap((part, index) => {
    const hit = matches[index];
    if (!hit) return [part];
    return [
      part,
      <mark key={`${part}-${index}`} className="search-hit">
        {hit}
      </mark>,
    ];
  });
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const store = await cookies();
  const currentUser = store.get(USER_COOKIE)?.value;
  const query = searchParams?.q ?? "";
  const posts = getAllPosts({
    query,
    searchBody: true,
    author: currentUser || undefined,
  });
  const categories = getAllCategories(currentUser || undefined);
  const tags = getAllTags(currentUser || undefined);
  const { draftCount, deletedCount } = getCounts(currentUser || undefined);

  return (
    <div className="min-h-screen bg-sand">
      <div className="container">
        <header className="page-header">
          <div>
            <p className="hero__eyebrow">文章列表</p>
            <h1>全部文章</h1>
            <p className="page-header__subtitle">
              聚焦真实项目的调试与落地经验。
            </p>
            <div className="public-hint">
              后台还有 {draftCount} 篇草稿 · {deletedCount} 篇已删除（公开页不展示）
            </div>
          </div>
          <form className="search" action="/posts" method="get">
            <input
              name="q"
              placeholder="搜索标题、摘要、标签"
              defaultValue={query}
            />
            <button className="btn btn--primary" type="submit">
              搜索
            </button>
          </form>
          <div className="page-header__filters">
            <Link className="text-link" href="/categories">
              分类
            </Link>
            <Link className="text-link" href="/tags">
              标签
            </Link>
          </div>
        </header>

        <div className="pill-grid pill-grid--compact">
          {categories.map((item) => (
            <Link
              key={item.slug}
              className="pill"
              href={`/categories/${encodeURIComponent(item.slug)}`}
            >
              <span>{item.category}</span>
              <span className="pill__count">{item.count}</span>
            </Link>
          ))}
        </div>

        <div className="pill-grid pill-grid--compact">
          {tags.map((item) => (
            <Link
              key={item.tag}
              className="pill pill--ghost"
              href={`/tags/${encodeURIComponent(item.tag)}`}
            >
              <span>{item.tag}</span>
              <span className="pill__count">{item.count}</span>
            </Link>
          ))}
        </div>

        <div className="list">
          {posts.length === 0 && (
            <div className="empty">没有匹配的文章。</div>
          )}
          {posts.map((post) => (
            <article key={`${post.categorySlug}-${post.slug}`} className="list__item">
              <div>
                <div className="card__meta">
                  <span>{post.category}</span>
                  <span>{post.date}</span>
                </div>
                {post.status === "draft" && <span className="badge">草稿</span>}
                <h3>{highlightText(post.title, query)}</h3>
                <p>{highlightText(post.summary, query)}</p>
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
