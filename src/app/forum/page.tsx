"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useForumUser, ForumLoginForm } from "@/components/ForumAuth";

interface Topic {
  id: number;
  title: string;
  body: string;
  author: string;
  authorRole: string;
  userId: number;
  category: string;
  status: string;
  repliesCount: number;
  createdAt: string;
  isPinned: boolean;
}

const categories = [
  { id: "all", name: "Все темы", icon: "📋", color: "#6382ff" },
  { id: "ai-tools", name: "AI-инструменты", icon: "🤖", color: "#60a5fa" },
  { id: "business", name: "Бизнес-процессы", icon: "📈", color: "#4ade80" },
  { id: "technical", name: "Технические вопросы", icon: "⚙️", color: "#f59e0b" },
  { id: "contest", name: "Конкурс", icon: "🏆", color: "#a78bfa" },
];

const categoryLabels: Record<string, { name: string; color: string }> = {
  "ai-tools": { name: "AI-инструменты", color: "#60a5fa" },
  business: { name: "Бизнес-процессы", color: "#4ade80" },
  technical: { name: "Технические вопросы", color: "#f59e0b" },
  contest: { name: "Конкурс", color: "#a78bfa" },
};

export default function ForumPage() {
  const { user, loading: authLoading } = useForumUser();
  const [activeCategory, setActiveCategory] = useState("all");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<"login" | "create" | "success" | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // New topic form
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("ai-tools");
  const [creating, setCreating] = useState(false);

  const fetchTopics = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);

    fetch(`/api/forum/topics?${params}`)
      .then((res) => res.json())
      .then((data) => setTopics(data.topics || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, body: newBody, category: newCategory }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewBody("");
        setShowModal("success");
        fetchTopics();
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleNewTopicClick = () => {
    if (user) {
      setShowModal("create");
    } else {
      setShowModal("login");
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Форум</h1>
            <p style={{ color: "#8898b8" }}>
              Задавайте вопросы, делитесь опытом, обсуждайте идеи
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!authLoading && user && (
              <span className="text-sm" style={{ color: "#8898b8" }}>
                {user.name}
              </span>
            )}
            <button onClick={handleNewTopicClick} className="btn-primary">
              + Создать тему
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                background: activeCategory === cat.id ? `${cat.color}20` : "rgba(99, 130, 255, 0.05)",
                border: `1px solid ${activeCategory === cat.id ? cat.color : "rgba(99, 130, 255, 0.15)"}`,
                color: activeCategory === cat.id ? cat.color : "#8898b8",
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Topics List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/forum/${topic.id}`}
                className="card flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:border-[#6382ff] transition-colors block"
                style={{
                  borderColor: topic.isPinned ? "rgba(99, 130, 255, 0.3)" : undefined,
                }}
              >
                {/* Pinned indicator */}
                {topic.isPinned && (
                  <div
                    className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"
                    style={{ background: "rgba(99, 130, 255, 0.15)", color: "#6382ff" }}
                  >
                    📌 Закреплено
                  </div>
                )}

                {/* Pending badge for own topics */}
                {topic.status === "pending" && (
                  <div className="badge-pending text-xs px-2 py-1 rounded-full w-fit">
                    На модерации
                  </div>
                )}

                {/* Main content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{topic.title}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-1" style={{ color: "#8898b8" }}>
                      {topic.authorRole === "moderator" ? (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "#6382ff", color: "white" }}
                        >
                          Модератор
                        </span>
                      ) : (
                        topic.author
                      )}
                    </span>
                    {topic.category && categoryLabels[topic.category] && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: `${categoryLabels[topic.category].color}20`,
                          color: categoryLabels[topic.category].color,
                        }}
                      >
                        {categoryLabels[topic.category].name}
                      </span>
                    )}
                    <span style={{ color: "#5a6a8a" }}>
                      {new Date(topic.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>

                {/* Replies count */}
                <div className="flex items-center gap-2" style={{ color: "#8898b8" }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>{topic.repliesCount}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && topics.length === 0 && (
          <div className="text-center py-12" style={{ color: "#5a6a8a" }}>
            Нет тем в этой категории
          </div>
        )}

        {/* Login Modal */}
        {showModal === "login" && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.8)" }}
            onClick={() => setShowModal(null)}
          >
            <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <ForumLoginForm onClose={() => setShowModal("create")} />
              <button
                onClick={() => setShowModal(null)}
                className="mt-4 text-sm w-full text-center"
                style={{ color: "#5a6a8a" }}
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Create Topic Modal */}
        {showModal === "create" && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.8)" }}
            onClick={() => setShowModal(null)}
          >
            <div
              className="card max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Создать тему</h2>
              <form onSubmit={handleCreateTopic} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#8898b8" }}>
                    Категория
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    {categories.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#8898b8" }}>
                    Заголовок
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="О чём ваш вопрос?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#8898b8" }}>
                    Текст
                  </label>
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Опишите подробнее..."
                    rows={5}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(null)}
                    className="btn-secondary flex-1"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newTitle || !newBody}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {creating ? "Отправка..." : "Отправить"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showModal === "success" && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.8)" }}
            onClick={() => setShowModal(null)}
          >
            <div
              className="card max-w-md w-full text-center animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(74, 222, 128, 0.15)" }}
              >
                <svg className="w-8 h-8" fill="none" stroke="#4ade80" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Тема отправлена!</h2>
              <p className="mb-1" style={{ color: "#8898b8" }}>
                Ваш вопрос отправлен на модерацию.
              </p>
              <p className="text-sm mb-6" style={{ color: "#5a6a8a" }}>
                Модератор проверит и опубликует тему, а затем ответит на ваш вопрос в течение 24 часов.
              </p>
              <button
                onClick={() => setShowModal(null)}
                className="btn-primary w-full"
              >
                Отлично
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
