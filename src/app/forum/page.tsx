"use client";

import { useState } from "react";
import Link from "next/link";
import { sampleTopics, categoryLabels } from "@/data/forum";

const categories = [
  { id: "all", name: "Все темы", icon: "📋", color: "#6382ff" },
  { id: "ai-tools", name: "AI-инструменты", icon: "🤖", color: "#60a5fa" },
  { id: "business", name: "Бизнес-процессы", icon: "📈", color: "#4ade80" },
  { id: "technical", name: "Технические вопросы", icon: "⚙️", color: "#f59e0b" },
  { id: "contest", name: "Конкурс", icon: "🏆", color: "#a78bfa" },
];

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);

  const filteredTopics = sampleTopics.filter(
    (topic) => activeCategory === "all" || topic.category === activeCategory
  );

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
          <button
            onClick={() => setShowNewTopicModal(true)}
            className="btn-primary"
          >
            + Создать тему
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                background:
                  activeCategory === cat.id
                    ? `${cat.color}20`
                    : "rgba(99, 130, 255, 0.05)",
                border: `1px solid ${
                  activeCategory === cat.id ? cat.color : "rgba(99, 130, 255, 0.15)"
                }`,
                color: activeCategory === cat.id ? cat.color : "#8898b8",
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Topics List */}
        <div className="space-y-3">
          {sortedTopics.map((topic) => (
            <Link key={topic.id} href={`/forum/${topic.id}`} className="block">
              <div
                className="card flex flex-col md:flex-row md:items-center gap-4 hover:border-[#6382ff] transition-colors"
                style={{
                  borderColor: topic.isPinned
                    ? "rgba(99, 130, 255, 0.3)"
                    : undefined,
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

                {/* Main content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{topic.title}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span
                      className="flex items-center gap-1"
                      style={{ color: "#8898b8" }}
                    >
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
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${categoryLabels[topic.category]?.color}20`,
                        color: categoryLabels[topic.category]?.color,
                      }}
                    >
                      {categoryLabels[topic.category]?.name}
                    </span>
                    <span style={{ color: "#5a6a8a" }}>
                      {new Date(topic.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>

                {/* Replies count */}
                <div className="flex items-center gap-2" style={{ color: "#8898b8" }}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>{topic.repliesCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {sortedTopics.length === 0 && (
          <div className="text-center py-12" style={{ color: "#5a6a8a" }}>
            Нет тем в этой категории
          </div>
        )}

        {/* New Topic Modal */}
        {showNewTopicModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.8)" }}
            onClick={() => setShowNewTopicModal(false)}
          >
            <div
              className="card max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Создать тему</h2>
              <p className="mb-6" style={{ color: "#8898b8" }}>
                Для создания темы необходима авторизация через корпоративный email.
                Эта функция будет доступна в следующем обновлении.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewTopicModal(false)}
                  className="btn-secondary flex-1"
                >
                  Понятно
                </button>
                <Link href="/contest#apply" className="btn-primary flex-1 text-center">
                  Подать заявку
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
