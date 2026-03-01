"use client";

import { useEffect, useState, useCallback } from "react";

interface Topic {
  id: number;
  title: string;
  body: string;
  category: string;
  status: string;
  isPinned: boolean;
  createdAt: string;
  author: string;
  authorEmail: string;
  authorRole: string;
  repliesCount: number;
}

interface Reply {
  id: number;
  body: string;
  status: string;
  isModeratorReply: boolean;
  createdAt: string;
  author: string;
  authorEmail: string;
  topicId: number;
  topicTitle: string;
}

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

interface TopicReply {
  id: number;
  body: string;
  status: string;
  isModeratorReply: boolean;
  createdAt: string;
  author: string;
  authorRole: string;
  userId: number;
}

const categoryLabels: Record<string, string> = {
  "ai-tools": "AI-инструменты",
  business: "Бизнес-процессы",
  technical: "Технические вопросы",
  contest: "Конкурс",
};

const statusLabels: Record<string, string> = {
  pending: "На модерации",
  published: "Опубликовано",
  rejected: "Отклонено",
};

export default function AdminForumPage() {
  const [tab, setTab] = useState<"moderation" | "all">("moderation");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pendingReplies, setPendingReplies] = useState<Reply[]>([]);
  const [pendingTopicCount, setPendingTopicCount] = useState(0);
  const [pendingReplyCount, setPendingReplyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  // Detail view
  const [selectedTopic, setSelectedTopic] = useState<TopicDetail | null>(null);
  const [topicReplies, setTopicReplies] = useState<TopicReply[]>([]);
  const [moderatorReply, setModeratorReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchModerationData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/forum/topics?status=pending").then((r) => r.json()),
      fetch("/api/admin/forum/replies?status=pending").then((r) => r.json()),
    ])
      .then(([topicsData, repliesData]) => {
        setTopics(topicsData.topics || []);
        setPendingTopicCount(topicsData.pendingCount || 0);
        setPendingReplies(repliesData.replies || []);
        setPendingReplyCount(repliesData.pendingCount || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchAllTopics = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/forum/topics?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setTopics(data.topics || []);
        setPendingTopicCount(data.pendingCount || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    if (tab === "moderation") {
      fetchModerationData();
    } else {
      fetchAllTopics();
    }
  }, [tab, fetchModerationData, fetchAllTopics]);

  const handleTopicAction = async (topicId: number, status: string) => {
    await fetch(`/api/admin/forum/topics/${topicId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (tab === "moderation") fetchModerationData();
    else fetchAllTopics();
  };

  const handleReplyAction = async (replyId: number, status: string) => {
    await fetch(`/api/admin/forum/replies/${replyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (tab === "moderation") fetchModerationData();
    if (selectedTopic) openTopicDetail(selectedTopic.id);
  };

  const handleTogglePin = async (topicId: number, currentPinned: boolean) => {
    await fetch(`/api/admin/forum/topics/${topicId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !currentPinned }),
    });
    if (tab === "moderation") fetchModerationData();
    else fetchAllTopics();
  };

  const openTopicDetail = async (topicId: number) => {
    try {
      const res = await fetch(`/api/forum/topics/${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTopic(data.topic);
        setTopicReplies(data.replies || []);
      }
    } catch {
      // ignore
    }
  };

  const handleSendModeratorReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !moderatorReply.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/admin/forum/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: selectedTopic.id, body: moderatorReply }),
      });
      if (res.ok) {
        setModeratorReply("");
        openTopicDetail(selectedTopic.id);
      }
    } catch {
      // ignore
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Форум</h1>
          <p style={{ color: "#8898b8" }}>
            На модерации: {pendingTopicCount} тем, {pendingReplyCount} ответов
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("moderation")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: tab === "moderation" ? "rgba(99, 130, 255, 0.15)" : "transparent",
            color: tab === "moderation" ? "#6382ff" : "#8898b8",
            border: `1px solid ${tab === "moderation" ? "rgba(99, 130, 255, 0.3)" : "rgba(99, 130, 255, 0.1)"}`,
          }}
        >
          На модерации
          {pendingTopicCount + pendingReplyCount > 0 && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded-full text-xs"
              style={{ background: "#f59e0b", color: "#000" }}
            >
              {pendingTopicCount + pendingReplyCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("all")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: tab === "all" ? "rgba(99, 130, 255, 0.15)" : "transparent",
            color: tab === "all" ? "#6382ff" : "#8898b8",
            border: `1px solid ${tab === "all" ? "rgba(99, 130, 255, 0.3)" : "rgba(99, 130, 255, 0.1)"}`,
          }}
        >
          Все темы
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
        </div>
      ) : tab === "moderation" ? (
        <>
          {/* Pending Topics */}
          {topics.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">
                Темы на модерации ({topics.length})
              </h2>
              <div className="space-y-3">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(99, 130, 255, 0.03)", border: "1px solid rgba(99, 130, 255, 0.08)" }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3
                          className="font-medium text-white mb-1 cursor-pointer hover:underline"
                          onClick={() => openTopicDetail(topic.id)}
                        >
                          {topic.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs mb-2" style={{ color: "#8898b8" }}>
                          <span>{topic.author}</span>
                          <span style={{ color: "#5a6a8a" }}>({topic.authorEmail})</span>
                          <span className="badge-pending px-1.5 py-0.5 rounded-full">
                            {categoryLabels[topic.category] || topic.category}
                          </span>
                          <span style={{ color: "#5a6a8a" }}>
                            {new Date(topic.createdAt).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2" style={{ color: "#8898b8" }}>
                          {topic.body}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleTopicAction(topic.id, "published")}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          style={{ background: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}
                        >
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleTopicAction(topic.id, "rejected")}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Replies */}
          {pendingReplies.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">
                Ответы на модерации ({pendingReplies.length})
              </h2>
              <div className="space-y-3">
                {pendingReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(99, 130, 255, 0.03)", border: "1px solid rgba(99, 130, 255, 0.08)" }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-xs mb-1" style={{ color: "#5a6a8a" }}>
                          К теме:{" "}
                          <span
                            className="cursor-pointer hover:underline"
                            style={{ color: "#6382ff" }}
                            onClick={() => openTopicDetail(reply.topicId)}
                          >
                            {reply.topicTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs mb-2" style={{ color: "#8898b8" }}>
                          <span>{reply.author}</span>
                          <span style={{ color: "#5a6a8a" }}>({reply.authorEmail})</span>
                          <span style={{ color: "#5a6a8a" }}>
                            {new Date(reply.createdAt).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2" style={{ color: "#8898b8" }}>
                          {reply.body}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleReplyAction(reply.id, "published")}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          style={{ background: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}
                        >
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleReplyAction(reply.id, "rejected")}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topics.length === 0 && pendingReplies.length === 0 && (
            <div className="card py-12 text-center" style={{ color: "#5a6a8a" }}>
              Нет элементов на модерации
            </div>
          )}
        </>
      ) : (
        <>
          {/* All Topics Tab */}
          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm" style={{ color: "#8898b8" }}>
                Статус:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="!w-auto"
              >
                <option value="">Все</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(99, 130, 255, 0.1)" }}>
                    <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>#</th>
                    <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>Дата</th>
                    <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>Автор</th>
                    <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>Название</th>
                    <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>Категория</th>
                    <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>Статус</th>
                    <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>📌</th>
                    <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((topic) => (
                    <tr key={topic.id} style={{ borderBottom: "1px solid rgba(99, 130, 255, 0.05)" }}>
                      <td className="py-3 px-3 text-sm text-white">{topic.id}</td>
                      <td className="py-3 px-3 text-sm" style={{ color: "#8898b8" }}>
                        {new Date(topic.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-sm text-white">{topic.author}</div>
                        <div className="text-xs" style={{ color: "#5a6a8a" }}>{topic.authorEmail}</div>
                      </td>
                      <td className="py-3 px-3 text-sm text-white max-w-xs truncate">{topic.title}</td>
                      <td className="py-3 px-3 text-sm" style={{ color: "#8898b8" }}>
                        {categoryLabels[topic.category] || topic.category || "-"}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`badge-${topic.status} text-xs px-2 py-1 rounded-full`}>
                          {statusLabels[topic.status] || topic.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleTogglePin(topic.id, topic.isPinned)}
                          className="text-lg"
                          title={topic.isPinned ? "Открепить" : "Закрепить"}
                        >
                          {topic.isPinned ? "📌" : "◻️"}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openTopicDetail(topic.id)}
                            className="text-sm px-2 py-1 rounded-lg transition-colors"
                            style={{ background: "rgba(99, 130, 255, 0.1)", color: "#6382ff" }}
                          >
                            Открыть
                          </button>
                          {topic.status === "pending" && (
                            <button
                              onClick={() => handleTopicAction(topic.id, "published")}
                              className="text-sm px-2 py-1 rounded-lg transition-colors"
                              style={{ background: "rgba(74, 222, 128, 0.1)", color: "#4ade80" }}
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {topics.length === 0 && (
              <div className="py-12 text-center" style={{ color: "#5a6a8a" }}>
                Тем не найдено
              </div>
            )}
          </div>
        </>
      )}

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.8)" }}
          onClick={() => setSelectedTopic(null)}
        >
          <div
            className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge-${selectedTopic.status} text-xs px-2 py-1 rounded-full`}>
                    {statusLabels[selectedTopic.status] || selectedTopic.status}
                  </span>
                  {selectedTopic.isPinned && (
                    <span className="text-xs" style={{ color: "#6382ff" }}>📌 Закреплено</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedTopic.title}</h2>
                <div className="text-sm mt-1" style={{ color: "#8898b8" }}>
                  {selectedTopic.author}
                  {selectedTopic.authorDivision && ` · ${selectedTopic.authorDivision}`}
                  {" · "}
                  {new Date(selectedTopic.createdAt).toLocaleString("ru-RU")}
                </div>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="p-2 rounded-lg"
                style={{ background: "rgba(99, 130, 255, 0.1)" }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-sm leading-relaxed whitespace-pre-wrap mb-6" style={{ color: "#c8d4e8" }}>
              {selectedTopic.body}
            </div>

            {/* Action buttons for pending topics */}
            {selectedTopic.status === "pending" && (
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    handleTopicAction(selectedTopic.id, "published");
                    setSelectedTopic({ ...selectedTopic, status: "published" });
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}
                >
                  Одобрить тему
                </button>
                <button
                  onClick={() => {
                    handleTopicAction(selectedTopic.id, "rejected");
                    setSelectedTopic(null);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
                >
                  Отклонить
                </button>
              </div>
            )}

            {/* Replies */}
            {topicReplies.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-white">Ответы ({topicReplies.length})</h3>
                {topicReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(99, 130, 255, 0.03)",
                      border: `1px solid ${reply.isModeratorReply ? "rgba(99, 130, 255, 0.2)" : "rgba(99, 130, 255, 0.08)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#8898b8" }}>
                        <span className="font-medium text-white">{reply.author}</span>
                        {reply.isModeratorReply && (
                          <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: "#6382ff", color: "white" }}>
                            Модератор
                          </span>
                        )}
                        <span className={`badge-${reply.status} px-1.5 py-0.5 rounded-full text-xs`}>
                          {statusLabels[reply.status]}
                        </span>
                        <span style={{ color: "#5a6a8a" }}>
                          {new Date(reply.createdAt).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      {reply.status === "pending" && !reply.isModeratorReply && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleReplyAction(reply.id, "published")}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ background: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleReplyAction(reply.id, "rejected")}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "#c8d4e8" }}>{reply.body}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Moderator reply form */}
            <form onSubmit={handleSendModeratorReply}>
              <h3 className="text-sm font-semibold text-white mb-2">Ответ модератора</h3>
              <textarea
                value={moderatorReply}
                onChange={(e) => setModeratorReply(e.target.value)}
                placeholder="Напишите ответ от имени модератора..."
                rows={3}
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={sendingReply || !moderatorReply.trim()}
                  className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50"
                >
                  {sendingReply ? "Отправка..." : "Ответить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
