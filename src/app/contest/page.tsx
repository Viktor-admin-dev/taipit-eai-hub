"use client";

import { divisions, contestTimeline } from "@/data/testimonials";
import { useState } from "react";

export default function ContestPage() {
  const [formData, setFormData] = useState({
    projectName: "",
    division: "",
    category: "",
    applicationType: "",
    participationType: "individual",
    teamMembers: [{ name: "", position: "", division: "" }],
    problemDescription: "",
    solutionDescription: "",
    expectedEffect: "",
    resources: [] as string[],
    otherResources: "",
    contactEmail: "",
    contactName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: "", position: "", division: "" }]
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const toggleResource = (resource: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.includes(resource)
        ? prev.resources.filter(r => r !== resource)
        : [...prev.resources, resource]
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-4">Заявка отправлена!</h2>
          <p className="text-muted mb-6">
            Спасибо за участие в конкурсе EAI Challenge. Мы рассмотрим вашу заявку и свяжемся с вами в ближайшее время.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                projectName: "",
                division: "",
                category: "",
                applicationType: "",
                participationType: "individual",
                teamMembers: [{ name: "", position: "", division: "" }],
                problemDescription: "",
                solutionDescription: "",
                expectedEffect: "",
                resources: [],
                otherResources: "",
                contactEmail: "",
                contactName: "",
              });
            }}
            className="btn-primary"
          >
            Подать ещё одну заявку
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">EAI Challenge</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Конкурс идей по внедрению AI в холдинге Тайпит.
            45 премий для сотрудников всех дивизионов.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-8">Этапы конкурса</h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            {contestTimeline.map((stage, index) => (
              <div key={stage.week} className="flex md:flex-col items-center md:items-center gap-4 md:gap-2 flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  stage.status === "current"
                    ? "bg-accent text-white"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {index + 1}
                </div>
                <div className="md:text-center">
                  <div className={`font-semibold ${stage.status === "current" ? "text-accent" : "text-primary"}`}>
                    {stage.title}
                  </div>
                  <div className="text-sm text-muted">{stage.week}</div>
                  <div className="text-xs text-muted hidden md:block">{stage.description}</div>
                </div>
                {index < contestTimeline.length - 1 && (
                  <div className="hidden md:block flex-1 h-0.5 bg-gray-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="section-title">Условия участия</h2>

              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-semibold text-primary mb-2">Категории</h3>
                  <ul className="space-y-2 text-muted">
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">A.</span>
                      <span><strong>Оптимизация</strong> — улучшение существующего процесса с помощью AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">B.</span>
                      <span><strong>Инновация</strong> — создание нового продукта/сервиса с AI</span>
                    </li>
                  </ul>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-primary mb-2">Типы заявок</h3>
                  <ul className="space-y-2 text-muted">
                    <li><strong>Идея</strong> — есть концепция, нужны ресурсы для реализации</li>
                    <li><strong>Прототип</strong> — уже начата реализация, есть демо</li>
                    <li><strong>Внедрение</strong> — AI уже используется, есть измеримые результаты</li>
                  </ul>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-primary mb-2">Формат участия</h3>
                  <ul className="space-y-2 text-muted">
                    <li><strong>Индивидуально</strong> — один сотрудник</li>
                    <li><strong>Команда</strong> — от 2 до 5 человек</li>
                  </ul>
                  <p className="text-sm text-muted mt-2">
                    Один сотрудник может подать до 3 заявок.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="section-title">Призы и ресурсы</h2>

              <div className="space-y-6">
                <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                  <h3 className="font-semibold text-primary mb-3">Призы в каждом дивизионе</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">1</span>
                      <span>Денежная премия + годовая подписка Claude Team</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">2</span>
                      <span>Денежная премия + полугодовая подписка Claude Pro</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">3</span>
                      <span>Денежная премия + квартальная подписка Claude Pro</span>
                    </li>
                  </ul>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-primary mb-3">Ресурсы для участников</h3>
                  <ul className="space-y-2 text-muted">
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Подписка Claude Pro или Claude Team
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Доступ к Claude Code
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Консультации с разработчиками
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Обучающие материалы и вебинары
                    </li>
                  </ul>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-primary mb-3">Критерии оценки</h3>
                  <div className="space-y-2">
                    {[
                      { name: "Бизнес-эффект", score: 30 },
                      { name: "Инновационность", score: 20 },
                      { name: "Реализуемость", score: 20 },
                      { name: "Масштабируемость", score: 15 },
                      { name: "Проработанность", score: 15 },
                    ].map(criterion => (
                      <div key={criterion.name} className="flex items-center justify-between">
                        <span className="text-muted">{criterion.name}</span>
                        <span className="font-semibold text-primary">{criterion.score} баллов</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 bg-card scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title text-center mb-2">Подать заявку</h2>
            <p className="section-subtitle text-center mx-auto mb-8">
              Заполните форму, чтобы принять участие в конкурсе EAI Challenge
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <div className="card">
                <h3 className="font-semibold text-primary mb-4">Контактная информация</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                      value={formData.contactName}
                      onChange={e => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Корпоративный email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                      value={formData.contactEmail}
                      onChange={e => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="card">
                <h3 className="font-semibold text-primary mb-4">Информация о проекте</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Название проекта/идеи *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                      value={formData.projectName}
                      onChange={e => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Дивизион *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        value={formData.division}
                        onChange={e => setFormData(prev => ({ ...prev, division: e.target.value }))}
                      >
                        <option value="">Выберите...</option>
                        {divisions.map(div => (
                          <option key={div.id} value={div.id}>{div.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Категория *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        value={formData.category}
                        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Выберите...</option>
                        <option value="optimization">Оптимизация</option>
                        <option value="innovation">Инновация</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Тип заявки *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        value={formData.applicationType}
                        onChange={e => setFormData(prev => ({ ...prev, applicationType: e.target.value }))}
                      >
                        <option value="">Выберите...</option>
                        <option value="idea">Идея</option>
                        <option value="prototype">Прототип</option>
                        <option value="implementation">Внедрение</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participation Type */}
              <div className="card">
                <h3 className="font-semibold text-primary mb-4">Формат участия</h3>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="participationType"
                      value="individual"
                      checked={formData.participationType === "individual"}
                      onChange={e => setFormData(prev => ({ ...prev, participationType: e.target.value }))}
                      className="w-4 h-4 text-accent"
                    />
                    <span>Индивидуально</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="participationType"
                      value="team"
                      checked={formData.participationType === "team"}
                      onChange={e => setFormData(prev => ({ ...prev, participationType: e.target.value }))}
                      className="w-4 h-4 text-accent"
                    />
                    <span>Команда</span>
                  </label>
                </div>

                {formData.participationType === "team" && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted">Укажите участников команды (от 2 до 5 человек)</p>
                    {formData.teamMembers.map((member, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="ФИО"
                            className="px-3 py-2 border border-border rounded-lg text-sm"
                            value={member.name}
                            onChange={e => updateTeamMember(index, "name", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Должность"
                            className="px-3 py-2 border border-border rounded-lg text-sm"
                            value={member.position}
                            onChange={e => updateTeamMember(index, "position", e.target.value)}
                          />
                          <select
                            className="px-3 py-2 border border-border rounded-lg text-sm"
                            value={member.division}
                            onChange={e => updateTeamMember(index, "division", e.target.value)}
                          >
                            <option value="">Дивизион</option>
                            {divisions.map(div => (
                              <option key={div.id} value={div.id}>{div.name}</option>
                            ))}
                          </select>
                        </div>
                        {formData.teamMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTeamMember(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
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
                        className="text-accent hover:text-accent-light text-sm font-medium"
                      >
                        + Добавить участника
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="card">
                <h3 className="font-semibold text-primary mb-4">Описание</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Описание проблемы/возможности *
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                      placeholder="Опишите текущую ситуацию и проблему, которую хотите решить..."
                      value={formData.problemDescription}
                      onChange={e => setFormData(prev => ({ ...prev, problemDescription: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Описание решения с AI *
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                      placeholder="Как AI поможет решить проблему? Какие инструменты планируете использовать?"
                      value={formData.solutionDescription}
                      onChange={e => setFormData(prev => ({ ...prev, solutionDescription: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Ожидаемый эффект *
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                      placeholder="Какой результат ожидаете? Экономия времени, денег, повышение качества..."
                      value={formData.expectedEffect}
                      onChange={e => setFormData(prev => ({ ...prev, expectedEffect: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="card">
                <h3 className="font-semibold text-primary mb-4">Необходимые ресурсы</h3>
                <p className="text-sm text-muted mb-4">Выберите ресурсы, которые вам понадобятся для реализации</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Подписка Claude Pro",
                    "Подписка Claude Team",
                    "Claude Code",
                    "Помощь разработчика",
                    "Обучение",
                    "Доступ к данным",
                  ].map(resource => (
                    <label key={resource} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.resources.includes(resource)}
                        onChange={() => toggleResource(resource)}
                        className="w-4 h-4 text-accent rounded"
                      />
                      <span>{resource}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Другие ресурсы
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Укажите, если нужно что-то ещё..."
                    value={formData.otherResources}
                    onChange={e => setFormData(prev => ({ ...prev, otherResources: e.target.value }))}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
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
                <p className="text-sm text-muted mt-4">
                  Нажимая кнопку, вы соглашаетесь с условиями конкурса
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
