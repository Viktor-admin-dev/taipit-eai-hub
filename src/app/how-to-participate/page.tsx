"use client";

import Link from "next/link";
import { useState } from "react";

// Данные тьюторов
const tutors = [
  {
    name: "Виктор Ярутов",
    role: "Акционер, инициатор EAI Challenge",
  },
  {
    name: "Дмитрий Николаев",
    role: "Акционер, тьютор",
  },
];

// FAQ данные
const faqItems = [
  {
    question: "Нужно ли мне уметь программировать?",
    answer: "Нет. Достаточно описать проблему и идею решения. Тьютор поможет с технической частью.",
  },
  {
    question: "Сколько заявок я могу подать?",
    answer: "Не более 3 заявок (индивидуально или в составе разных команд).",
  },
  {
    question: "Можно ли участвовать командой?",
    answer: "Да, команда от 2 до 5 человек. Команда может быть межадивизионной.",
  },
  {
    question: "Что если мою заявку отклонят?",
    answer: "Вы получите обратную связь и сможете доработать и подать заявку повторно.",
  },
  {
    question: "Какие сроки?",
    answer: "Приём заявок до 30 апреля 2026. Голосование — май 2026.",
  },
];

// Этапы воронки
const stages = [
  {
    number: 1,
    icon: "pencil",
    title: "Опиши свою идею",
    subtitle: "Подача заявки",
    content: [
      "Любой сотрудник Тайпит может подать заявку через форму на сайте",
      "В заявке нужно указать:",
    ],
    subItems: [
      "Название идеи / проекта",
      "Описание проблемы, которую вы хотите решить с помощью AI",
      "Ожидаемый результат — что изменится после внедрения",
      "Какая помощь нужна для реализации (ресурсы, компетенции, инструменты)",
    ],
    note: "Не нужно быть программистом — достаточно видеть, где AI может помочь",
    cta: { text: "Подать заявку", href: "/contest#apply" },
  },
  {
    number: 2,
    icon: "search",
    title: "Экспертная оценка",
    subtitle: "Отбор комиссией",
    content: [
      "Поданные заявки рассматривает экспертная комиссия",
      "Комиссия оценивает:",
    ],
    subItems: [
      "Актуальность и применимость идеи для бизнеса",
      "Реалистичность реализации",
      "Потенциальный эффект (экономия времени, денег, повышение качества)",
    ],
    decisions: [
      { icon: "check", text: "Одобрить — проект переходит на следующий этап", color: "#4ade80" },
      { icon: "refresh", text: "На доработку — автор получает рекомендации и может подать повторно", color: "#f59e0b" },
      { icon: "x", text: "Отклонить — с объяснением причин", color: "#ef4444" },
    ],
  },
  {
    number: 3,
    icon: "graduation",
    title: "Поддержка и наставничество",
    subtitle: "Назначение тьютора и ресурсов",
    content: [
      "Одобренному проекту назначается тьютор — наставник, который поможет довести идею до реализации",
      "Тьютор помогает:",
    ],
    subItems: [
      "Сформулировать техническое задание",
      "Выбрать подходящие AI-инструменты",
      "Спланировать этапы реализации",
      "Преодолеть технические барьеры",
    ],
    resources: [
      "Подписка на Claude Pro / Team",
      "Доступ к Claude Code",
      "Время и бюджет на реализацию (определяется индивидуально)",
    ],
    showTutors: true,
  },
  {
    number: 4,
    icon: "rocket",
    title: "Воплощение идеи",
    subtitle: "Реализация и результат",
    content: [
      "Вместе с тьютором вы реализуете своё решение",
      "Готовое решение участвует в голосовании внутри дивизиона",
      "Лучшие проекты получают:",
    ],
    rewards: [
      "Денежную премию (3 премии в каждом из 15 дивизионов = 45 премий)",
      "Подписку на AI-инструменты",
      "Признание на уровне всего холдинга",
    ],
    note: "Успешные решения внедряются в рабочие процессы компании",
  },
];

// Компонент иконки
function StageIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    pencil: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    search: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    graduation: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422m-6.16 3.422V20.5" />
      </svg>
    ),
    rocket: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  };
  return icons[type] || null;
}

// Компонент FAQ аккордеон
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqItems.map((item, index) => (
        <div
          key={index}
          className="rounded-xl overflow-hidden"
          style={{ background: "rgba(99, 130, 255, 0.04)", border: "1px solid rgba(99, 130, 255, 0.12)" }}
        >
          <button
            className="w-full px-6 py-4 flex items-center justify-between text-left"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span className="font-medium text-white">{item.question}</span>
            <svg
              className={`w-5 h-5 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
              style={{ color: "#6382ff" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4 animate-fadeIn">
              <p style={{ color: "#8898b8" }}>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Компонент карточки этапа
function StageCard({ stage, isLast }: { stage: typeof stages[0]; isLast: boolean }) {
  return (
    <div className="relative flex flex-col md:flex-row gap-4 md:gap-8">
      {/* Номер и линия */}
      <div className="flex md:flex-col items-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #4a65f0, #6382ff)", color: "white" }}
        >
          <StageIcon type={stage.icon} />
        </div>
        {!isLast && (
          <div
            className="hidden md:block w-0.5 flex-1 min-h-8 my-2"
            style={{ background: "linear-gradient(to bottom, #6382ff, transparent)" }}
          />
        )}
        {!isLast && (
          <div
            className="md:hidden h-0.5 flex-1 min-w-8 mx-2"
            style={{ background: "linear-gradient(to right, #6382ff, transparent)" }}
          />
        )}
      </div>

      {/* Контент карточки */}
      <div className="card flex-1 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ background: "rgba(99, 130, 255, 0.15)", color: "#6382ff" }}
          >
            Этап {stage.number}
          </span>
          <span className="text-sm" style={{ color: "#8898b8" }}>{stage.subtitle}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-4">{stage.title}</h3>

        <div className="space-y-3" style={{ color: "#e2e8f0" }}>
          {stage.content.map((text, i) => (
            <p key={i}>{text}</p>
          ))}

          {stage.subItems && (
            <ul className="list-disc list-inside space-y-1 pl-2" style={{ color: "#8898b8" }}>
              {stage.subItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}

          {stage.decisions && (
            <div className="space-y-2 mt-4">
              <p className="font-medium text-white">По итогам отбора комиссия принимает решение:</p>
              {stage.decisions.map((decision, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${decision.color}20`, color: decision.color }}
                  >
                    {decision.icon === "check" && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {decision.icon === "refresh" && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {decision.icon === "x" && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span style={{ color: "#e2e8f0" }}>{decision.text}</span>
                </div>
              ))}
            </div>
          )}

          {stage.resources && (
            <div className="mt-4">
              <p className="font-medium text-white mb-2">Также выделяются ресурсы:</p>
              <ul className="list-disc list-inside space-y-1 pl-2" style={{ color: "#8898b8" }}>
                {stage.resources.map((resource, i) => (
                  <li key={i}>{resource}</li>
                ))}
              </ul>
            </div>
          )}

          {stage.rewards && (
            <ul className="list-disc list-inside space-y-1 pl-2" style={{ color: "#8898b8" }}>
              {stage.rewards.map((reward, i) => (
                <li key={i}>{reward}</li>
              ))}
            </ul>
          )}

          {stage.note && (
            <p className="italic" style={{ color: "#6382ff" }}>{stage.note}</p>
          )}

          {stage.showTutors && (
            <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(99, 130, 255, 0.15)" }}>
              <p className="font-medium text-white mb-3">Тьюторы:</p>
              <div className="flex flex-wrap gap-3">
                {tutors.map((tutor, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl"
                    style={{ background: "rgba(99, 130, 255, 0.08)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #4a65f0, #6382ff)" }}
                    >
                      {tutor.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{tutor.name}</p>
                      <p className="text-xs" style={{ color: "#8898b8" }}>{tutor.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage.cta && (
            <div className="mt-4">
              <Link href={stage.cta.href} className="btn-primary inline-flex items-center gap-2">
                {stage.cta.text}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HowToParticipatePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden py-16">
        <div className="hero-glow absolute inset-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <span
            className="text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full inline-block mb-4"
            style={{ background: "rgba(99, 130, 255, 0.15)", color: "#6382ff" }}
          >
            Как участвовать
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Твой путь от идеи до реализации
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "#8898b8" }}>
            4 этапа, чтобы превратить вашу идею в работающее AI-решение
          </p>
        </div>
      </section>

      {/* Funnel / Stages Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {stages.map((stage, index) => (
              <StageCard key={stage.number} stage={stage} isLast={index === stages.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16" style={{ background: "rgba(99, 130, 255, 0.03)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Частые вопросы</h2>
            <p className="section-subtitle mx-auto">
              Ответы на популярные вопросы об участии в конкурсе
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="hero-glow absolute inset-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Готов предложить свою идею?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: "#8898b8" }}>
            Опиши проблему — мы поможем найти решение с AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contest#apply" className="btn-primary text-lg !px-8 !py-4">
              Подать заявку
            </Link>
            <Link href="/contest" className="btn-secondary text-lg !px-8 !py-4">
              Читать условия конкурса
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
