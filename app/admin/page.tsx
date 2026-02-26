import AdminClient from "./AdminClient";
import { getAllPostsForAdmin } from "../../lib/content";
import { cookies } from "next/headers";
import { USER_COOKIE } from "../../lib/auth";

export default async function AdminPage() {
  const store = await cookies();
  const currentUser = store.get(USER_COOKIE)?.value;
  const posts = getAllPostsForAdmin(currentUser || undefined);

  return (
    <div className="min-h-screen bg-sand">
      <div className="container">
        <header className="page-header">
          <div>
            <p className="hero__eyebrow">管理</p>
            <h1>内容管理台</h1>
            <p className="page-header__subtitle">新增、编辑、删除文章内容。</p>
          </div>
        </header>
        <AdminClient posts={posts} />
      </div>
    </div>
  );
}
