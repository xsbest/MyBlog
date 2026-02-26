import fs from "node:fs";
import path from "node:path";

export type PostMeta = {
  title: string;
  date: string;
  category: string;
  author: string;
  tags: string[];
  summary: string;
  status: "published" | "draft";
  deleted: boolean;
  slug: string;
  categorySlug: string;
  readingMinutes: number;
  format: "md" | "mdx";
};

export type Post = PostMeta & {
  content: string;
};

const CONTENT_ROOT = path.join(
  process.cwd(),
  "content",
  "articles"
);

function parseFrontmatter(raw: string) {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("---")) {
    return { data: {}, body: raw };
  }
  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { data: {}, body: raw };
  }
  const header = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 4).trimStart();
  const data: Record<string, string | string[]> = {};
  for (const line of header.split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1).trim();
      data[key] = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.replace(/^"|"$/g, ""));
    } else {
      data[key] = value.replace(/^"|"$/g, "");
    }
  }
  return { data, body };
}

function estimateReadingMinutes(text: string) {
  const words = text
    .replace(/\s+/g, " ")
    .trim();
  if (!words) return 1;
  const wordCount = words.split(" ").length;
  return Math.max(1, Math.round(wordCount / 220));
}

function listMarkdownFiles(dir: string) {
  if (!fs.existsSync(dir)) return [] as string[];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function matchesQuery(post: PostMeta, query?: string, body?: string) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const baseMatch =
    post.title.toLowerCase().includes(q) ||
    post.summary.toLowerCase().includes(q) ||
    post.category.toLowerCase().includes(q) ||
    post.tags.some((tag) => tag.toLowerCase().includes(q));
  if (baseMatch) return true;
  if (!body) return false;
  return body.toLowerCase().includes(q);
}

export function getAllPosts(options?: {
  includeDrafts?: boolean;
  includeDeleted?: boolean;
  query?: string;
  searchBody?: boolean;
  author?: string;
}): PostMeta[] {
  const files = listMarkdownFiles(CONTENT_ROOT);
  const posts = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, body } = parseFrontmatter(raw);
    const relative = path.relative(CONTENT_ROOT, filePath);
    const parts = relative.split(path.sep);
    const categorySlug = parts.length > 1 ? parts[0] : "general";
    const slug = path.basename(filePath, path.extname(filePath));
    const format = path.extname(filePath) === ".mdx" ? "mdx" : "md";
    const title = (data.title as string) || slug;
    const date = (data.date as string) || "";
    const category = (data.category as string) || categorySlug;
    const author = (data.author as string) || "daniel";
    const tags = (data.tags as string[]) || [];
    const summary = (data.summary as string) || body.split("\n")[0];
    const status = ((data.status as string) || "published") as
      | "published"
      | "draft";
    const deleted = (data.deleted as string) === "true";
    const meta = {
      title,
      date,
      category,
      author,
      tags,
      summary,
      status,
      deleted,
      slug,
      categorySlug,
      readingMinutes: estimateReadingMinutes(body),
      format,
    } as PostMeta;
    return { meta, body };
  });
  const includeDrafts = options?.includeDrafts ?? false;
  const includeDeleted = options?.includeDeleted ?? false;
  const authorFilter = options?.author?.trim().toLowerCase();
  const filtered = posts
    .filter(({ meta }) => {
      if (!includeDrafts && meta.status === "draft") return false;
      if (!includeDeleted && meta.deleted) return false;
      if (authorFilter && meta.author.toLowerCase() !== authorFilter) return false;
      return true;
    })
    .filter(({ meta, body }) => {
      return matchesQuery(meta, options?.query, options?.searchBody ? body : undefined);
    })
    .map(({ meta }) => meta);
  return filtered.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date < b.date ? 1 : -1;
  });
}

export function getPostByCategoryAndSlug(
  category: string,
  slug: string,
  author?: string
): Post | null {
  if (!category || !slug) return null;
  const mdPath = path.join(CONTENT_ROOT, category, `${slug}.md`);
  const mdxPath = path.join(CONTENT_ROOT, category, `${slug}.mdx`);
  let filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(filePath)) {
    const categoryDir = path.join(CONTENT_ROOT, category);
    const candidateFiles = fs.existsSync(categoryDir)
      ? listMarkdownFiles(categoryDir)
      : listMarkdownFiles(CONTENT_ROOT);
    const match = candidateFiles.find(
      (file) => path.basename(file, path.extname(file)) === slug
    );
    if (!match) return null;
    filePath = match;
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const title = (data.title as string) || slug;
  const date = (data.date as string) || "";
  const categoryName = (data.category as string) || category;
  const postAuthor = (data.author as string) || "daniel";
  const tags = (data.tags as string[]) || [];
  const summary = (data.summary as string) || body.split("\n")[0];
  const format = path.extname(filePath) === ".mdx" ? "mdx" : "md";
  const status = ((data.status as string) || "published") as
    | "published"
    | "draft";
  const deleted = (data.deleted as string) === "true";
  if (author && postAuthor.toLowerCase() !== author.toLowerCase()) {
    return null;
  }
  return {
    title,
    date,
    category: categoryName,
    author: postAuthor,
    tags,
    summary,
    status,
    deleted,
    slug,
    categorySlug: category,
    readingMinutes: estimateReadingMinutes(body),
    content: body,
    format,
  };
}

export function getAllCategories(author?: string) {
  const posts = getAllPosts({ author });
  const map = new Map<string, { category: string; count: number }>();
  for (const post of posts) {
    const key = post.categorySlug;
    if (!map.has(key)) {
      map.set(key, { category: post.category, count: 0 });
    }
    map.get(key)!.count += 1;
  }
  return Array.from(map.entries()).map(([slug, meta]) => ({
    slug,
    category: meta.category,
    count: meta.count,
  }));
}

export function getAllTags(author?: string) {
  const posts = getAllPosts({ author });
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(map.entries()).map(([tag, count]) => ({
    tag,
    count,
  }));
}

export function getPostsByCategory(categorySlug: string, author?: string) {
  return getAllPosts({ author }).filter(
    (post) => post.categorySlug === categorySlug
  );
}

export function getPostsByTag(tag: string, author?: string) {
  return getAllPosts({ author }).filter((post) => post.tags.includes(tag));
}

export function getAllPostsForAdmin(author?: string) {
  return getAllPosts({ includeDrafts: true, includeDeleted: true, author });
}

export function getCounts(author?: string) {
  const posts = getAllPosts({
    includeDrafts: true,
    includeDeleted: true,
    author,
  });
  const draftCount = posts.filter((post) => post.status === "draft").length;
  const deletedCount = posts.filter((post) => post.deleted).length;
  return { draftCount, deletedCount };
}
