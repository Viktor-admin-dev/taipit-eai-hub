import Link from "next/link";
import { notFound } from "next/navigation";
import { sampleTopics, sampleReplies, categoryLabels } from "@/data/forum";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TopicPage({ params }: Props) {
  const { id } = await params;
  const topic = sampleTopics.find((t) => t.id === parseInt(id));

  if (!topic) notFound();

  const replies = sampleReplies.filter((r) => r.topicId === topic.id);
  const cat = categoryLabels[topic.category];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: "#5a6a8a" }}>
          <Link href="/forum" className="hover:text-white transition-colors">
            Форум
          </Link>
          <span>→</span>
          <span style={{ color: "#8898b8" }}>{topic.title}</span>
        </div>

        {/* Topic */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {topic.isPinned && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(99, 130, 255, 0.15)", color: "#6382ff" }}
              >
                📌 Закреплено
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

          <div className="flex items-center gap-3 mb-6 text-sm" style={{ color: "#5a6a8a" }}>
            {topic.authorRole === "moderator" ? (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#6382ff", color: "white" }}
              >
                Модератор
              </span>
            ) : (
              <span style={{ color: "#8898b8" }}>{topic.author}</span>
            )}
            <span>·</span>
            <span>{new Date(topic.createdAt).toLocaleDateString("ru-RU")}</span>
          </div>

          <div
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: "#c8d4e8" }}
          >
            {topic.body}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-white">
              Ответы ({replies.length})
            </h2>
            {replies.map((reply) => (
              <div key={reply.id} className="card">
                <div className="flex items-center gap-3 mb-3 text-sm" style={{ color: "#5a6a8a" }}>
                  {reply.authorRole === "moderator" ? (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "#6382ff", color: "white" }}
                    >
                      Модератор
                    </span>
                  ) : (
                    <span style={{ color: "#8898b8" }}>{reply.author}</span>
                  )}
                  <span>·</span>
                  <span>{new Date(reply.createdAt).toLocaleDateString("ru-RU")}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#c8d4e8" }}>
                  {reply.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reply notice */}
        <div
          className="card text-center"
          style={{ borderColor: "rgba(99, 130, 255, 0.2)" }}
        >
          <p className="text-sm mb-4" style={{ color: "#8898b8" }}>
            Для ответа в теме необходима авторизация через корпоративный email.
            Эта функция будет доступна в следующем обновлении.
          </p>
          <Link href="/forum" className="btn-secondary inline-block">
            ← Вернуться к форуму
          </Link>
        </div>
      </div>
    </div>
  );
}
