"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function NewsEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Editable fields
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");

  // AI refine
  const [refinePrompt, setRefinePrompt] = useState("");
  const [refining, setRefining] = useState(false);

  // Email
  const [emailModal, setEmailModal] = useState<{
    html: string;
    subject: string;
    recipients: string[];
    recipientCount: number;
    resendConfigured: boolean;
  } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [preparingEmail, setPreparingEmail] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/news/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPost(data);
        setTitle(data.title);
        setBody(data.body);
        setCta(data.cta || "");
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(params.id as string), title, body, cta: cta || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setPost(data);
      } else {
        alert(data.error || "Ошибка сохранения");
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(params.id as string), isPublished: !post?.isPublished }),
      });
      const data = await res.json();
      if (res.ok) setPost(data);
    } catch {
      alert("Ошибка соединения");
    } finally {
      setPublishing(false);
    }
  };

  const handleRefine = async () => {
    if (!refinePrompt.trim()) return;
    setRefining(true);
    try {
      const res = await fetch("/api/admin/news/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, cta, prompt: refinePrompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitle(data.title);
        setBody(data.body);
        setCta(data.cta || "");
        setRefinePrompt("");
      } else {
        alert(data.error || "Ошибка AI");
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setRefining(false);
    }
  };

  const handlePrepareEmail = async () => {
    setPreparingEmail(true);
    // Save first so email uses latest content
    await handleSave();
    try {
      const res = await fetch(`/api/admin/news/send-email?postId=${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setEmailModal(data);
        setEmailSubject(data.subject);
      } else {
        alert(data.error || "Ошибка");
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setPreparingEmail(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/news/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: parseInt(params.id as string), subject: emailSubject }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailModal(null);
        alert(`Отправлено: ${data.sent} из ${data.total}`);
      } else {
        alert(data.error || "Ошибка отправки");
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12" style={{ color: "#8898b8" }}>
        Пост не найден
      </div>
    );
  }

  const hasChanges = title !== post.title || body !== post.body || (cta || "") !== (post.cta || "");

  return (
    <>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav style={{ color: "#5a6a8a" }} className="text-sm">
          <Link href="/admin" className="hover:text-[#6382ff]">Дашборд</Link>
          <span className="mx-2">&rarr;</span>
          <Link href="/admin/news" className="hover:text-[#6382ff]">Новости</Link>
          <span className="mx-2">&rarr;</span>
          <span style={{ color: "#8898b8" }}>#{post.id}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Редактор новости #{post.id}</h1>
            <div className="flex items-center gap-3">
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
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="btn-secondary">
              &larr; Назад
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Fields */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Содержимое</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#8898b8" }}>Заголовок</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full"
                    placeholder="Заголовок поста"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#8898b8" }}>Текст</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    className="w-full"
                    placeholder="Текст новости..."
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#8898b8" }}>Кнопка (CTA)</label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="w-full"
                    placeholder="Текст кнопки, например: Подать заявку"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Превью</h3>
              <div className="rounded-xl p-6" style={{ background: "rgba(99,130,255,0.04)", border: "1px solid rgba(99,130,255,0.1)" }}>
                <h2 className="text-xl font-bold text-white mb-4">{title || "Без заголовка"}</h2>
                <div className="space-y-3 text-sm" style={{ color: "#8898b8" }}>
                  {body.split("\n").filter((p) => p.trim()).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {cta && (
                  <div className="mt-6">
                    <span
                      className="inline-block px-6 py-3 rounded-xl font-semibold text-sm text-white"
                      style={{ background: "linear-gradient(135deg, #6382ff, #4ade80)" }}
                    >
                      {cta}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Email Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Email-рассылка</h3>
                <button
                  onClick={handlePrepareEmail}
                  disabled={preparingEmail}
                  className="btn-secondary text-sm !py-2 !px-4 disabled:opacity-50"
                >
                  {preparingEmail ? "Подготовка..." : "Подготовить email"}
                </button>
              </div>
              <p className="text-sm" style={{ color: "#5a6a8a" }}>
                Сохраните пост и нажмите «Подготовить email» для предпросмотра и отправки рассылки подписчикам.
              </p>
            </div>
          </div>

          {/* Right: AI & Actions */}
          <div className="space-y-6">
            {/* Publish Card */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Публикация</h3>
              <button
                onClick={handleTogglePublish}
                disabled={publishing}
                className="w-full text-sm px-4 py-3 rounded-xl transition-all disabled:opacity-50"
                style={{
                  background: post.isPublished ? "rgba(239,68,68,0.08)" : "rgba(74,222,128,0.1)",
                  color: post.isPublished ? "#ef4444" : "#4ade80",
                  border: `1px solid ${post.isPublished ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.2)"}`,
                }}
              >
                {publishing ? "..." : post.isPublished ? "Снять с публикации" : "Опубликовать"}
              </button>
              {post.applicationId && (
                <Link
                  href={`/admin/applications/${post.applicationId}`}
                  className="block text-center text-sm mt-3 hover:underline"
                  style={{ color: "#6382ff" }}
                >
                  Заявка #{post.applicationId}
                </Link>
              )}
            </div>

            {/* AI Refine */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">AI-помощник</h3>
              <p className="text-sm mb-3" style={{ color: "#5a6a8a" }}>
                Опишите, что нужно изменить, и AI доработает текст.
              </p>
              <textarea
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                rows={3}
                className="w-full mb-3"
                placeholder="Например: сделай короче, добавь эмоций, упрости язык..."
              />
              <button
                onClick={handleRefine}
                disabled={refining || !refinePrompt.trim()}
                className="btn-primary w-full disabled:opacity-50"
              >
                {refining ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Дорабатываем...
                  </span>
                ) : (
                  "Применить AI"
                )}
              </button>
              <div className="mt-3 space-y-1">
                {["Сделай короче", "Добавь эмоций", "Упрости язык", "Добавь цифры и факты"].map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => setRefinePrompt(hint)}
                    className="text-xs px-2 py-1 rounded mr-1 mb-1 transition-all"
                    style={{ background: "rgba(99,130,255,0.08)", color: "#6382ff", border: "1px solid rgba(99,130,255,0.15)" }}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {emailModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEmailModal(null); }}
        >
          <div
            className="w-full max-w-2xl rounded-xl overflow-hidden"
            style={{ background: "#0d1526", border: "1px solid rgba(99,130,255,0.2)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(99,130,255,0.15)" }}>
              <h3 className="text-white font-semibold text-lg">Email-рассылка</h3>
              <button onClick={() => setEmailModal(null)} className="text-xl" style={{ color: "#8898b8" }}>
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Info */}
              <div className="rounded-lg p-4 space-y-2 text-sm" style={{ background: "rgba(99,130,255,0.07)" }}>
                <div className="flex gap-3">
                  <span className="w-24 flex-shrink-0 font-medium" style={{ color: "#8898b8" }}>Получатели:</span>
                  <span style={{ color: "#4ade80" }}>{emailModal.recipientCount} подписчик(ов)</span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="w-24 flex-shrink-0 font-medium" style={{ color: "#8898b8" }}>Тема:</span>
                  <input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="flex-1 text-sm px-2 py-1 rounded"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,130,255,0.3)", color: "#fff" }}
                  />
                </div>
              </div>

              {!emailModal.resendConfigured && (
                <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
                  RESEND_API_KEY не настроен — письма не будут отправлены реально.
                </div>
              )}

              {emailModal.recipientCount === 0 && (
                <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
                  Нет активных подписчиков для рассылки.
                </div>
              )}

              {/* Preview */}
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: "#8898b8" }}>Превью:</div>
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(99,130,255,0.15)", height: "380px" }}>
                  <iframe
                    srcDoc={emailModal.html}
                    className="w-full h-full"
                    sandbox="allow-same-origin"
                    title="Email preview"
                  />
                </div>
              </div>

              {/* Recipient list */}
              {emailModal.recipients.length > 0 && (
                <details>
                  <summary className="text-sm cursor-pointer" style={{ color: "#8898b8" }}>
                    Показать получателей ({emailModal.recipients.length})
                  </summary>
                  <div className="mt-2 text-xs space-y-1" style={{ color: "#5a6a8a" }}>
                    {emailModal.recipients.map((email, i) => (
                      <div key={i}>{email}</div>
                    ))}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEmailModal(null)} className="btn-secondary flex-1 !py-3">
                  Отмена
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || emailModal.recipientCount === 0}
                  className="btn-primary flex-1 !py-3 disabled:opacity-50"
                >
                  {sendingEmail ? "Отправка..." : `Отправить (${emailModal.recipientCount})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
