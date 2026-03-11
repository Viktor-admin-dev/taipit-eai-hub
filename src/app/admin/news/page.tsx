"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface NewsPost {
  id: number;
  title: string;
  body: string;
  cta: string | null;
  isPublished: boolean;
  createdAt: string;
  applicationId: number | null;
}

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/news")
      .then((r) => r.json())
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (post: NewsPost) => {
    await fetch("/api/admin/news", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, isPublished: !post.isPublished }),
    });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить пост?")) return;
    await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <nav style={{ color: "#5a6a8a" }} className="text-sm">
        <Link href="/admin" className="hover:text-[#6382ff]">Дашборд</Link>
        <span className="mx-2">→</span>
        <span style={{ color: "#8898b8" }}>Новости</span>
      </nav>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Управление новостями</h1>
        <Link href="/news" target="_blank" className="btn-secondary text-sm">
          Открыть ленту →
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12" style={{ color: "#5a6a8a" }}>
          Нет постов. Они создаются автоматически при подаче заявок.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="card"
              style={{ opacity: post.isPublished ? 1 : 0.6 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: post.isPublished ? "rgba(74,222,128,0.1)" : "rgba(90,106,138,0.15)",
                        color: post.isPublished ? "#4ade80" : "#5a6a8a",
                      }}
                    >
                      {post.isPublished ? "Опубликован" : "Скрыт"}
                    </span>
                    <span className="text-xs" style={{ color: "#5a6a8a" }}>
                      {new Date(post.createdAt).toLocaleString("ru-RU")}
                    </span>
                    {post.applicationId && (
                      <Link
                        href={`/admin/applications/${post.applicationId}`}
                        className="text-xs hover:underline"
                        style={{ color: "#6382ff" }}
                      >
                        Заявка #{post.applicationId}
                      </Link>
                    )}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{post.title}</h3>
                  <p className="text-sm line-clamp-3" style={{ color: "#8898b8" }}>{post.body}</p>
                  {post.cta && (
                    <div className="text-xs mt-2 italic" style={{ color: "#5a6a8a" }}>
                      CTA: {post.cta}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/news/${post.id}`}
                    className="text-sm px-3 py-1.5 rounded-lg text-center whitespace-nowrap"
                    style={{ background: "rgba(99,130,255,0.1)", color: "#6382ff" }}
                  >
                    Редактировать
                  </Link>
                  <button
                    onClick={() => handleToggle(post)}
                    className="text-sm px-3 py-1.5 rounded-lg whitespace-nowrap"
                    style={{
                      background: post.isPublished ? "rgba(90,106,138,0.15)" : "rgba(74,222,128,0.1)",
                      color: post.isPublished ? "#5a6a8a" : "#4ade80",
                    }}
                  >
                    {post.isPublished ? "Скрыть" : "Опубликовать"}
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-sm px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
