import Link from "next/link";
import { cookies } from "next/headers";
import { getAllPosts, getCounts } from "../lib/content";
import { USER_COOKIE } from "../lib/auth";

export default async function Home() {
  const store = await cookies();
  const currentUser = store.get(USER_COOKIE)?.value;
  const posts = getAllPosts({ author: currentUser || undefined });
  const featured = posts[0];
  const { draftCount, deletedCount } = getCounts(currentUser || undefined);

  return (
    <div className="min-h-screen bg-sand">
      <header className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Daniel Xiong · 蛋妞的博客</p>
          <h1>个人技术笔记与项目实战</h1>
          <p className="hero__subtitle">
            记录从需求到落地的关键技术路径，聚焦 Flutter / Web / 全栈调试与稳定性。
          </p>
          <div className="public-hint">
            后台还有 {draftCount} 篇草稿 · {deletedCount} 篇已删除（公开页不展示）
          </div>
          <div className="hero__actions">
            <Link className="btn btn--primary" href="/posts">
              浏览文章
            </Link>
            <Link className="btn btn--ghost" href="/categories">
              分类
            </Link>
            <Link className="btn btn--ghost" href="/tags">
              标签
            </Link>
            <Link className="btn btn--ghost" href="/admin">
              管理后台
            </Link>
          </div>
        </div>
        <div className="hero__card">
          <p className="hero__card-label">最新文章</p>
          {featured ? (
            <div className="hero__card-body">
              <h2>{featured.title}</h2>
              <p>{featured.summary}</p>
              <div className="hero__meta">
                <span>{featured.category}</span>
                <span>{featured.date}</span>
                <span>{featured.readingMinutes} min</span>
              </div>
              <Link
                className="text-link"
                href={`/posts/${encodeURIComponent(
                  featured.categorySlug
                )}/${encodeURIComponent(featured.slug)}`}
              >
                阅读全文 →
              </Link>
            </div>
          ) : (
            <p className="hero__empty">暂时还没有文章。</p>
          )}
        </div>
      </header>

      <main className="container">
        <section className="section">
          <div className="section__header">
            <h3>最新发布</h3>
            <Link className="text-link" href="/posts">
              查看全部 →
            </Link>
          </div>
          <div className="grid">
            {posts.slice(0, 6).map((post) => (
              <article key={`${post.categorySlug}-${post.slug}`} className="card">
                <div className="card__body">
                  <div className="card__meta">
                    <span>{post.category}</span>
                    <span>{post.date}</span>
                  </div>
                  <h4>{post.title}</h4>
                  <p>{post.summary}</p>
                </div>
                <div className="card__footer">
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
        </section>
      </main>
    </div>
  );
}
