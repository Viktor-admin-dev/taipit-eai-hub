"use client";

import { useState, useEffect } from "react";

const categories = [
  {
    id: "efficiency",
    name: "Повышение эффективности",
    description: "Ускорение, автоматизация или удешевление существующего процесса",
    icon: "🔧",
    color: "#60a5fa",
  },
  {
    id: "new_process",
    name: "Новый бизнес-процесс",
    description: "Создание процесса, которого раньше не было в компании",
    icon: "🔄",
    color: "#4ade80",
  },
  {
    id: "new_product",
    name: "Новый продукт или сервис",
    description: "AI-powered продукт для клиентов или внутреннего использования",
    icon: "🚀",
    color: "#f59e0b",
  },
  {
    id: "new_feature",
    name: "Новая функциональность",
    description: "Добавление AI-функций к существующему продукту",
    icon: "⚡",
    color: "#a78bfa",
  },
  {
    id: "analytics",
    name: "Аналитика и прогнозирование",
    description: "AI для анализа данных, прогнозов, выявления паттернов",
    icon: "📊",
    color: "#f472b6",
  },
  {
    id: "content",
    name: "Контент и коммуникации",
    description: "AI для создания контента, перевода, работы с документами",
    icon: "✍️",
    color: "#34d399",
  },
];

const applicationTypes = [
  { id: "idea", name: "Идея", description: "Концепция без реализации" },
  { id: "prototype", name: "Прототип", description: "Начатая реализация с демо" },
  { id: "implementation", name: "Внедрение", description: "Работающее решение" },
];

const resources = [
  "Claude Pro",
  "Claude Team",
  "Claude Code",
  "Помощь разработчика",
  "Обучение",
  "Другое",
];

export default function ApplicationForm() {
  const [dbDivisions, setDbDivisions] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/divisions")
      .then((r) => r.json())
      .then((data) => setDbDivisions(data))
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    divisionId: "",
    title: "",
    category: "",
    type: "",
    format: "individual",
    teamMembers: [{ name: "", position: "", divisionName: "" }],
    descriptionProblem: "",
    descriptionSolution: "",
    expectedEffect: "",
    resourcesNeeded: [] as string[],
    otherResources: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<{
    scores: { business: number; innovation: number; feasibility: number; scalability: number; quality: number; total: number };
    verdict: string;
    strengths: string[];
    improvements: Array<{ field: string; issue: string; suggestion: string; example?: string }>;
    quickWins: string[];
    missingInfo: string[];
    readyToSubmit: boolean;
    message: string;
  } | null>(null);

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
  const verdictLabels: Record<string, { text: string; color: string }> = {
    support: { text: "🟢 Готово к отправке", color: "#4ade80" },
    develop: { text: "🟡 Можно улучшить", color: "#f59e0b" },
    rethink: { text: "🔴 Требует доработки", color: "#ef4444" },
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowed = files.filter(
      (f) => ["application/pdf", "image/png", "image/jpeg"].includes(f.type) && f.size <= 10 * 1024 * 1024
    );
    setSelectedFiles((prev) => [...prev, ...allowed].slice(0, 3));
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles([]);
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return uploadedFiles;
    if (uploadedFiles.length > 0) return uploadedFiles;

    setIsUploading(true);
    try {
      const fd = new FormData();
      selectedFiles.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploadedFiles(data.files);
      return data.files as string[];
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка загрузки файлов");
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const getPayload = (filesUrls?: string[]) => ({
    ...formData,
    resourcesNeeded: JSON.stringify([...formData.resourcesNeeded, formData.otherResources].filter(Boolean)),
    teamMembers: formData.format === "team" ? formData.teamMembers : [],
    filesUrls: filesUrls && filesUrls.length > 0 ? JSON.stringify(filesUrls) : undefined,
  });

  const handlePreview = async () => {
    setIsAnalyzing(true);
    try {
      const files = await uploadFiles();
      const res = await fetch("/api/applications/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          filesUrls: files.length > 0 ? JSON.stringify(files) : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPreview(data);
        setShowPreview(true);
      } else {
        alert(data.error || "Ошибка анализа");
      }
    } catch {
      alert("Ошибка соединения. Попробуйте позже.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const files = await uploadFiles();
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getPayload(files)),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmittedId(data.id);
        setIsSubmitted(true);
        setShowPreview(false);
        setPreview(null);
      } else {
        alert(data.error || "Ошибка при отправке заявки");
      }
    } catch {
      alert("Ошибка соединения. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTeamMember = () => {
    if (formData.teamMembers.length < 5) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, { name: "", position: "", divisionName: "" }],
      }));
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  const toggleResource = (resource: string) => {
    setFormData((prev) => ({
      ...prev,
      resourcesNeeded: prev.resourcesNeeded.includes(resource)
        ? prev.resourcesNeeded.filter((r) => r !== resource)
        : [...prev.resourcesNeeded, resource],
    }));
  };

  if (showPreview && preview) {
    const vl = verdictLabels[preview.verdict] || verdictLabels.develop;
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Предварительная оценка заявки</h2>
          <p style={{ color: "#8898b8" }}>
            Посмотрите, как комиссия оценит вашу заявку, и улучшите её перед отправкой
          </p>
        </div>

        {/* Verdict + total */}
        <div className="card" style={{ borderLeft: `4px solid ${vl.color}` }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold" style={{ color: vl.color }}>{vl.text}</span>
            <span className="text-3xl font-bold" style={{ color: preview.scores.total >= 70 ? "#4ade80" : preview.scores.total >= 50 ? "#f59e0b" : "#ef4444" }}>
              {Math.round(preview.scores.total)}/100
            </span>
          </div>
          <p className="text-sm" style={{ color: "#8898b8" }}>{preview.message}</p>

          {/* Score bars */}
          <div className="mt-4 space-y-3">
            {(["business", "innovation", "feasibility", "scalability", "quality"] as const).map((key) => {
              const val = preview.scores[key];
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "#8898b8" }}>{scoreLabelsMap[key]}</span>
                    <span className="text-white">{val}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "rgba(99,130,255,0.15)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${val}%`,
                        background: val >= 70 ? "#4ade80" : val >= 50 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths */}
        {preview.strengths.length > 0 && (
          <div className="card" style={{ borderLeft: "4px solid #4ade80" }}>
            <h3 className="text-lg font-semibold text-white mb-3">✅ Что уже хорошо</h3>
            <ul className="space-y-2">
              {preview.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#8898b8" }}>
                  <span style={{ color: "#4ade80" }}>•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {preview.improvements.length > 0 && (
          <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
            <h3 className="text-lg font-semibold text-white mb-3">💡 Как улучшить</h3>
            <div className="space-y-4">
              {preview.improvements.map((imp, i) => (
                <div key={i} className="p-4 rounded-lg" style={{ background: "rgba(245,158,11,0.08)" }}>
                  <div className="font-medium text-white mb-1 text-sm">
                    {fieldLabelsMap[imp.field] || imp.field}
                  </div>
                  <p className="text-sm mb-1" style={{ color: "#f59e0b" }}>⚠️ {imp.issue}</p>
                  <p className="text-sm mb-2" style={{ color: "#8898b8" }}>💡 {imp.suggestion}</p>
                  {imp.example && (
                    <div className="text-sm p-2 rounded" style={{ background: "rgba(99,130,255,0.1)", color: "#8898b8" }}>
                      <strong>Пример:</strong> «{imp.example}»
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick wins */}
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

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button onClick={() => setShowPreview(false)} className="btn-secondary !px-8 !py-3">
            ← Вернуться и улучшить
          </button>
          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="btn-primary !px-8 !py-3 disabled:opacity-50"
          >
            {isSubmitting ? "Отправка..." : preview.readyToSubmit ? "✓ Отправить заявку" : "Отправить как есть"}
          </button>
        </div>
        {!preview.readyToSubmit && (
          <p className="text-center text-sm" style={{ color: "#f59e0b" }}>
            ⚠️ Рекомендуем доработать заявку для повышения шансов на победу
          </p>
        )}
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(74, 222, 128, 0.15)" }}
        >
          <svg className="w-10 h-10" fill="#4ade80" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Заявка принята!</h2>
        <p style={{ color: "#8898b8" }} className="mb-2">
          Номер вашей заявки: <span className="font-bold text-white">#{submittedId}</span>
        </p>
        <p style={{ color: "#8898b8" }} className="mb-6">
          Мы рассмотрим вашу заявку и свяжемся с вами по указанному email.
        </p>
        <a
          href="/my-application"
          className="btn-secondary inline-block mb-4"
        >
          Редактировать заявку позже
        </a>
        <br />
        <button
          onClick={() => {
            setIsSubmitted(false);
            setSubmittedId(null);
            setFormData({
              applicantName: "",
              applicantEmail: "",
              divisionId: "",
              title: "",
              category: "",
              type: "",
              format: "individual",
              teamMembers: [{ name: "", position: "", divisionName: "" }],
              descriptionProblem: "",
              descriptionSolution: "",
              expectedEffect: "",
              resourcesNeeded: [],
              otherResources: "",
            });
            setSelectedFiles([]);
            setUploadedFiles([]);
          }}
          className="btn-primary"
        >
          Подать ещё одну заявку
        </button>
      </div>
    );
  }

  const isFormValid = !!(formData.title && formData.category && formData.type && formData.applicantName && formData.applicantEmail && formData.divisionId && formData.descriptionProblem.length >= 100 && formData.descriptionSolution.length >= 100);

  return (
    <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }} className="max-w-4xl mx-auto space-y-8">
      {/* Contact Info */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-6">Контактная информация</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
              ФИО заявителя *
            </label>
            <input
              type="text"
              required
              value={formData.applicantName}
              onChange={(e) => setFormData((prev) => ({ ...prev, applicantName: e.target.value }))}
              placeholder="Иванов Иван Иванович"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
              Корпоративный email *
            </label>
            <input
              type="email"
              required
              value={formData.applicantEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, applicantEmail: e.target.value }))}
              placeholder="ivanov@taipit.ru"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
              Дивизион *
            </label>
            <select
              required
              value={formData.divisionId}
              onChange={(e) => setFormData((prev) => ({ ...prev, divisionId: e.target.value }))}
            >
              <option value="">Выберите дивизион...</option>
              {dbDivisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-6">О проекте</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
              Название проекта/идеи *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Автоматизация обработки заказов с помощью AI"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium mb-4" style={{ color: "#8898b8" }}>
              Категория *
            </label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                  className="text-left p-4 rounded-xl transition-all"
                  style={{
                    background:
                      formData.category === cat.id
                        ? `${cat.color}15`
                        : "rgba(99, 130, 255, 0.04)",
                    border: `2px solid ${
                      formData.category === cat.id ? cat.color : "rgba(99, 130, 255, 0.12)"
                    }`,
                  }}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="font-semibold text-white text-sm mb-1">{cat.name}</div>
                  <div className="text-xs" style={{ color: "#8898b8" }}>
                    {cat.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Application Type */}
          <div>
            <label className="block text-sm font-medium mb-4" style={{ color: "#8898b8" }}>
              Тип заявки *
            </label>
            <div className="flex flex-wrap gap-3">
              {applicationTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: type.id }))}
                  className="px-4 py-3 rounded-xl transition-all text-left"
                  style={{
                    background:
                      formData.type === type.id
                        ? "rgba(99, 130, 255, 0.15)"
                        : "rgba(99, 130, 255, 0.04)",
                    border: `2px solid ${
                      formData.type === type.id ? "#6382ff" : "rgba(99, 130, 255, 0.12)"
                    }`,
                  }}
                >
                  <div className="font-semibold text-white text-sm">{type.name}</div>
                  <div className="text-xs" style={{ color: "#8898b8" }}>
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Participation Format */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-6">Формат участия</h3>
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, format: "individual" }))}
            className="px-6 py-3 rounded-xl transition-all"
            style={{
              background:
                formData.format === "individual"
                  ? "rgba(99, 130, 255, 0.15)"
                  : "rgba(99, 130, 255, 0.04)",
              border: `2px solid ${
                formData.format === "individual" ? "#6382ff" : "rgba(99, 130, 255, 0.12)"
              }`,
              color: "white",
            }}
          >
            Индивидуально
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, format: "team" }))}
            className="px-6 py-3 rounded-xl transition-all"
            style={{
              background:
                formData.format === "team"
                  ? "rgba(99, 130, 255, 0.15)"
                  : "rgba(99, 130, 255, 0.04)",
              border: `2px solid ${
                formData.format === "team" ? "#6382ff" : "rgba(99, 130, 255, 0.12)"
              }`,
              color: "white",
            }}
          >
            Команда
          </button>
        </div>

        {formData.format === "team" && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "#8898b8" }}>
              Укажите участников команды (от 2 до 5 человек)
            </p>
            {formData.teamMembers.map((member, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 grid md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="ФИО"
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Должность"
                    value={member.position}
                    onChange={(e) => updateTeamMember(index, "position", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Дивизион"
                    value={member.divisionName}
                    onChange={(e) => updateTeamMember(index, "divisionName", e.target.value)}
                  />
                </div>
                {formData.teamMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="p-2 rounded-lg transition-all"
                    style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {formData.teamMembers.length < 5 && (
              <button
                type="button"
                onClick={addTeamMember}
                className="text-sm font-medium transition-colors"
                style={{ color: "#6382ff" }}
              >
                + Добавить участника
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-6">Описание</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
              Описание проблемы/возможности * <span className="text-xs">(мин. 100 символов)</span>
            </label>
            <textarea
              required
              minLength={100}
              rows={4}
              value={formData.descriptionProblem}
              onChange={(e) => setFormData((prev) => ({ ...prev, descriptionProblem: e.target.value }))}
              placeholder="Опишите текущую ситуацию и проблему, которую хотите решить..."
            />
            <div className="text-xs mt-1" style={{ color: "#5a6a8a" }}>
              {formData.descriptionProblem.length}/100 символов
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
              Описание решения с AI * <span className="text-xs">(мин. 100 символов)</span>
            </label>
            <textarea
              required
              minLength={100}
              rows={4}
              value={formData.descriptionSolution}
              onChange={(e) => setFormData((prev) => ({ ...prev, descriptionSolution: e.target.value }))}
              placeholder="Как AI поможет решить проблему? Какие инструменты планируете использовать?"
            />
            <div className="text-xs mt-1" style={{ color: "#5a6a8a" }}>
              {formData.descriptionSolution.length}/100 символов
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
              Ожидаемый эффект *
            </label>
            <textarea
              required
              rows={3}
              value={formData.expectedEffect}
              onChange={(e) => setFormData((prev) => ({ ...prev, expectedEffect: e.target.value }))}
              placeholder="Какой результат ожидаете? Экономия времени, денег, повышение качества..."
            />
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Презентация (необязательно)</h3>
        <p className="text-sm mb-4" style={{ color: "#8898b8" }}>
          Прикрепите презентацию или скриншоты (PDF, PNG, JPG). До 3 файлов, каждый до 10 МБ.
        </p>
        <div
          className="rounded-xl p-6 text-center cursor-pointer transition-all"
          style={{
            border: "2px dashed rgba(99, 130, 255, 0.25)",
            background: "rgba(99, 130, 255, 0.03)",
          }}
          onClick={() => document.getElementById("file-input")?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#6382ff"; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = "rgba(99, 130, 255, 0.25)"; }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "rgba(99, 130, 255, 0.25)";
            const files = Array.from(e.dataTransfer.files).filter(
              (f) => ["application/pdf", "image/png", "image/jpeg"].includes(f.type) && f.size <= 10 * 1024 * 1024
            );
            setSelectedFiles((prev) => [...prev, ...files].slice(0, 3));
            setUploadedFiles([]);
          }}
        >
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-2xl mb-2">📎</div>
          <div className="text-sm text-white">Нажмите или перетащите файлы сюда</div>
          <div className="text-xs mt-1" style={{ color: "#5a6a8a" }}>PDF, PNG, JPG</div>
        </div>
        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "rgba(99, 130, 255, 0.06)", border: "1px solid rgba(99, 130, 255, 0.12)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg flex-shrink-0">
                    {file.type === "application/pdf" ? "📄" : "🖼️"}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{file.name}</div>
                    <div className="text-xs" style={{ color: "#5a6a8a" }}>
                      {(file.size / 1024 / 1024).toFixed(1)} МБ
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1.5 rounded-lg transition-all flex-shrink-0"
                  style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        {isUploading && (
          <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: "#6382ff" }}>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Загружаем файлы...
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Необходимые ресурсы</h3>
        <p className="text-sm mb-4" style={{ color: "#8898b8" }}>
          Выберите ресурсы, которые вам понадобятся для реализации
        </p>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {resources.map((resource, index) => (
            <label
              key={resource}
              htmlFor={`resource-${index}`}
              className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
              style={{
                background: formData.resourcesNeeded.includes(resource)
                  ? "rgba(99, 130, 255, 0.1)"
                  : "rgba(99, 130, 255, 0.03)",
                border: `1px solid ${
                  formData.resourcesNeeded.includes(resource)
                    ? "rgba(99, 130, 255, 0.3)"
                    : "rgba(99, 130, 255, 0.1)"
                }`,
              }}
            >
              <input
                type="checkbox"
                id={`resource-${index}`}
                checked={formData.resourcesNeeded.includes(resource)}
                onChange={() => toggleResource(resource)}
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                aria-label={resource}
              />
              <span className="text-sm text-white leading-tight">{resource}</span>
            </label>
          ))}
        </div>
        {formData.resourcesNeeded.includes("Другое") && (
          <input
            type="text"
            placeholder="Укажите, что именно вам нужно..."
            value={formData.otherResources}
            onChange={(e) => setFormData((prev) => ({ ...prev, otherResources: e.target.value }))}
          />
        )}
      </div>

      {/* Check / Submit */}
      <div className="text-center">
        <button
          type="submit"
          disabled={isAnalyzing || !isFormValid}
          className="btn-primary !px-12 !py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Анализируем...
            </span>
          ) : (
            "🔍 Проверить заявку"
          )}
        </button>
        <p className="text-sm mt-4" style={{ color: "#5a6a8a" }}>
          AI проанализирует вашу заявку и даст советы по улучшению перед отправкой
        </p>
      </div>
    </form>
  );
}
