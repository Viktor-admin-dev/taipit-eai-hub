"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useForumUser, ForumLoginForm } from "@/components/ForumAuth";

interface TopicDetail {
  id: number;
  title: string;
  body: string;
  category: string;
  status: string;
  isPinned: boolean;
  createdAt: string;
  author: string;
  authorRole: string;
  authorDivision?: string;
  userId: number;
}

interface Reply {
  id: number;
  body: string;
  status: string;
  isModeratorReply: boolean;
  createdAt: string;
  author: string;
  authorRole: string;
  userId: number;
}

const categoryLabels: Record<string, { name: string; color: string }> = {
  "ai-tools": { name: "AI-инструменты", color: "#60a5fa" },
  business: { name: "Бизнес-процессы", color: "#4ade80" },
  technical: { name: "Технические вопросы", color: "#f59e0b" },
  contest: { name: "Конкурс", color: "#a78bfa" },
};

export default function ForumTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useForumUser();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Reply form
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);

  const fetchTopic = () => {
    setLoading(true);
    fetch(`/api/forum/topics/${id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setTopic(data.topic);
          setReplies(data.replies || []);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTopic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginForm(true);
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/forum/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: Number(id), body: replyBody }),
      });
      if (res.ok) {
        setReplyBody("");
        setSuccessMsg("Ответ отправлен на модерацию");
        setTimeout(() => setSuccessMsg(""), 5000);
        fetchTopic();
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !topic) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Тема не найдена</h1>
          <Link href="/forum" className="btn-primary">
            Вернуться на форум
          </Link>
        </div>
      </div>
    );
  }

  const cat = topic.category ? categoryLabels[topic.category] : null;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back link */}
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 mb-6 text-sm transition-colors"
          style={{ color: "#8898b8" }}
        >
          ← Назад к форуму
        </Link>

        {/* Topic */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {topic.isPinned && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(99, 130, 255, 0.15)", color: "#6382ff" }}
              >
                📌 Закреплено
              </span>
            )}
            {topic.status === "pending" && (
              <span className="badge-pending text-xs px-2 py-1 rounded-full">
                На модерации
              </span>
            )}
            {cat && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${cat.color}20`, color: cat.color }}
              >
                {cat.name}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">{topic.title}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: topic.authorRole === "moderator"
                  ? "linear-gradient(135deg, #4a65f0, #6382ff)"
                  : "rgba(99, 130, 255, 0.15)",
                color: "white",
              }}
            >
              {topic.author[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{topic.author}</span>
                {topic.authorRole === "moderator" && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "#6382ff", color: "white" }}
                  >
                    Модератор
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: "#5a6a8a" }}>
                {topic.authorDivision && <span>{topic.authorDivision}</span>}
                <span>{new Date(topic.createdAt).toLocaleString("ru-RU")}</span>
              </div>
            </div>
          </div>

          <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#c8d4e8" }}>
            {topic.body}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-white">
              Ответы ({replies.filter((r) => r.status === "published").length})
            </h2>
            {replies.filter((r) => r.status !== "rejected").map((reply) => (
              <div
                key={reply.id}
                className="card"
                style={{
                  borderColor: reply.isModeratorReply ? "rgba(99, 130, 255, 0.25)" : undefined,
                }}
              >
                {reply.status === "pending" && (
                  <div className="badge-pending text-xs px-2 py-1 rounded-full w-fit mb-3">
                    На модерации
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: reply.isModeratorReply
                        ? "linear-gradient(135deg, #4a65f0, #6382ff)"
                        : "rgba(99, 130, 255, 0.15)",
                      color: "white",
                    }}
                  >
                    {reply.author[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{reply.author}</span>
                      {reply.isModeratorReply && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "#6382ff", color: "white" }}
                        >
                          Модератор
                        </span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: "#5a6a8a" }}>
                      {new Date(reply.createdAt).toLocaleString("ru-RU")}
                    </span>
                  </div>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#c8d4e8" }}>
                  {reply.body}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div
            className="mb-4 p-4 rounded-xl text-sm animate-fadeIn"
            style={{ background: "rgba(74, 222, 128, 0.1)", color: "#4ade80", border: "1px solid rgba(74, 222, 128, 0.2)" }}
          >
            {successMsg}
          </div>
        )}

        {/* Reply form */}
        {topic.status === "published" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Ответить</h3>
            {!authLoading && !user && !showLoginForm && (
              <div className="text-center py-4">
                <p className="text-sm mb-3" style={{ color: "#8898b8" }}>
                  Для ответа необходимо авторизоваться
                </p>
                <button onClick={() => setShowLoginForm(true)} className="btn-primary">
                  Войти
                </button>
              </div>
            )}
            {showLoginForm && !user && (
              <div className="mb-4">
                <ForumLoginForm onClose={() => setShowLoginForm(false)} />
              </div>
            )}
            {user && (
              <form onSubmit={handleSubmitReply}>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Напишите ваш ответ..."
                  rows={4}
                  required
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={sending || !replyBody.trim()}
                    className="btn-primary disabled:opacity-50"
                  >
                    {sending ? "Отправка..." : "Отправить ответ"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
