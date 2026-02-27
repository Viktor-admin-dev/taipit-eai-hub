import Link from "next/link";
import ApplicationForm from "@/components/ApplicationForm";

export const metadata = {
  title: "Конкурс EAI Challenge — EAI Hub Тайпит",
  description: "Участвуйте в конкурсе идей по внедрению AI в холдинге Тайпит. 30 премий, поддержка ресурсами, признание.",
};

const timeline = [
  {
    period: "Финиш — 30 апреля 2026",
    stage: "Приём заявок",
    description: "Подавайте идеи, прототипы или внедрённые решения",
    status: "active",
  },
  {
    period: "1 — 15 мая 2026",
    stage: "Голосование",
    description: "Сотрудники и руководители оценивают заявки",
    status: "future",
  },
  {
    period: "16 — 25 мая 2026",
    stage: "Работа комиссии",
    description: "Экспертная оценка топ-5 каждого дивизиона",
    status: "future",
  },
  {
    period: "29 мая 2026",
    stage: "Питч + награждение",
    description: "Финалисты презентуют, вручаем 30 премий",
    status: "future",
  },
];

const prizes = [
  { place: "1 место", amount: "150 000 руб.", color: "#4ade80", count: 5 },
  { place: "2 место", amount: "100 000 руб.", color: "#60a5fa", count: 10 },
  { place: "3 место", amount: "50 000 руб.", color: "#a78bfa", count: 15 },
];

export default function ContestPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden py-16">
        <div className="hero-glow absolute inset-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            EAI Challenge
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "#8898b8" }}>
            Конкурс идей по внедрению Enterprise AI в холдинге Тайпит.
            30 премий для сотрудников всех дивизионов.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16" style={{ background: "rgba(99, 130, 255, 0.03)" }}>
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">Этапы конкурса</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="rounded-xl p-6 text-center relative"
                style={{
                  background: item.status === "active"
                    ? "rgba(99, 130, 255, 0.1)"
                    : "rgba(99, 130, 255, 0.03)",
                  border: item.status === "active"
                    ? "2px solid #6382ff"
                    : "1px solid rgba(99, 130, 255, 0.12)",
                }}
              >
                {item.status === "active" && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "#6382ff", color: "white" }}
                  >
                    Текущий этап
                  </span>
                )}
                <div
                  className="text-sm font-semibold mb-2"
                  style={{ color: item.status === "active" ? "#6382ff" : "#8898b8" }}
                >
                  {item.period}
                </div>
                <h3 className="font-bold text-white mb-2">{item.stage}</h3>
                <p className="text-sm" style={{ color: "#8898b8" }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prizes */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-4">Призовой фонд</h2>
          <p className="section-subtitle text-center mx-auto mb-12">
            По 3 победителя в каждом из 19 дивизионов — всего 30 премий
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {prizes.map((prize) => (
              <div
                key={prize.place}
                className="card text-center"
                style={{ borderColor: `${prize.color}30` }}
              >
                <div
                  className="text-4xl font-bold mb-2"
                  style={{ color: prize.color }}
                >
                  {prize.amount}
                </div>
                <div className="font-semibold text-white mb-1">{prize.place}</div>
                <div className="text-sm" style={{ color: "#8898b8" }}>
                  {prize.count} премий
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voting info */}
      <section className="py-16" style={{ background: "rgba(99, 130, 255, 0.03)" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-title mb-4">Как оцениваются заявки</h2>
            <p className="text-lg mb-6" style={{ color: "#8898b8" }}>
              Используется гибридная модель голосования: ~50% влияния — голоса сотрудников,
              ~20% — голоса руководителей, ~30% — экспертная комиссия.
            </p>
            <Link href="/voting" className="btn-secondary">
              Подробнее о системе голосования
            </Link>
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">Условия конкурса</h2>
          <div className="max-w-4xl mx-auto card">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-bold text-white mb-4">1. Общие положения</h3>
              <p style={{ color: "#e2e8f0" }} className="mb-4">
                Конкурс «EAI Challenge» организован холдингом Тайпит с целью стимулирования использования
                искусственного интеллекта (AI) для повышения эффективности бизнес-процессов.
                Участие добровольное и бесплатное.
              </p>

              <h3 className="text-xl font-bold text-white mb-4 mt-8">2. Участники</h3>
              <ul className="space-y-2 mb-4" style={{ color: "#e2e8f0" }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#4ade80" }}>•</span>
                  Приглашаются ~800 сотрудников холдинга (получают email-приглашение)
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#4ade80" }}>•</span>
                  Участие индивидуально или в команде (2–5 человек)
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#4ade80" }}>•</span>
                  Лимит: не более 3 заявок на сотрудника
                </li>
              </ul>

              <h3 className="text-xl font-bold text-white mb-4 mt-8">3. Типы заявок</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="rounded-lg p-4" style={{ background: "rgba(99, 130, 255, 0.05)" }}>
                  <div className="font-semibold text-white mb-1">Идея</div>
                  <p className="text-sm" style={{ color: "#8898b8" }}>
                    Концепция без реализации. Укажите необходимые ресурсы.
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ background: "rgba(99, 130, 255, 0.05)" }}>
                  <div className="font-semibold text-white mb-1">Прототип</div>
                  <p className="text-sm" style={{ color: "#8898b8" }}>
                    Начатая реализация с демонстрацией.
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ background: "rgba(99, 130, 255, 0.05)" }}>
                  <div className="font-semibold text-white mb-1">Внедрение</div>
                  <p className="text-sm" style={{ color: "#8898b8" }}>
                    Работающее решение с измеримыми результатами.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-4 mt-8">4. Ресурсная поддержка</h3>
              <p style={{ color: "#e2e8f0" }} className="mb-4">
                Участники могут запросить: подписку Claude Pro/Team, доступ к Claude Code,
                консультации разработчиков, обучение работе с AI-инструментами.
              </p>

              <h3 className="text-xl font-bold text-white mb-4 mt-8">5. Интеллектуальная собственность</h3>
              <p style={{ color: "#e2e8f0" }}>
                Идеи и решения становятся собственностью холдинга Тайпит.
                Авторство признаётся публично.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 scroll-mt-24" style={{ background: "rgba(99, 130, 255, 0.03)" }}>
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-4">Подать заявку</h2>
          <p className="section-subtitle text-center mx-auto mb-12">
            Заполните форму, чтобы принять участие в конкурсе
          </p>
          <ApplicationForm />
        </div>
      </section>
    </>
  );
}
