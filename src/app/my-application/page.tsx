"use client";

import { useState } from "react";
import Link from "next/link";

type Step = "find" | "list" | "results" | "edit" | "preview" | "done";

interface Application {
  id: number;
  title: string;
  category: string;
  type: string;
  format: string;
  status: string;
  descriptionProblem: string;
  descriptionSolution: string;
  expectedEffect: string;
  resourcesNeeded: string | null;
  createdAt: string;
  division: { name: string };
  teamMembers: Array<{ name: string; position: string | null; divisionName: string | null }>;
}

interface MyEvaluation {
  scores: {
    business: number | null;
    innovation: number | null;
    feasibility: number | null;
    scalability: number | null;
    quality: number | null;
    total: number | null;
  };
  authorStrengths: string[];
  developmentSteps: string[];
  resourcesForStart: string[];
  questionsToThink: string[];
  evaluatedAt: string | null;
}

interface PreviewResult {
  scores: { business: number; innovation: number; feasibility: number; scalability: number; quality: number; total: number };
  verdict: string;
  strengths: string[];
  improvements: Array<{ field: string; issue: string; suggestion: string; example?: string }>;
  quickWins: string[];
  readyToSubmit: boolean;
  message: string;
}

const statusLabels: Record<string, { name: string; color: string }> = {
  submitted: { name: "Подана", color: "#6382ff" },
  reviewing: { name: "На рассмотрении", color: "#f59e0b" },
  finalist: { name: "Финалист", color: "#a78bfa" },
  winner: { name: "Победитель", color: "#4ade80" },
  rejected: { name: "Отклонена", color: "#ef4444" },
};

const scoreLabelsMap: Record<string, string> = {
  business: "Бизнес-ценность",
  innovation: "Инновационность",
  feasibility: "Реализуемость",
  scalability: "Масштабируемость",
  quality: "Качество описания",
};

const fieldLabelsMap: Record<string, string> = {
  title: "Название",
  descriptionProblem: "Описание проблемы",
  descriptionSolution: "Описание решения",
  expectedEffect: "Ожидаемый эффект",
};

export default function MyApplicationPage() {
  const [step, setStep] = useState<Step>("find");
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [myEval, setMyEval] = useState<MyEvaluation | null>(null);
  const [loadingEval, setLoadingEval] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    descriptionProblem: "",
    descriptionSolution: "",
    expectedEffect: "",
    resourcesNeeded: "",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const handleFind = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const res = await fetch(`/api/applications?email=${encodeURIComponent(email)}&limit=20`);
      const data = await res.json();
      const apps: Application[] = (data.applications || []).filter(
        (a: Application & { applicantEmail: string }) =>
          a.applicantEmail.toLowerCase() === email.toLowerCase()
      );
      setApplications(apps);
      setStep("list");
    } catch {
      alert("Ошибка поиска. Попробуйте позже.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = async (app: Application) => {
    setSelected(app);
    setFormData({
      title: app.title,
      descriptionProblem: app.descriptionProblem,
      descriptionSolution: app.descriptionSolution,
      expectedEffect: app.expectedEffect,
      resourcesNeeded: app.resourcesNeeded || "",
    });
    setMyEval(null);
    setStep("results");
    setLoadingEval(true);
    try {
      const res = await fetch(`/api/applications/my-evaluation?id=${app.id}&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok) setMyEval(data);
    } catch {
      // Evaluation not available yet
    } finally {
      setLoadingEval(false);
    }
  };

  const handlePreview = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/applications/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setPreview(data);
        setStep("preview");
      } else {
        alert(data.error || "Ошибка анализа");
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/applications/${selected.id}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantEmail: email, ...formData }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("done");
      } else {
        alert(data.error || "Ошибка сохранения");
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = formData.title.length > 0 &&
    formData.descriptionProblem.length >= 100 &&
    formData.descriptionSolution.length >= 100 &&
    formData.expectedEffect.length > 0;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Step: Find */}
        {step === "find" && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Моя заявка</h1>
              <p style={{ color: "#8898b8" }}>
                Введите ваш корпоративный email, чтобы посмотреть оценку и улучшить заявку
              </p>
            </div>
            <form onSubmit={handleFind} className="card space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
                  Корпоративный email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ivanov@taipit.ru"
                  className="w-full"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="btn-primary w-full disabled:opacity-50"
              >
                {searching ? "Поиск..." : "Найти мои заявки"}
              </button>
            </form>
            <p className="text-center mt-6 text-sm" style={{ color: "#5a6a8a" }}>
              Хотите подать новую заявку?{" "}
              <Link href="/how-to-participate" style={{ color: "#6382ff" }}>
                Перейти к форме →
              </Link>
            </p>
          </div>
        )}

        {/* Step: List */}
        {step === "list" && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setStep("find")} className="btn-secondary text-sm">← Назад</button>
              <h2 className="text-2xl font-bold text-white">Ваши заявки</h2>
            </div>

            {applications.length === 0 ? (
              <div className="card text-center py-8">
                <p style={{ color: "#8898b8" }} className="mb-4">
                  Заявки с email <strong>{email}</strong> не найдены
                </p>
                <Link href="/how-to-participate" className="btn-primary">
                  Подать заявку →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: "#5a6a8a" }}>
                  Нашли {applications.length} заявк{applications.length === 1 ? "у" : "и"}. Выберите для просмотра:
                </p>
                {applications.map((app) => {
                  const st = statusLabels[app.status] || statusLabels.submitted;
                  return (
                    <div key={app.id} className="card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs" style={{ color: "#5a6a8a" }}>#{app.id}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${st.color}20`, color: st.color }}>
                              {st.name}
                            </span>
                            <span className="text-xs" style={{ color: "#5a6a8a" }}>
                              {new Date(app.createdAt).toLocaleDateString("ru-RU")}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold mb-1">{app.title}</h3>
                          <p className="text-sm" style={{ color: "#8898b8" }}>{app.division.name}</p>
                        </div>
                        <button
                          onClick={() => handleSelect(app)}
                          className="btn-primary text-sm !py-2 !px-4 flex-shrink-0"
                        >
                          Смотреть →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step: Results — AI evaluation for author */}
        {step === "results" && selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setStep("list")} className="btn-secondary text-sm">← Назад</button>
              <div>
                <h2 className="text-2xl font-bold text-white">Оценка заявки #{selected.id}</h2>
                <p className="text-sm mt-1" style={{ color: "#8898b8" }}>{selected.title}</p>
              </div>
            </div>

            {loadingEval ? (
              <div className="card flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full mx-auto mb-3" />
                  <p style={{ color: "#8898b8" }}>Загружаем оценку...</p>
                </div>
              </div>
            ) : myEval && myEval.scores.total !== null ? (
              <>
                {/* Score bars */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Баллы вашей заявки</h3>
                    <span className="text-3xl font-bold" style={{
                      color: (myEval.scores.total || 0) >= 70 ? "#4ade80" : (myEval.scores.total || 0) >= 50 ? "#f59e0b" : "#ef4444"
                    }}>
                      {Math.round(myEval.scores.total || 0)}/100
                    </span>
                  </div>
                  <div className="space-y-3">
                    {(["business", "innovation", "feasibility", "scalability", "quality"] as const).map((key) => {
                      const val = myEval.scores[key] ?? 0;
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span style={{ color: "#8898b8" }}>{scoreLabelsMap[key]}</span>
                            <span className="text-white font-medium">{val}/20</span>
                          </div>
                          <div className="h-2 rounded-full" style={{ background: "rgba(99,130,255,0.15)" }}>
                            <div className="h-full rounded-full transition-all" style={{
                              width: `${(val / 20) * 100}%`,
                              background: val >= 14 ? "#4ade80" : val >= 10 ? "#f59e0b" : "#ef4444"
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {myEval.evaluatedAt && (
                    <p className="text-xs mt-4" style={{ color: "#5a6a8a" }}>
                      Оценено: {new Date(myEval.evaluatedAt).toLocaleString("ru-RU")}
                    </p>
                  )}
                </div>

                {/* Author strengths */}
                {myEval.authorStrengths.length > 0 && (
                  <div className="card" style={{ borderLeft: "4px solid #4ade80" }}>
                    <h3 className="text-lg font-semibold text-white mb-3">✅ Сильные стороны</h3>
                    <ul className="space-y-2">
                      {myEval.authorStrengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#8898b8" }}>
                          <span style={{ color: "#4ade80" }}>•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Development steps */}
                {myEval.developmentSteps.length > 0 && (
                  <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
                    <h3 className="text-lg font-semibold text-white mb-3">🛤 Шаги для развития идеи</h3>
                    <ol className="space-y-2">
                      {myEval.developmentSteps.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "#8898b8" }}>
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                            style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Resources */}
                {myEval.resourcesForStart.length > 0 && (
                  <div className="card" style={{ borderLeft: "4px solid #6382ff" }}>
                    <h3 className="text-lg font-semibold text-white mb-3">🧰 Что нужно для старта</h3>
                    <ul className="space-y-2">
                      {myEval.resourcesForStart.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#8898b8" }}>
                          <span style={{ color: "#6382ff" }}>→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Questions to think about */}
                {myEval.questionsToThink.length > 0 && (
                  <div className="card" style={{ borderLeft: "4px solid #a78bfa" }}>
                    <h3 className="text-lg font-semibold text-white mb-3">🤔 Вопросы для проработки</h3>
                    <ul className="space-y-2">
                      {myEval.questionsToThink.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#8898b8" }}>
                          <span style={{ color: "#a78bfa" }}>?</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="card text-center py-8">
                <div className="text-4xl mb-3">⏳</div>
                <p className="text-white font-medium mb-2">Оценка ещё обрабатывается</p>
                <p className="text-sm" style={{ color: "#8898b8" }}>
                  AI анализирует вашу заявку. Вернитесь через несколько минут или улучшите описание.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setStep("edit")}
                className="btn-primary !px-8 !py-3"
              >
                ✏️ Улучшить заявку
              </button>
            </div>
          </div>
        )}

        {/* Step: Edit */}
        {step === "edit" && selected && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setStep("results")} className="btn-secondary text-sm">← К оценке</button>
              <div>
                <h2 className="text-2xl font-bold text-white">Редактирование заявки #{selected.id}</h2>
                <p className="text-sm mt-1" style={{ color: "#8898b8" }}>
                  Улучшите описание и получите AI-оценку перед сохранением
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Название</h3>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Описание</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
                      Описание проблемы / возможности * <span className="text-xs">(мин. 100 символов)</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.descriptionProblem}
                      onChange={(e) => setFormData((p) => ({ ...p, descriptionProblem: e.target.value }))}
                      className="w-full"
                    />
                    <div className="text-xs mt-1" style={{ color: formData.descriptionProblem.length >= 100 ? "#4ade80" : "#5a6a8a" }}>
                      {formData.descriptionProblem.length}/100 символов
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
                      Описание решения с AI * <span className="text-xs">(мин. 100 символов)</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.descriptionSolution}
                      onChange={(e) => setFormData((p) => ({ ...p, descriptionSolution: e.target.value }))}
                      className="w-full"
                    />
                    <div className="text-xs mt-1" style={{ color: formData.descriptionSolution.length >= 100 ? "#4ade80" : "#5a6a8a" }}>
                      {formData.descriptionSolution.length}/100 символов
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
                      Ожидаемый эффект *
                    </label>
                    <textarea
                      rows={3}
                      value={formData.expectedEffect}
                      onChange={(e) => setFormData((p) => ({ ...p, expectedEffect: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
                      Необходимые ресурсы
                    </label>
                    <input
                      value={formData.resourcesNeeded}
                      onChange={(e) => setFormData((p) => ({ ...p, resourcesNeeded: e.target.value }))}
                      placeholder="Claude Pro, помощь разработчика..."
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handlePreview}
                  disabled={isAnalyzing || !isFormValid}
                  className="btn-primary !px-12 !py-4 text-lg disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Анализируем...
                    </span>
                  ) : "🔍 Проверить изменения"}
                </button>
                <p className="text-sm mt-3" style={{ color: "#5a6a8a" }}>
                  AI оценит обновлённую заявку и даст советы перед сохранением
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && preview && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setStep("edit")} className="btn-secondary text-sm">← Назад</button>
              <div>
                <h2 className="text-2xl font-bold text-white">Оценка обновлённой заявки</h2>
                <p className="text-sm mt-1" style={{ color: "#8898b8" }}>Сравните с прежней версией и решите — сохранять ли изменения</p>
              </div>
            </div>

            {/* Scores */}
            {(() => {
              const total = preview.scores.total;
              return (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Результат анализа</h3>
                    <span className="text-3xl font-bold" style={{ color: total >= 70 ? "#4ade80" : total >= 50 ? "#f59e0b" : "#ef4444" }}>
                      {Math.round(total)}/100
                    </span>
                  </div>
                  <p className="text-sm mb-4" style={{ color: "#8898b8" }}>{preview.message}</p>
                  <div className="space-y-3">
                    {(["business", "innovation", "feasibility", "scalability", "quality"] as const).map((key) => {
                      const val = preview.scores[key];
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span style={{ color: "#8898b8" }}>{scoreLabelsMap[key]}</span>
                            <span className="text-white">{val}</span>
                          </div>
                          <div className="h-2 rounded-full" style={{ background: "rgba(99,130,255,0.15)" }}>
                            <div className="h-full rounded-full" style={{ width: `${val}%`, background: val >= 70 ? "#4ade80" : val >= 50 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {preview.strengths.length > 0 && (
              <div className="card" style={{ borderLeft: "4px solid #4ade80" }}>
                <h3 className="text-lg font-semibold text-white mb-3">✅ Что хорошо</h3>
                <ul className="space-y-2">
                  {preview.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#8898b8" }}>
                      <span style={{ color: "#4ade80" }}>•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {preview.improvements.length > 0 && (
              <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
                <h3 className="text-lg font-semibold text-white mb-3">💡 Можно улучшить</h3>
                <div className="space-y-3">
                  {preview.improvements.map((imp, i) => (
                    <div key={i} className="p-3 rounded-lg" style={{ background: "rgba(245,158,11,0.08)" }}>
                      <div className="font-medium text-white text-sm mb-1">{fieldLabelsMap[imp.field] || imp.field}</div>
                      <p className="text-sm" style={{ color: "#f59e0b" }}>⚠️ {imp.issue}</p>
                      <p className="text-sm mt-1" style={{ color: "#8898b8" }}>💡 {imp.suggestion}</p>
                      {imp.example && (
                        <div className="text-sm mt-1 p-2 rounded" style={{ background: "rgba(99,130,255,0.1)", color: "#8898b8" }}>
                          <strong>Пример:</strong> «{imp.example}»
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preview.quickWins.length > 0 && (
              <div className="card" style={{ borderLeft: "4px solid #6382ff" }}>
                <h3 className="text-lg font-semibold text-white mb-3">⚡ Быстрые улучшения</h3>
                <ul className="space-y-2">
                  {preview.quickWins.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#8898b8" }}>
                      <span style={{ color: "#6382ff" }}>→</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button onClick={() => setStep("edit")} className="btn-secondary !px-8 !py-3">
                ← Доработать ещё
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary !px-8 !py-3 disabled:opacity-50"
              >
                {isSaving ? "Сохранение..." : "✓ Сохранить изменения"}
              </button>
            </div>
            {!preview.readyToSubmit && (
              <p className="text-center text-sm" style={{ color: "#f59e0b" }}>
                ⚠️ Рекомендуем ещё доработать заявку
              </p>
            )}
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(74,222,128,0.15)" }}>
              <svg className="w-10 h-10" fill="#4ade80" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Заявка обновлена!</h2>
            <p className="mb-2" style={{ color: "#8898b8" }}>
              Изменения сохранены. AI-оценка обновляется в фоне.
            </p>
            <p className="mb-8 text-sm" style={{ color: "#5a6a8a" }}>
              Через несколько минут вернитесь сюда чтобы увидеть новые баллы.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setStep("find"); setEmail(""); setApplications([]); setSelected(null); setPreview(null); setMyEval(null); }} className="btn-secondary">
                Найти другую заявку
              </button>
              <Link href="/" className="btn-primary">На главную</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
