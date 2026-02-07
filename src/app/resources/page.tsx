"use client";

import { useState } from "react";
import Link from "next/link";

interface Resource {
  id: number;
  title: string;
  description: string;
  type: "article" | "video" | "pdf" | "link";
  url: string;
  category: string;
}

const resources: Resource[] = [
  {
    id: 1,
    title: "Введение в Claude для бизнеса",
    description: "Обзор возможностей Claude AI для корпоративного использования",
    type: "article",
    url: "https://www.anthropic.com/claude",
    category: "Основы AI",
  },
  {
    id: 2,
    title: "Как писать эффективные промпты",
    description: "Руководство по созданию промптов для получения лучших результатов",
    type: "article",
    url: "https://docs.anthropic.com/claude/docs/prompt-engineering",
    category: "Промпт-инжиниринг",
  },
  {
    id: 3,
    title: "Claude Pro vs Claude Team",
    description: "Сравнение тарифных планов и выбор подходящего решения",
    type: "link",
    url: "https://www.anthropic.com/pricing",
    category: "Инструменты",
  },
  {
    id: 4,
    title: "Примеры использования AI в бизнесе",
    description: "Кейсы успешного внедрения AI в различных отраслях",
    type: "article",
    url: "#",
    category: "Кейсы",
  },
  {
    id: 5,
    title: "Безопасность и конфиденциальность",
    description: "Как обеспечить безопасность данных при работе с AI",
    type: "pdf",
    url: "#",
    category: "Безопасность",
  },
  {
    id: 6,
    title: "API документация Claude",
    description: "Техническая документация для разработчиков",
    type: "link",
    url: "https://docs.anthropic.com/",
    category: "Для разработчиков",
  },
];

const faqs = [
  {
    question: "Что такое Claude и чем он отличается от ChatGPT?",
    answer: "Claude — это AI-ассистент от компании Anthropic. Он отличается более глубоким пониманием контекста, способностью работать с длинными документами и повышенным вниманием к безопасности и этичности ответов.",
  },
  {
    question: "Как получить доступ к Claude Pro/Team?",
    answer: "Участники конкурса могут запросить подписку через форму заявки, отметив соответствующий пункт в разделе «Необходимые ресурсы». После рассмотрения заявки вам будет предоставлен доступ.",
  },
  {
    question: "Можно ли использовать AI для работы с конфиденциальными данными?",
    answer: "Claude Team предоставляет корпоративный уровень безопасности с шифрованием данных и гарантией неиспользования ваших данных для обучения моделей. Однако следует соблюдать внутренние политики безопасности компании.",
  },
  {
    question: "Какие задачи можно решать с помощью AI?",
    answer: "AI может помочь с анализом документов, написанием текстов, переводом, генерацией идей, обработкой данных, автоматизацией рутинных задач, созданием контента и многим другим. Главное — правильно сформулировать задачу.",
  },
  {
    question: "Нужны ли навыки программирования для использования AI?",
    answer: "Нет, базовое использование Claude не требует навыков программирования. Вы общаетесь с AI на естественном языке. Для более сложных интеграций может потребоваться помощь разработчика.",
  },
  {
    question: "Как подготовить хорошую заявку на конкурс?",
    answer: "Опишите конкретную проблему, которую хотите решить, объясните как AI может помочь, укажите ожидаемый эффект (экономия времени, денег, повышение качества). Чем конкретнее — тем лучше.",
  },
];

const typeIcons: Record<string, { icon: string; label: string }> = {
  article: { icon: "📄", label: "Статья" },
  video: { icon: "🎥", label: "Видео" },
  pdf: { icon: "📕", label: "PDF" },
  link: { icon: "🔗", label: "Ссылка" },
};

export default function ResourcesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ресурсы и обучение
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#8898b8" }}>
            Материалы для изучения AI и подготовки к конкурсу
          </p>
        </div>

        {/* Resources Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Обучающие материалы</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card group hover:border-[#6382ff] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "rgba(99, 130, 255, 0.1)" }}
                  >
                    {typeIcons[resource.type].icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(99, 130, 255, 0.15)", color: "#6382ff" }}
                      >
                        {resource.category}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "#5a6a8a" }}
                      >
                        {typeIcons[resource.type].label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-[#6382ff] transition-colors mb-1">
                      {resource.title}
                    </h3>
                    <p className="text-sm" style={{ color: "#8898b8" }}>
                      {resource.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Частые вопросы</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="card cursor-pointer"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white pr-4">{faq.question}</h3>
                  <span
                    className="text-xl transition-transform flex-shrink-0"
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

        {/* CTA Section */}
        <section
          className="p-8 rounded-xl text-center"
          style={{
            background: "rgba(99, 130, 255, 0.05)",
            border: "1px solid rgba(99, 130, 255, 0.2)",
          }}
        >
          <h3 className="text-xl font-bold text-white mb-2">Остались вопросы?</h3>
          <p className="mb-4" style={{ color: "#8898b8" }}>
            Задайте их на форуме или свяжитесь с модератором
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/forum" className="btn-primary">
              Перейти на форум
            </Link>
            <Link href="/contest#apply" className="btn-secondary">
              Подать заявку
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
