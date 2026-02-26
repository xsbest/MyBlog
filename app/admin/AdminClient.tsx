"use client";

import { useMemo, useState } from "react";
import type { PostMeta } from "../../lib/content";

const emptyForm = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  category: "general",
  tags: "",
  summary: "",
  slug: "",
  format: "md",
  status: "published",
  content: "",
};

type FormState = typeof emptyForm;

type AdminClientProps = {
  posts: PostMeta[];
};

export default function AdminClient({ posts }: AdminClientProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "draft" | "deleted">("all");
  const [query, setQuery] = useState<string>("");

  const sortedPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (filter === "draft" && post.status !== "draft") return false;
      if (filter === "deleted" && !post.deleted) return false;
      if (!normalized) return true;
      return (
        post.title.toLowerCase().includes(normalized) ||
        post.summary.toLowerCase().includes(normalized) ||
        post.category.toLowerCase().includes(normalized) ||
        post.tags.some((tag) => tag.toLowerCase().includes(normalized))
      );
    });
  }, [posts, filter, query]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadPost = async (categorySlug: string, slug: string) => {
    setStatus("加载文章中...");
    const res = await fetch(
      `/api/admin/posts/${encodeURIComponent(categorySlug)}/${encodeURIComponent(
        slug
      )}`
    );
    if (!res.ok) {
      setStatus("加载失败");
      return;
    }
    const data = await res.json();
    const post = data.post;
    setSelected(`${categorySlug}/${slug}`);
    setForm({
      title: post.title,
      date: post.date,
      category: post.categorySlug,
      tags: (post.tags || []).join(","),
      summary: post.summary,
      slug: post.slug,
      format: post.format || "md",
      status: post.status || "published",
      content: post.content,
    });
    setStatus("已加载");
  };

  const resetForm = () => {
    setSelected(null);
    setForm(emptyForm);
    setStatus("");
  };

  const save = async () => {
    if (!form.title || !form.slug || !form.category) {
      setStatus("标题、分类、Slug 不能为空");
      return;
    }
    setIsSaving(true);
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      prev: selected
        ? {
            category: selected.split("/")[0],
            slug: selected.split("/")[1],
          }
        : null,
      deleted: false,
    };
    const res = await fetch("/api/admin/posts", {
      method: selected ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(`保存失败: ${data.error || res.statusText}`);
    } else {
      setStatus("保存成功，请刷新页面查看最新列表");
    }
    setIsSaving(false);
  };

  const remove = async () => {
    if (!selected) return;
    setIsDeleting(true);
    const [category, slug] = selected.split("/");
    const res = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, slug }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(`删除失败: ${data.error || res.statusText}`);
    } else {
      setStatus("删除成功，请刷新页面查看最新列表");
      resetForm();
    }
    setIsDeleting(false);
  };

  const restore = async () => {
    if (!selected) return;
    const [category, slug] = selected.split("/");
    const res = await fetch("/api/admin/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, slug }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(`恢复失败: ${data.error || res.statusText}`);
    } else {
      setStatus("已恢复，请刷新页面查看最新列表");
    }
  };

  const permanentRemove = async () => {
    if (!selected) return;
    setIsDeleting(true);
    const [category, slug] = selected.split("/");
    const res = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, slug, permanent: true }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(`永久删除失败: ${data.error || res.statusText}`);
    } else {
      setStatus("已永久删除，请刷新页面查看最新列表");
      resetForm();
    }
    setIsDeleting(false);
  };

  return (
    <div className="admin">
      <div className="admin__sidebar">
        <div className="admin__header">
          <h2>文章管理</h2>
          <button className="btn btn--ghost" onClick={resetForm}>
            新建文章
          </button>
        </div>
        <div className="admin__filters">
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "draft" | "deleted")
            }
          >
            <option value="all">全部</option>
            <option value="draft">草稿</option>
            <option value="deleted">已删除</option>
          </select>
          <input
            placeholder="搜索标题/标签"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="admin__list">
          {sortedPosts.map((post) => (
            <button
              key={`${post.categorySlug}/${post.slug}`}
              className={`admin__item ${
                selected === `${post.categorySlug}/${post.slug}` ? "is-active" : ""
              }`}
              onClick={() => loadPost(post.categorySlug, post.slug)}
            >
              <span>{post.title}</span>
              <small>
                {post.category} {post.status === "draft" ? "· 草稿" : ""}{" "}
                {post.deleted ? "· 已删除" : ""}
              </small>
            </button>
          ))}
        </div>
      </div>

      <div className="admin__editor">
        <div className="admin__form">
          <label>
            标题
            <input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </label>
          <label>
            日期
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </label>
          <label>
            分类（用于目录）
            <input
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </label>
          <label>
            Slug（文件名）
            <input
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
            />
          </label>
          <label>
            标签（逗号分隔）
            <input
              value={form.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
            />
          </label>
          <label>
            摘要
            <textarea
              value={form.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
            />
          </label>
          <label>
            格式
            <select
              value={form.format}
              onChange={(e) => handleChange("format", e.target.value)}
            >
              <option value="md">Markdown</option>
              <option value="mdx">MDX</option>
            </select>
          </label>
          <label>
            状态
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <label>
            正文
            <textarea
              className="admin__content"
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
            />
          </label>
          <div className="admin__actions">
            <button className="btn btn--primary" onClick={save} disabled={isSaving}>
              {isSaving ? "保存中..." : "保存"}
            </button>
            <button
              className="btn btn--ghost"
              onClick={remove}
              disabled={!selected || isDeleting}
            >
              {isDeleting ? "删除中..." : "删除"}
            </button>
            <button
              className="btn btn--ghost"
              onClick={restore}
              disabled={!selected}
            >
              恢复
            </button>
            <button
              className="btn btn--danger"
              onClick={permanentRemove}
              disabled={!selected || !posts.find((p) => `${p.categorySlug}/${p.slug}` === selected)?.deleted || isDeleting}
              title="仅对已删除文章可用"
            >
              永久删除
            </button>
            <span className="admin__status">{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
