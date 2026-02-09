"use client";

import { useState } from "react";
import { divisions } from "@/data/testimonials";

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          resourcesNeeded: JSON.stringify([...formData.resourcesNeeded, formData.otherResources].filter(Boolean)),
          teamMembers: formData.format === "team" ? formData.teamMembers : [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmittedId(data.id);
        setIsSubmitted(true);
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
          }}
          className="btn-primary"
        >
          Подать ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
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
              {divisions.map((div) => (
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

      {/* Resources */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Необходимые ресурсы</h3>
        <p className="text-sm mb-4" style={{ color: "#8898b8" }}>
          Выберите ресурсы, которые вам понадобятся для реализации
        </p>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {resources.map((resource) => (
            <label
              key={resource}
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
                checked={formData.resourcesNeeded.includes(resource)}
                onChange={() => toggleResource(resource)}
                className="w-4 h-4 mt-0.5 flex-shrink-0"
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

      {/* Submit */}
      <div className="text-center">
        <button
          type="submit"
          disabled={isSubmitting || !formData.category || !formData.type}
          className="btn-primary !px-12 !py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Отправка...
            </span>
          ) : (
            "Отправить заявку"
          )}
        </button>
        <p className="text-sm mt-4" style={{ color: "#5a6a8a" }}>
          Нажимая кнопку, вы соглашаетесь с условиями конкурса
        </p>
      </div>
    </form>
  );
}
