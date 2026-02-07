"use client";

import { useState } from "react";
import Link from "next/link";

interface TabContent {
  id: string;
  icon: string;
  title: string;
  color: string;
  items: { title: string; description: string }[];
}

const tabs: TabContent[] = [
  {
    id: "personal",
    icon: "👤",
    title: "Для тебя лично",
    color: "#60a5fa",
    items: [
      {
        title: "Премия и признание",
        description:
          "45 премий. Твоя идея может победить — и это не абстрактный конкурс. Это признание на уровне всего холдинга.",
      },
      {
        title: "Новый навык, который уже нельзя игнорировать",
        description:
          "AI меняет рынок труда прямо сейчас. Те, кто освоит эти инструменты сегодня, будут на шаг впереди завтра.",
      },
      {
        title: "Выход из рутины",
        description:
          "Мир стремительно меняется. Это шанс вырваться из привычного ритма, попробовать что-то новое и почувствовать, что ты — часть этих перемен.",
      },
    ],
  },
  {
    id: "team",
    icon: "👥",
    title: "Для твоей команды",
    color: "#4ade80",
    items: [
      {
        title: "Экономия часов каждую неделю",
        description:
          "Рутинные задачи — отчёты, письма, анализ данных — можно ускорить в разы. Одна хорошая идея может высвободить десятки часов.",
      },
      {
        title: "Новые возможности, которых раньше не было",
        description:
          "AI позволяет делать то, на что раньше не хватало рук или бюджета.",
      },
      {
        title: "Командный дух",
        description:
          "Конкурс поощряет командные заявки, в том числе между дивизионами. Шанс найти единомышленников.",
      },
    ],
  },
  {
    id: "company",
    icon: "🏢",
    title: "Для Тайпит",
    color: "#f59e0b",
    items: [
      {
        title: "Конкурентоспособность",
        description:
          "Компании, которые внедряют AI, растут быстрее. Наши конкуренты уже экспериментируют.",
      },
      {
        title: "Стабильность и рост = твоя стабильность",
        description:
          "Более конкурентоспособная компания — это стабильные рабочие места и потенциально более высокие зарплаты.",
      },
      {
        title: "Инновации идут не сверху, а от вас",
        description:
          "Лучшие идеи рождаются у людей, которые каждый день работают с реальными процессами. Руководство это понимает.",
      },
    ],
  },
];

const stakeholderLetter = `Коллеги,

Вы наверняка заметили, что мы запустили EAI Hub и конкурс. Некоторые из вас спрашивают: зачем? Я хочу ответить честно — не лозунгами, а так, как думаю сам.

**Почему именно сейчас**

Мир вокруг нас меняется с такой скоростью, что то, что работало вчера, завтра перестанет работать. AI — это не модная игрушка. Это сдвиг масштаба электричества или интернета. Компании, которые освоят его раньше, получат преимущество. Те, кто опоздает — будут догонять.

Я не хочу, чтобы Тайпит догонял.

**Зачем конкурс, а не приказ**

Можно было издать распоряжение: «всем использовать AI». Но так не работает. Настоящие идеи рождаются не сверху — они рождаются у тех, кто каждый день видит, что можно улучшить. У вас.

Конкурс — это способ дать вам слово. И дать ресурсы тем, у кого есть идеи.

**Что с этого компании**

Каждая идея, которая сэкономит час в день или откроет новую возможность — это наше конкурентное преимущество. Более конкурентоспособная компания — это более стабильная работа, возможности для роста и, да, более высокие зарплаты. Это не абстракция — это прямая связь.

**Что с этого лично вам**

Помимо 45 премий и признания на уровне всего холдинга — вы получаете навык, который будет цениться везде. Умение видеть, где AI может помочь — это компетенция, за которую через год-два будут доплачивать.

А ещё — это возможность вырваться из рутины. Попробовать что-то новое. Почувствовать, что мир вокруг не стоит на месте, и вы — часть этого движения.

Я не прошу вас становиться программистами. Я прошу посмотреть на свою работу свежим взглядом и задать себе вопрос: «А что, если бы у меня был помощник, который умеет читать, писать, анализировать и считать в 100 раз быстрее меня?»

Если ответ вас заинтересует — подайте заявку. Мы поможем с остальным.

Мир меняется. Давайте меняться вместе — и быть среди тех, кто впереди.`;

export default function WhyPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [letterOpen, setLetterOpen] = useState(false);

  const activeTabData = tabs.find((t) => t.id === activeTab)!;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="hero-gradient py-16 md:py-24 relative overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-[46px] font-black mb-2 text-white">
            Зачем нам этот конкурс?
          </h1>
          <h2 className="text-2xl md:text-[36px] font-black mb-6 gradient-text">
            Три причины на трёх уровнях.
          </h2>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: "#8898b8" }}
          >
            Этот конкурс задуман не ради галочки. Вот что стоит за ним — для
            тебя лично, для команды и для всей компании.
          </p>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          {/* Tab Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id ? "scale-105" : "hover:scale-[1.02]"
                }`}
                style={{
                  background:
                    activeTab === tab.id
                      ? `${tab.color}20`
                      : "rgba(99, 130, 255, 0.05)",
                  border: `2px solid ${
                    activeTab === tab.id ? tab.color : "rgba(99, 130, 255, 0.1)"
                  }`,
                }}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span
                  className="font-semibold"
                  style={{ color: activeTab === tab.id ? tab.color : "#8898b8" }}
                >
                  {tab.title}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            <div
              key={activeTab}
              className="grid gap-6 animate-fadeIn"
            >
              {activeTabData.items.map((item, index) => (
                <div
                  key={index}
                  className="card p-6 transition-all"
                  style={{
                    borderLeft: `4px solid ${activeTabData.color}`,
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: activeTabData.color }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ color: "#8898b8" }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Phrase */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div
            className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(99, 130, 255, 0.1), rgba(99, 130, 255, 0.05))",
              border: "1px solid rgba(99, 130, 255, 0.2)",
            }}
          >
            <p className="text-2xl md:text-3xl font-bold text-white mb-2">
              «AI не заменяет людей.
            </p>
            <p className="text-2xl md:text-3xl font-bold gradient-text mb-4">
              AI заменяет тех, кто не использует AI.»
            </p>
            <p className="text-lg" style={{ color: "#8898b8" }}>
              Конкурс — это возможность оказаться на правильной стороне
              перемен.
            </p>
          </div>
        </div>
      </section>

      {/* Stakeholder Letter */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setLetterOpen(!letterOpen)}
              className="w-full card p-6 flex items-center justify-between transition-all hover:border-[#6382ff]"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">✉️</span>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">
                    Обращение к сотрудникам
                  </h3>
                  <p className="text-sm" style={{ color: "#8898b8" }}>
                    Виктор Ярутов, акционер
                  </p>
                </div>
              </div>
              <svg
                className={`w-6 h-6 transition-transform ${
                  letterOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#6382ff" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {letterOpen && (
              <div
                className="mt-4 p-6 md:p-8 rounded-xl"
                style={{
                  background: "rgba(99, 130, 255, 0.03)",
                  border: "1px solid rgba(99, 130, 255, 0.1)",
                }}
              >
                <div
                  className="prose prose-invert max-w-none"
                  style={{ color: "#8898b8" }}
                >
                  {stakeholderLetter.split("\n\n").map((paragraph, index) => {
                    if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                      // It's a header
                      return null;
                    }
                    if (paragraph.includes("**")) {
                      // Contains bold text (header)
                      const parts = paragraph.split("**");
                      return (
                        <div key={index} className="mb-4">
                          {parts.map((part, i) =>
                            i % 2 === 1 ? (
                              <h4
                                key={i}
                                className="text-lg font-bold text-white mt-6 mb-2"
                              >
                                {part}
                              </h4>
                            ) : part ? (
                              <p key={i} className="italic">
                                {part}
                              </p>
                            ) : null
                          )}
                        </div>
                      );
                    }
                    return (
                      <p key={index} className="mb-4 italic">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                {/* Signature */}
                <div
                  className="mt-8 pt-6 flex items-center gap-4"
                  style={{ borderTop: "1px solid rgba(99, 130, 255, 0.1)" }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #4a65f0, #6382ff)",
                      color: "white",
                    }}
                  >
                    ВЯ
                  </div>
                  <div>
                    <p className="font-bold text-white">Виктор Ярутов</p>
                    <p className="text-sm" style={{ color: "#5a6a8a" }}>
                      Акционер, Тайпит
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Готов попробовать?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contest#apply" className="btn-primary text-lg !px-8 !py-4">
              Подать заявку на конкурс
            </Link>
            <Link href="/testimonials" className="btn-secondary text-lg !px-8 !py-4">
              Читать истории коллег
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
