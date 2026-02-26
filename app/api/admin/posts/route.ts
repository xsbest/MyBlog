import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  USER_COOKIE,
  isAuthorizedCookie,
} from "../../../../lib/auth";

const CONTENT_ROOT = path.join(process.cwd(), "content", "articles");

function toFrontmatter(data: {
  title: string;
  date: string;
  category: string;
  author: string;
  tags: string[];
  summary: string;
  status: "published" | "draft";
  deleted: boolean;
}) {
  const tags = data.tags.map((tag) => `"${tag}"`).join(", ");
  return [
    "---",
    `title: "${data.title}"`,
    `date: "${data.date}"`,
    `category: "${data.category}"`,
    `author: "${data.author}"`,
    `tags: [${tags}]`,
    `status: "${data.status}"`,
    `deleted: "${data.deleted ? "true" : "false"}"`,
    `summary: "${data.summary}"`,
    "---",
    "",
  ].join("\n");
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getFilePath(category: string, slug: string, format: string) {
  const safeCategory = category.trim();
  const safeSlug = slug.trim();
  const ext = format === "mdx" ? "mdx" : "md";
  return path.join(CONTENT_ROOT, safeCategory, `${safeSlug}.${ext}`);
}

function parseFrontmatter(raw: string) {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("---")) return { data: {}, body: raw };
  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) return { data: {}, body: raw };
  const header = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 4).trimStart();
  const data: Record<string, string> = {};
  for (const line of header.split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^\"|\"$/g, "");
    data[key] = value;
  }
  return { data, body };
}

async function getCurrentUser() {
  const store = await cookies();
  const authValue = store.get(AUTH_COOKIE)?.value;
  const userValue = store.get(USER_COOKIE)?.value;
  if (!isAuthorizedCookie(authValue, userValue)) return null;
  return userValue || null;
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {
    title,
    date,
    category,
    tags,
    summary,
    slug,
    format,
    content,
    status,
    deleted,
  } = body;
  if (!title || !category || !slug) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const dir = path.join(CONTENT_ROOT, category.trim());
  ensureDir(dir);
  const filePath = getFilePath(category, slug, format);
  if (fs.existsSync(filePath)) {
    return NextResponse.json({ error: "already_exists" }, { status: 409 });
  }
  const frontmatter = toFrontmatter({
    title,
    date,
    category,
    author: currentUser,
    tags: Array.isArray(tags) ? tags : [],
    summary,
    status: status === "draft" ? "draft" : "published",
    deleted: deleted === true,
  });
  fs.writeFileSync(filePath, `${frontmatter}${content || ""}`);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {
    title,
    date,
    category,
    tags,
    summary,
    slug,
    format,
    content,
    prev,
    status,
    deleted,
  } = body;
  if (!title || !category || !slug) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const dir = path.join(CONTENT_ROOT, category.trim());
  ensureDir(dir);

  if (prev && (prev.category !== category || prev.slug !== slug)) {
    const prevPath = path.join(CONTENT_ROOT, prev.category, `${prev.slug}.md`);
    const prevMdx = path.join(CONTENT_ROOT, prev.category, `${prev.slug}.mdx`);
    const prevFilePath = fs.existsSync(prevMdx) ? prevMdx : prevPath;
    if (fs.existsSync(prevFilePath)) {
      const raw = fs.readFileSync(prevFilePath, "utf8");
      const { data } = parseFrontmatter(raw);
      const owner = (data.author as string) || "daniel";
      if (owner !== currentUser) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      fs.unlinkSync(prevFilePath);
    }
  }

  const filePath = getFilePath(category, slug, format);
  const frontmatter = toFrontmatter({
    title,
    date,
    category,
    author: currentUser,
    tags: Array.isArray(tags) ? tags : [],
    summary,
    status: status === "draft" ? "draft" : "published",
    deleted: deleted === true,
  });
  fs.writeFileSync(filePath, `${frontmatter}${content || ""}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { category, slug, permanent } = body;
  if (!category || !slug) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const mdPath = path.join(CONTENT_ROOT, category, `${slug}.md`);
  const mdxPath = path.join(CONTENT_ROOT, category, `${slug}.mdx`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, body: content } = parseFrontmatter(raw);
  const owner = (data.author as string) || "daniel";
  if (owner !== currentUser) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (permanent === true) {
    fs.unlinkSync(filePath);
    return NextResponse.json({ ok: true, permanent: true });
  }
  const frontmatter = toFrontmatter({
    title: data.title || slug,
    date: data.date || new Date().toISOString().slice(0, 10),
    category: data.category || category,
    author: owner,
    tags: (data.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    summary: data.summary || "",
    status: (data.status as "published" | "draft") || "draft",
    deleted: true,
  });
  fs.writeFileSync(filePath, `${frontmatter}${content}`);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { category, slug } = body;
  if (!category || !slug) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const mdPath = path.join(CONTENT_ROOT, category, `${slug}.md`);
  const mdxPath = path.join(CONTENT_ROOT, category, `${slug}.mdx`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, body: content } = parseFrontmatter(raw);
  const owner = (data.author as string) || "daniel";
  if (owner !== currentUser) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const frontmatter = toFrontmatter({
    title: data.title || slug,
    date: data.date || new Date().toISOString().slice(0, 10),
    category: data.category || category,
    author: owner,
    tags: (data.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    summary: data.summary || "",
    status: (data.status as "published" | "draft") || "draft",
    deleted: false,
  });
  fs.writeFileSync(filePath, `${frontmatter}${content}`);
  return NextResponse.json({ ok: true });
}
