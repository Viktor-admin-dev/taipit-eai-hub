"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  }, [params.id]);

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
        </div>
      </div>
    </div>
  );
}
