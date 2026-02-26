import Link from "next/link";
import { cookies } from "next/headers";
import { getAllTags } from "../../lib/content";
import { USER_COOKIE } from "../../lib/auth";

export default async function TagsPage() {
  const store = await cookies();
  const currentUser = store.get(USER_COOKIE)?.value;
  const tags = getAllTags(currentUser || undefined);

  return (
    <div className="min-h-screen bg-sand">
      <div className="container">
        <header className="page-header">
          <div>
            <p className="hero__eyebrow">标签</p>
            <h1>主题标签</h1>
            <p className="page-header__subtitle">按标签聚合内容。</p>
          </div>
        </header>
        <div className="pill-grid">
          {tags.map((item) => (
            <Link
              key={item.tag}
              className="pill"
              href={`/tags/${encodeURIComponent(item.tag)}`}
            >
              <span>{item.tag}</span>
              <span className="pill__count">{item.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
