"use client";

import { useState } from "react";
import Link from "next/link";

const voters = [
  {
    icon: "👥",
    title: "Все сотрудники",
    description: "Каждый из ~800 приглашённых может проголосовать за понравившиеся идеи",
  },
  {
    icon: "👔",
    title: "Руководители",
    description: "Голос руководителя весит больше — потому что он лучше видит, что реально внедрить",
  },
  {
    icon: "🎓",
    title: "Комиссия из 3 человек",
    description: "Финальная проверка: представитель сотрудников + руководства + учредителей",
  },
];

const steps = [
  {
    icon: "📝",
    title: "Подаёшь идею",
    description: "Заполняешь форму на сайте. Можно подать одному или командой.",
    color: "#60a5fa",
  },
  {
    icon: "🗳️",
    title: "Все голосуют",
    description: "После 30 апреля открывается голосование. Ты смотришь идеи и отдаёшь голоса тем, которые нравятся. Голосование анонимное.",
    color: "#f59e0b",
  },
  {
    icon: "🏆",
    title: "Определяются лидеры",
    description: "По всем поданным проектам формируется рейтинг. Комиссия проверяет топ-30 — чтобы всё было честно и реализуемо.",
    color: "#a78bfa",
  },
  {
    icon: "🎉",
    title: "Победители получают премии",
    description: "Авторы 30 проектов-победителей получают премию. Лучшие презентуют свои идеи на общей встрече.",
    color: "#4ade80",
  },
];

const faqs = [
  {
    question: "Я могу голосовать за свою идею?",
    answer: "Нет — это было бы нечестно. Но за тебя могут голосовать коллеги!",
  },
  {
    question: "А если я не разбираюсь в AI?",
    answer: "Не нужно разбираться в технологиях. Голосуй за идею, которая кажется полезной для работы.",
  },
  {
    question: "Кто увидит, как я проголосовал?",
    answer: "Никто. Голосование полностью анонимное.",
  },
  {
    question: "Почему голос руководителя весит больше?",
    answer: "Руководители лучше понимают, какие идеи можно реально внедрить. Но большинство голосов всё равно у сотрудников.",
  },
  {
    question: "Что делает комиссия?",
    answer: "Проверяет топ идей на реализуемость и честность. Комиссия не может полностью отменить народный выбор — она лишь корректирует итог.",
  },
  {
    question: "Можно подать несколько идей?",
    answer: "Да, до 3 заявок на одного сотрудника.",
  },
];

export default function VotingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Как мы выбираем победителей
          </h1>
          <p className="text-lg" style={{ color: "#8898b8" }}>
            Всё честно. Всё прозрачно. За 2 минуты станет понятно.
          </p>
        </div>

        {/* Block 1: Who votes */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Кто голосует</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {voters.map((voter, index) => (
              <div key={index} className="card text-center">
                <div className="text-5xl mb-4">{voter.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{voter.title}</h3>
                <p className="text-sm" style={{ color: "#8898b8" }}>
                  {voter.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Block 2: How it works - Timeline */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Как это работает</h2>
          <div className="max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${step.color}20`, border: `2px solid ${step.color}` }}
                  >
                    {step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className="w-0.5 flex-1 my-2"
                      style={{ background: "rgba(99, 130, 255, 0.2)" }}
                    />
                  )}
                </div>
                {/* Content */}
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm" style={{ color: "#8898b8" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Block 3: FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Частые вопросы</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="card cursor-pointer"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white">{faq.question}</h3>
                  <span
                    className="text-xl transition-transform"
                    style={{
                      color: "#6382ff",
                      transform: openFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </div>
                {openFaq === index && (
                  <p className="mt-4 text-sm" style={{ color: "#8898b8" }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Block 4: Link to algorithm */}
        <section
          className="p-6 rounded-xl text-center"
          style={{
            background: "rgba(99, 130, 255, 0.05)",
            border: "1px solid rgba(99, 130, 255, 0.2)",
          }}
        >
          <p className="mb-4" style={{ color: "#8898b8" }}>
            Хочешь разобраться в деталях? Посмотри, как устроен алгоритм голосования с интерактивным калькулятором
          </p>
          <Link href="/voting/algorithm" className="btn-primary">
            Алгоритм голосования
          </Link>
        </section>
      </div>
    </div>
  );
}
