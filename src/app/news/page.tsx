"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface NewsPost {
  id: number;
  title: string;
  body: string;
  cta: string | null;
  createdAt: string;
}

interface NewsData {
  posts: NewsPost[];
  totalApplications: number;
  totalParticipants: number;
  daysLeft: number;
}

export default function NewsPage() {
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            🔥 Что происходит на конкурсе
          </h1>
          <p style={{ color: "#8898b8" }}>
            Коллеги уже подают идеи — присоединяйтесь!
          </p>

          {/* Stats */}
          {data && (
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: "#6382ff" }}>
                  {data.totalApplications}
                </div>
                <div className="text-sm mt-1" style={{ color: "#8898b8" }}>заявок подано</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: "#4ade80" }}>
                  {data.totalParticipants}
                </div>
                <div className="text-sm mt-1" style={{ color: "#8898b8" }}>участников</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: "#f59e0b" }}>
                  {data.daysLeft}
                </div>
                <div className="text-sm mt-1" style={{ color: "#8898b8" }}>дней до конца</div>
              </div>
            </div>
          )}
        </div>

        {/* Posts feed */}
        {data && data.posts.length > 0 ? (
          <div className="space-y-6">
            {data.posts.map((post) => (
              <article key={post.id} className="card">
                <div className="text-xs mb-2" style={{ color: "#5a6a8a" }}>
                  {new Date(post.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <h2 className="text-xl font-semibold text-white mb-3">{post.title}</h2>
                <div style={{ color: "#8898b8" }} className="text-sm leading-relaxed whitespace-pre-line">
                  {post.body}
                </div>
                {post.cta && (
                  <Link
                    href="/how-to-participate"
                    className="btn-primary inline-block mt-4 text-sm"
                  >
                    {post.cta}
                  </Link>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: "#5a6a8a" }}>
            Пока нет публикаций. Будьте первым участником!
          </div>
        )}

        {/* CTA block */}
        <div
          className="text-center mt-12 p-8 rounded-xl"
          style={{ background: "rgba(99, 130, 255, 0.08)", border: "1px solid rgba(99,130,255,0.15)" }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">💡 А у вас есть идея?</h2>
          <p className="mb-6" style={{ color: "#8898b8" }}>
            Не нужно быть программистом. Просто опишите проблему — мы поможем с решением.
          </p>
          <Link href="/how-to-participate" className="btn-primary !px-8 !py-3">
            Подать заявку за 10 минут →
          </Link>
        </div>
      </div>
    </div>
  );
}
