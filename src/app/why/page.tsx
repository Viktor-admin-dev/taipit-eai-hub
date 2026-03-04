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
          "30 премий. Твоя идея может победить — и это признание на уровне всего холдинга.",
      },
      {
        title: "Новый навык, который уже нельзя игнорировать",
        description:
          "AI меняет рынок труда прямо сейчас. Те, кто освоит эти инструменты сегодня, будут на шаг впереди завтра.",
      },
      {
        title: "Выход из рутины",
        description:
          "Мир стремительно меняется. Это шанс вырваться из привычного ритма, попробовать что-то новое.",
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
          "Рутинные задачи — отчёты, письма, анализ данных — можно ускорить в разы.",
      },
      {
        title: "Новые возможности, которых раньше не было",
        description:
          "AI позволяет делать то, на что раньше не хватало рук или бюджета.",
      },
      {
        title: "Командный дух",
        description:
          "Конкурс поощряет командные заявки, в том числе между дивизионами.",
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
          "Более конкурентоспособная компания — это стабильные рабочие места и более высокие зарплаты.",
      },
      {
        title: "Инновации идут не сверху, а от вас",
        description:
          "Лучшие идеи рождаются у людей, которые каждый день работают с реальными процессами.",
      },
    ],
  },
];

interface LetterSection {
  title?: string;
  paragraphs: string[];
}

const letterSections: LetterSection[] = [
  {
    paragraphs: [
      "Коллеги,",
      "Вы наверняка заметили, что мы запустили EAI Hub и конкурс. Некоторые из вас спрашивают: зачем? Я хочу ответить честно — не лозунгами, а так, как думаю сам.",
    ],
  },
  {
    title: "Почему именно сейчас",
    paragraphs: [
      "Мир вокруг нас меняется с такой скоростью, что то, что работало вчера, завтра перестанет работать. AI — это не модная игрушка. Это сдвиг масштаба электричества или интернета. Компании, которые освоят его раньше, получат преимущество. Те, кто опоздает — будут догонять.",
      "Я не хочу, чтобы Тайпит догонял.",
    ],
  },
  {
    title: "Зачем конкурс, а не приказ",
    paragraphs: [
      "Можно было издать распоряжение: «всем использовать AI». Но так не работает. Настоящие идеи рождаются не сверху — они рождаются у тех, кто каждый день видит, что можно улучшить. У вас.",
      "Конкурс — это способ дать вам слово. И дать ресурсы тем, у кого есть идеи.",
    ],
  },
  {
    title: "Что с этого компании",
    paragraphs: [
      "Каждая идея, которая сэкономит час в день или откроет новую возможность — это наше конкурентное преимущество. Более конкурентоспособная компания — это более стабильная работа, возможности для роста и, да, более высокие зарплаты. Это не абстракция — это прямая связь.",
    ],
  },
  {
    title: "Что с этого лично вам",
    paragraphs: [
      "Помимо 30 премий и признания на уровне всего холдинга — вы получаете навык, который будет цениться везде. Умение видеть, где AI может помочь — это компетенция, за которую через год-два будут доплачивать.",
      "А ещё — это возможность вырваться из рутины. Попробовать что-то новое. Почувствовать, что мир вокруг не стоит на месте, и вы — часть этого движения.",
      "Я не прошу вас становиться программистами. Я прошу посмотреть на свою работу свежим взглядом и задать себе вопрос: «А что, если бы у меня был помощник, который умеет читать, писать, анализировать и считать в 100 раз быстрее меня?»",
      "Если ответ вас заинтересует — подайте заявку. Мы поможем с остальным.",
      "Мир меняется. Давайте меняться вместе — и быть среди тех, кто впереди.",
    ],
  },
];

export default function WhyPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const activeTabData = tabs.find((t) => t.id === activeTab)!;

  return (
    <main className="min-h-screen">
      {/* Hero - compact */}
      <section className="hero-gradient py-12 md:py-16 relative overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-[42px] font-black mb-3 text-white">
            Зачем этот конкурс?
          </h1>
          <p className="text-lg" style={{ color: "#8898b8" }}>
            Слово учредителя и три причины участвовать
          </p>
        </div>
      </section>

      {/* Stakeholder Letter - main block */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div
            className="max-w-3xl mx-auto rounded-[20px] p-6 md:p-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(99,130,255,0.04) 0%, rgba(99,130,255,0.02) 100%)",
              border: "1px solid rgba(99,130,255,0.15)",
            }}
          >
            {/* Author block */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #4a65f0, #6382ff)",
                  color: "white",
                }}
              >
                ВЯ
              </div>
              <div>
                <p className="text-xl font-bold text-white">Виктор Ярутов</p>
                <p className="text-sm" style={{ color: "#8898b8" }}>
                  Учредитель
                </p>
              </div>
            </div>

            {/* Divider */}
            <div
              className="mb-8"
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, rgba(99,130,255,0.3) 0%, rgba(99,130,255,0.05) 100%)",
              }}
            />

            {/* Letter content */}
            <div className="space-y-6" style={{ lineHeight: 1.8 }}>
              {letterSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {section.title && (
                    <h3
                      className="text-[17px] font-bold mb-3"
                      style={{ color: "#e0e8f4" }}
                    >
                      {section.title}
                    </h3>
                  )}
                  {section.paragraphs.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-base mb-4 last:mb-0"
                      style={{ color: "#b0bcd0" }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* Signature */}
            <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(99,130,255,0.1)" }}>
              <p className="font-bold text-white">Виктор Ярутов</p>
              <p className="text-sm" style={{ color: "#5a6a8a" }}>
                Учредитель
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Phrase */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div
            className="max-w-3xl mx-auto text-center p-8 md:p-10 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(99, 130, 255, 0.1), rgba(99, 130, 255, 0.05))",
              border: "1px solid rgba(99, 130, 255, 0.2)",
            }}
          >
            <p className="text-xl md:text-2xl font-bold text-white mb-1">
              «AI не делает работу за тебя.
            </p>
            <p className="text-xl md:text-2xl font-bold gradient-text mb-4">
              Он делает тебя сильнее.»
            </p>
            <p className="text-base" style={{ color: "#8898b8" }}>
              Конкурс — это возможность попробовать новые инструменты при поддержке компании.
            </p>
          </div>
        </div>
      </section>

      {/* Three Benefits Tabs */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Section title */}
          <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-8">
            Подробнее: что получает каждый
          </h2>

          {/* Tab Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all cursor-pointer ${
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
            <div key={activeTab} className="grid gap-5 animate-fadeIn">
              {activeTabData.items.map((item, index) => (
                <div
                  key={index}
                  className="card p-5 transition-all"
                  style={{
                    borderLeft: `4px solid ${activeTabData.color}`,
                  }}
                >
                  <h3
                    className="text-lg font-bold mb-2"
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

      {/* CTA */}
      <section className="py-10 md:py-16">
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
