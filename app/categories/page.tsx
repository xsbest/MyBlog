import Link from "next/link";
import { cookies } from "next/headers";
import { getAllCategories } from "../../lib/content";
import { USER_COOKIE } from "../../lib/auth";

export default async function CategoriesPage() {
  const store = await cookies();
  const currentUser = store.get(USER_COOKIE)?.value;
  const categories = getAllCategories(currentUser || undefined);

  return (
    <div className="min-h-screen bg-sand">
      <div className="container">
        <header className="page-header">
          <div>
            <p className="hero__eyebrow">分类</p>
            <h1>文章分类</h1>
            <p className="page-header__subtitle">按主题归档内容。</p>
          </div>
        </header>
        <div className="pill-grid">
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
      </div>
    </div>
  );
}
