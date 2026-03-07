"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface AIEvaluation {
  id: number;
  scoreBusiness: number;
  scoreInnovation: number;
  scoreFeasibility: number;
  scoreScalability: number;
  scoreQuality: number;
  totalScore: number;
  verdict: string;
  oneLiner: string;
  authorStrengths: string;
  developmentSteps: string;
  resourcesForStart: string;
  questionsToThink: string;
  authorAiLevel: string;
  authorQualities: string;
  authorGrowthZone: string;
  problemSimple: string;
  solutionSimple: string;
  businessEffect: string;
  hiddenPotential: string;
  growthPath: string;
  synergies: string;
  mentorshipNeeded: string;
  suggestedMentor: string;
  resourcesToAllocate: string;
  modelUsed: string;
  createdAt: string;
}

interface Application {
  id: number;
  applicantName: string;
  applicantEmail: string;
  title: string;
  category: string;
  type: string;
  format: string;
  status: string;
  descriptionProblem: string;
  descriptionSolution: string;
  expectedEffect: string;
  resourcesNeeded: string | null;
  filesUrls: string | null;
  scoreBusiness: number | null;
  scoreInnovation: number | null;
  scoreFeasibility: number | null;
  scoreScalability: number | null;
  scoreQuality: number | null;
  expertComments: string | null;
  createdAt: string;
  updatedAt: string;
  division: { id: number; name: string };
  teamMembers: Array<{ id: number; name: string; position: string | null; divisionName: string | null }>;
  statusHistory: Array<{ id: number; fromStatus: string; toStatus: string; comment: string | null; createdAt: string }>;
}

const categoryLabels: Record<string, { name: string; color: string }> = {
  efficiency: { name: "Повышение эффективности", color: "#60a5fa" },
  new_process: { name: "Новый бизнес-процесс", color: "#4ade80" },
  new_product: { name: "Новый продукт или сервис", color: "#f59e0b" },
  new_feature: { name: "Новая функциональность", color: "#a78bfa" },
  analytics: { name: "Аналитика и прогнозирование", color: "#f472b6" },
  content: { name: "Контент и коммуникации", color: "#34d399" },
};

const typeLabels: Record<string, string> = {
  idea: "Идея",
  prototype: "Прототип",
  implementation: "Внедрение",
};

const statusLabels: Record<string, { name: string; color: string }> = {
  submitted: { name: "Новая", color: "#6382ff" },
  reviewing: { name: "На рассмотрении", color: "#f59e0b" },
  finalist: { name: "Финалист", color: "#a78bfa" },
  winner: { name: "Победитель", color: "#4ade80" },
  rejected: { name: "Отклонена", color: "#ef4444" },
};

const scoreLabels = [
  { key: "scoreBusiness", label: "Бизнес-ценность" },
  { key: "scoreInnovation", label: "Инновационность" },
  { key: "scoreFeasibility", label: "Реализуемость" },
  { key: "scoreScalability", label: "Масштабируемость" },
  { key: "scoreQuality", label: "Качество описания" },
];

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [expertComments, setExpertComments] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [notifyingCommission, setNotifyingCommission] = useState(false);
  const [notifyingAuthor, setNotifyingAuthor] = useState(false);
  const [aiEvaluations, setAiEvaluations] = useState<AIEvaluation[]>([]);
  const [currentEvalIdx, setCurrentEvalIdx] = useState(0);
  const [emailModal, setEmailModal] = useState<{
    from: string; to: string; subject: string; html: string; resendConfigured: boolean;
  } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetch(`/api/applications/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setApplication(data);
        setNewStatus(data.status);
        setExpertComments(data.expertComments || "");
        setScores({
          scoreBusiness: data.scoreBusiness || 0,
          scoreInnovation: data.scoreInnovation || 0,
          scoreFeasibility: data.scoreFeasibility || 0,
          scoreScalability: data.scoreScalability || 0,
          scoreQuality: data.scoreQuality || 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(`/api/admin/evaluations?applicationId=${params.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAiEvaluations(data); })
      .catch(console.error);
  }, [params.id]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/admin/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: parseInt(params.id as string) }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiEvaluations((prev) => [data, ...prev]);
        setCurrentEvalIdx(0);
        setScores({
          scoreBusiness: data.scoreBusiness,
          scoreInnovation: data.scoreInnovation,
          scoreFeasibility: data.scoreFeasibility,
          scoreScalability: data.scoreScalability,
          scoreQuality: data.scoreQuality,
        });
      } else {
        alert(data.error || "Ошибка оценки");
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setEvaluating(false);
    }
  };

  const handleNotifyCommission = async () => {
    setNotifyingCommission(true);
    try {
      const eval_ = aiEvaluations[currentEvalIdx];
      const res = await fetch("/api/admin/notify-commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: parseInt(params.id as string), evaluationId: eval_?.id }),
      });
      const data = await res.json();
      if (res.ok) alert(`Письма отправлены: ${data.sent} из ${data.total}`);
      else alert(data.error || "Ошибка отправки");
    } catch {
      alert("Ошибка соединения");
    } finally {
      setNotifyingCommission(false);
    }
  };

  const handlePreviewAuthorEmail = async () => {
    setNotifyingAuthor(true);
    try {
      const eval_ = aiEvaluations[currentEvalIdx];
      const qs = `applicationId=${params.id}${eval_ ? `&evaluationId=${eval_.id}` : ""}`;
      const res = await fetch(`/api/admin/notify-author?${qs}`);
      const data = await res.json();
      if (res.ok) {
        setEmailModal(data);
        setEmailSubject(data.subject);
      } else {
        alert(data.error || "Ошибка загрузки превью");
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setNotifyingAuthor(false);
    }
  };

  const handleSendAuthorEmail = async () => {
    if (!emailModal) return;
    setSendingEmail(true);
    try {
      const eval_ = aiEvaluations[currentEvalIdx];
      const res = await fetch("/api/admin/notify-author", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: parseInt(params.id as string),
          evaluationId: eval_?.id,
          subject: emailSubject,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailModal(null);
        alert(data.sent ? "✅ Письмо отправлено!" : "⚠️ Письмо не отправлено (Resend не настроен). Логируется в EmailLog.");
      } else {
        alert(data.error || "Ошибка отправки");
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          statusComment: statusComment || undefined,
          expertComments,
          ...scores,
        }),
      });
      const updated = await res.json();
      setApplication(updated);
      setStatusComment("");
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12" style={{ color: "#8898b8" }}>
        Заявка не найдена
      </div>
    );
  }

  const cat = categoryLabels[application.category];
  const stat = statusLabels[application.status];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav style={{ color: "#5a6a8a" }}>
        <Link href="/admin" className="hover:text-[#6382ff]">Дашборд</Link>
        <span className="mx-2">→</span>
        <Link href="/admin/applications" className="hover:text-[#6382ff]">Заявки</Link>
        <span className="mx-2">→</span>
        <span style={{ color: "#8898b8" }}>#{application.id}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Заявка #{application.id}
          </h1>
          <h2 className="text-xl" style={{ color: "#8898b8" }}>
            {application.title}
          </h2>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="btn-secondary">
            ← Назад
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Основная информация</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm" style={{ color: "#5a6a8a" }}>Заявитель</div>
                <div className="text-white">{application.applicantName}</div>
                <div className="text-sm" style={{ color: "#8898b8" }}>{application.applicantEmail}</div>
              </div>
              <div>
                <div className="text-sm" style={{ color: "#5a6a8a" }}>Дивизион</div>
                <div className="text-white">{application.division.name}</div>
              </div>
              <div>
                <div className="text-sm" style={{ color: "#5a6a8a" }}>Категория</div>
                <span
                  className="text-sm px-3 py-1 rounded-full inline-block"
                  style={{ background: `${cat?.color}20`, color: cat?.color }}
                >
                  {cat?.name}
                </span>
              </div>
              <div>
                <div className="text-sm" style={{ color: "#5a6a8a" }}>Тип заявки</div>
                <div className="text-white">{typeLabels[application.type]}</div>
              </div>
              <div>
                <div className="text-sm" style={{ color: "#5a6a8a" }}>Формат</div>
                <div className="text-white">
                  {application.format === "team" ? "Команда" : "Индивидуально"}
                </div>
              </div>
              <div>
                <div className="text-sm" style={{ color: "#5a6a8a" }}>Дата подачи</div>
                <div className="text-white">
                  {new Date(application.createdAt).toLocaleString("ru-RU")}
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          {application.teamMembers.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Состав команды</h3>
              <div className="space-y-3">
                {application.teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ background: "rgba(99, 130, 255, 0.2)" }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white">{member.name}</div>
                      <div className="text-sm" style={{ color: "#8898b8" }}>
                        {member.position} {member.divisionName && `• ${member.divisionName}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Описание</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2" style={{ color: "#6382ff" }}>
                  Проблема / Возможность
                </div>
                <p style={{ color: "#8898b8" }}>{application.descriptionProblem}</p>
              </div>
              <div>
                <div className="text-sm font-medium mb-2" style={{ color: "#4ade80" }}>
                  Решение с AI
                </div>
                <p style={{ color: "#8898b8" }}>{application.descriptionSolution}</p>
              </div>
              <div>
                <div className="text-sm font-medium mb-2" style={{ color: "#f59e0b" }}>
                  Ожидаемый эффект
                </div>
                <p style={{ color: "#8898b8" }}>{application.expectedEffect}</p>
              </div>
              {application.resourcesNeeded && (
                <div>
                  <div className="text-sm font-medium mb-2" style={{ color: "#a78bfa" }}>
                    Необходимые ресурсы
                  </div>
                  <p style={{ color: "#8898b8" }}>{application.resourcesNeeded}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          {application.statusHistory.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">История изменений</h3>
              <div className="space-y-3">
                {application.statusHistory.map((change) => (
                  <div
                    key={change.id}
                    className="flex items-center gap-3 text-sm"
                    style={{ color: "#8898b8" }}
                  >
                    <span className="text-xs" style={{ color: "#5a6a8a" }}>
                      {new Date(change.createdAt).toLocaleString("ru-RU")}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        background: `${statusLabels[change.fromStatus]?.color}20`,
                        color: statusLabels[change.fromStatus]?.color,
                      }}
                    >
                      {statusLabels[change.fromStatus]?.name}
                    </span>
                    <span>→</span>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        background: `${statusLabels[change.toStatus]?.color}20`,
                        color: statusLabels[change.toStatus]?.color,
                      }}
                    >
                      {statusLabels[change.toStatus]?.name}
                    </span>
                    {change.comment && (
                      <span className="italic">«{change.comment}»</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Статус</h3>
            <div className="mb-4">
              <span
                className="text-lg px-4 py-2 rounded-full inline-block font-semibold"
                style={{ background: `${stat?.color}20`, color: stat?.color }}
              >
                {stat?.name}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-2" style={{ color: "#8898b8" }}>
                  Изменить статус
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full"
                >
                  {Object.entries(statusLabels).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: "#8898b8" }}>
                  Комментарий к изменению
                </label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Причина изменения статуса..."
                  rows={2}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Scores Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Оценка эксперта</h3>
            <div className="space-y-4">
              {scoreLabels.map((score) => (
                <div key={score.key}>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm" style={{ color: "#8898b8" }}>
                      {score.label}
                    </label>
                    <span className="text-white font-bold">
                      {scores[score.key] || 0}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={scores[score.key] || 0}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [score.key]: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </div>
              ))}
              <div className="pt-2 border-t" style={{ borderColor: "rgba(99, 130, 255, 0.15)" }}>
                <div className="flex justify-between">
                  <span style={{ color: "#8898b8" }}>Средний балл</span>
                  <span className="text-white font-bold text-lg">
                    {Math.round(
                      Object.values(scores).reduce((a, b) => a + b, 0) / 5
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Comments */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Комментарии эксперта</h3>
            <textarea
              value={expertComments}
              onChange={(e) => setExpertComments(e.target.value)}
              placeholder="Ваши замечания и рекомендации..."
              rows={4}
              className="w-full"
            />
          </div>

          {/* AI Evaluation Card */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">🤖 AI-анализ</h3>
              <button
                onClick={handleEvaluate}
                disabled={evaluating}
                className="btn-primary text-sm !py-2 !px-4 disabled:opacity-50"
              >
                {evaluating ? "Анализируем..." : aiEvaluations.length > 0 ? "Переоценить" : "Оценить через AI"}
              </button>
            </div>

            {aiEvaluations.length === 0 && !evaluating && (
              <p className="text-sm" style={{ color: "#5a6a8a" }}>
                Нажмите «Оценить через AI» для получения автоматической оценки заявки
              </p>
            )}

            {aiEvaluations.length > 0 && (() => {
              const ev = aiEvaluations[currentEvalIdx];
              if (!ev) return null;

              const verdictCfg: Record<string, { emoji: string; text: string; color: string }> = {
                support: { emoji: "🟢", text: "Поддержать", color: "#4ade80" },
                develop: { emoji: "🟡", text: "Развить", color: "#f59e0b" },
                rethink: { emoji: "🔴", text: "Переосмыслить", color: "#ef4444" },
              };
              const vc = verdictCfg[ev.verdict] || verdictCfg.develop;

              const aiLevelCfg: Record<string, { text: string; color: string }> = {
                beginner: { text: "Начинающий", color: "#f59e0b" },
                growing: { text: "Растущий", color: "#3b82f6" },
                advanced: { text: "Продвинутый", color: "#10b981" },
              };
              const alc = aiLevelCfg[ev.authorAiLevel] || aiLevelCfg.growing;

              const parseJ = (s: string) => { try { return JSON.parse(s); } catch { return []; } };

              return (
                <>
                  {/* History selector */}
                  {aiEvaluations.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {aiEvaluations.map((e, i) => (
                        <button
                          key={e.id}
                          onClick={() => setCurrentEvalIdx(i)}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: i === currentEvalIdx ? "rgba(99,130,255,0.2)" : "rgba(99,130,255,0.07)",
                            color: i === currentEvalIdx ? "#6382ff" : "#5a6a8a",
                            border: `1px solid ${i === currentEvalIdx ? "#6382ff" : "rgba(99,130,255,0.15)"}`,
                          }}
                        >
                          {new Date(e.createdAt).toLocaleDateString("ru-RU")}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Verdict */}
                  <div className="p-3 rounded-xl" style={{ background: `${vc.color}15` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{vc.emoji}</span>
                        <span className="font-bold" style={{ color: vc.color }}>{vc.text}</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{Math.round(ev.totalScore)}</span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: "#8898b8" }}>{ev.oneLiner}</p>
                  </div>

                  {/* Author profile */}
                  <div>
                    <div className="text-xs font-medium mb-2" style={{ color: "#6382ff" }}>👤 Профиль автора</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs" style={{ color: "#8898b8" }}>AI-уровень:</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${alc.color}20`, color: alc.color }}>{alc.text}</span>
                    </div>
                    <p className="text-xs" style={{ color: "#8898b8" }}>
                      <strong>Качества:</strong> {parseJ(ev.authorQualities).join(", ")}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#8898b8" }}>
                      <strong>Зона роста:</strong> {ev.authorGrowthZone}
                    </p>
                  </div>

                  {/* For business experts */}
                  <div className="p-3 rounded-xl" style={{ background: "rgba(99,130,255,0.05)" }}>
                    <div className="text-xs font-medium mb-2" style={{ color: "#f59e0b" }}>👔 Для Оксаны и Шиканова</div>
                    <div className="space-y-1 text-xs" style={{ color: "#8898b8" }}>
                      <p><strong>Проблема:</strong> {ev.problemSimple}</p>
                      <p><strong>Решение:</strong> {ev.solutionSimple}</p>
                      <p><strong>Эффект:</strong> {ev.businessEffect}</p>
                    </div>
                  </div>

                  {/* Hidden potential */}
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: "#a78bfa" }}>💎 Скрытый потенциал</div>
                    <p className="text-xs" style={{ color: "#8898b8" }}>{ev.hiddenPotential}</p>
                    <p className="text-xs mt-1" style={{ color: "#8898b8" }}><strong>Может вырасти в:</strong> {ev.growthPath}</p>
                  </div>

                  {/* Support */}
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: "#4ade80" }}>🤝 Как поддержать</div>
                    <div className="text-xs space-y-0.5" style={{ color: "#8898b8" }}>
                      <p><strong>Менторинг:</strong> {ev.mentorshipNeeded}</p>
                      <p><strong>Ментор:</strong> {ev.suggestedMentor}</p>
                      <p><strong>Ресурсы:</strong> {parseJ(ev.resourcesToAllocate).join(", ")}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "rgba(99,130,255,0.15)" }}>
                    <button
                      onClick={handleNotifyCommission}
                      disabled={notifyingCommission}
                      className="btn-primary flex-1 text-sm !py-2 disabled:opacity-50"
                    >
                      {notifyingCommission ? "Отправка..." : "📧 Комиссии"}
                    </button>
                    <button
                      onClick={handlePreviewAuthorEmail}
                      disabled={notifyingAuthor}
                      className="btn-secondary flex-1 text-sm !py-2 disabled:opacity-50"
                    >
                      {notifyingAuthor ? "Загрузка..." : "💬 Автору"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>

    {/* Email preview modal */}
    {emailModal && (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={(e) => { if (e.target === e.currentTarget) setEmailModal(null); }}
      >
        <div className="w-full max-w-2xl rounded-xl overflow-hidden" style={{ background: "#0d1526", border: "1px solid rgba(99,130,255,0.2)" }}>
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(99,130,255,0.15)" }}>
            <h3 className="text-white font-semibold text-lg">📧 Письмо автору — предпросмотр</h3>
            <button onClick={() => setEmailModal(null)} className="text-xl" style={{ color: "#8898b8" }}>✕</button>
          </div>

          <div className="p-6 space-y-4">
            {/* From / To */}
            <div className="rounded-lg p-4 space-y-2 text-sm" style={{ background: "rgba(99,130,255,0.07)" }}>
              <div className="flex gap-3">
                <span className="w-16 flex-shrink-0 font-medium" style={{ color: "#8898b8" }}>От кого:</span>
                <span className="text-white">{emailModal.from}</span>
              </div>
              <div className="flex gap-3">
                <span className="w-16 flex-shrink-0 font-medium" style={{ color: "#8898b8" }}>Кому:</span>
                <span style={{ color: "#4ade80" }}>{emailModal.to}</span>
              </div>
              <div className="flex gap-3 items-center">
                <span className="w-16 flex-shrink-0 font-medium" style={{ color: "#8898b8" }}>Тема:</span>
                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="flex-1 text-sm px-2 py-1 rounded"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,130,255,0.3)", color: "#fff" }}
                />
              </div>
            </div>

            {/* Resend warning */}
            {!emailModal.resendConfigured && (
              <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
                ⚠️ <strong>RESEND_API_KEY не настроен</strong> — письмо не будет отправлено реально, но будет записано в EmailLog со статусом «failed».
              </div>
            )}

            {/* HTML preview */}
            <div>
              <div className="text-xs font-medium mb-2" style={{ color: "#8898b8" }}>Содержимое письма:</div>
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(99,130,255,0.15)", height: "380px" }}>
                <iframe
                  srcDoc={emailModal.html}
                  className="w-full h-full"
                  sandbox="allow-same-origin"
                  title="Email preview"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEmailModal(null)} className="btn-secondary flex-1 !py-3">
                Отмена
              </button>
              <button
                onClick={handleSendAuthorEmail}
                disabled={sendingEmail}
                className="btn-primary flex-1 !py-3 disabled:opacity-50"
              >
                {sendingEmail ? "Отправка..." : emailModal.resendConfigured ? "📤 Отправить письмо" : "📋 Записать в лог (без отправки)"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  );
}
