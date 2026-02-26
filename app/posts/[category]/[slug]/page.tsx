import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { compileMDX } from "next-mdx-remote/rsc";
import { getPostByCategoryAndSlug } from "../../../../lib/content";
import { cookies } from "next/headers";
import { USER_COOKIE } from "../../../../lib/auth";

export default async function PostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const store = await cookies();
  const resolvedParams = await params;
  const currentUser = store.get(USER_COOKIE)?.value;
  const category = decodeURIComponent(resolvedParams.category);
  const slug = decodeURIComponent(resolvedParams.slug);
  const post = getPostByCategoryAndSlug(
    category,
    slug,
    currentUser || undefined
  );
  if (!post) {
    notFound();
  }

  let content: React.ReactNode;
  if (post.format === "mdx") {
    const compiled = await compileMDX({
      source: post.content,
      options: { parseFrontmatter: false },
      components: {},
    });
    content = compiled.content;
  } else {
    const html = marked.parse(post.content) as string;
    content = (
      <div dangerouslySetInnerHTML={{ __html: html }} />
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <div className="container">
        <div className="crumbs">
          <Link className="text-link" href="/posts">
            全部文章
          </Link>
          <span>/</span>
          <span>{post.category}</span>
        </div>
        <article className="article markdown">
          <header className="article__header">
            <p className="hero__eyebrow">{post.category}</p>
            <h1>{post.title}</h1>
            <div className="article__meta">
              <span>{post.date}</span>
              <span>{post.readingMinutes} min</span>
              <span>{post.tags.join(" / ")}</span>
            </div>
          </header>
          <div className="article__content">{content}</div>
        </article>
      </div>
    </div>
  );
}
