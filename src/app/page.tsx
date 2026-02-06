import Link from "next/link";
import { testimonials } from "@/data/testimonials";
import Avatar from "@/components/Avatar";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-primary-light text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            AI уже работает в Тайпит.
            <br />
            <span className="text-accent-light">Присоединяйся.</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-10 max-w-3xl mx-auto">
            Конкурс идей по внедрению Enterprise AI.
            45 премий для сотрудников всех дивизионов.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contest#apply" className="btn-primary text-lg !px-8 !py-4">
              Подать заявку на конкурс
            </Link>
            <Link href="/testimonials" className="btn-secondary !bg-transparent !border-white !text-white hover:!bg-white hover:!text-primary text-lg !px-8 !py-4">
              Истории успеха
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">15</div>
              <div className="text-muted">дивизионов</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">~800</div>
              <div className="text-muted">приглашённых участников</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">45</div>
              <div className="text-muted">премий</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">4</div>
              <div className="text-muted">истории успеха</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Истории успеха</h2>
            <p className="section-subtitle mx-auto">
              Ваши коллеги уже используют AI и получают реальные результаты
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <Link
                key={testimonial.id}
                href={`/testimonials#${testimonial.id}`}
                className="card group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar src={testimonial.photo} name={testimonial.name} size="md" />
                  <div>
                    <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-muted">{testimonial.position}</p>
                  </div>
                </div>
                <p className="text-sm text-muted mb-4 line-clamp-3">
                  {testimonial.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {testimonial.results.slice(0, 2).map((result, i) => (
                    <span
                      key={i}
                      className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                    >
                      {result.split(":")[0]}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/testimonials" className="btn-secondary">
              Все истории успеха
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Как это работает</h2>
            <p className="section-subtitle mx-auto">
              4 простых шага для участия в конкурсе
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Выбери категорию",
                description: "Оптимизация существующего процесса или создание инновации",
              },
              {
                step: "2",
                title: "Опиши идею",
                description: "Проблема, решение с AI, ожидаемый эффект",
              },
              {
                step: "3",
                title: "Получи ресурсы",
                description: "Подписки Claude Pro/Team, помощь разработчиков",
              },
              {
                step: "4",
                title: "Выиграй приз",
                description: "Денежная премия + подписка + признание",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Готов предложить свою идею?
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Участвуй в конкурсе EAI Challenge и получи шанс выиграть премию,
            подписку на AI-инструменты и признание в холдинге.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contest#apply" className="btn-primary !bg-white !text-primary hover:!bg-blue-50 text-lg !px-8 !py-4">
              Подать заявку
            </Link>
            <Link href="/contest" className="btn-secondary !bg-transparent !border-white !text-white hover:!bg-white hover:!text-primary text-lg !px-8 !py-4">
              Условия конкурса
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
