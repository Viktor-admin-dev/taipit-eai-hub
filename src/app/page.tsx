import Link from "next/link";
import { testimonials } from "@/data/testimonials";
import Avatar from "@/components/Avatar";
import StatsSection from "@/components/StatsSection";
import HeroCarousel from "@/components/HeroCarousel";

export default function Home() {
  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Stats Section */}
      <StatsSection />

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
                  <Avatar src={testimonial.photo} name={testimonial.name} size="lg" />
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-[#6382ff] transition-colors">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm" style={{ color: '#8898b8' }}>{testimonial.position}</p>
                  </div>
                </div>
                <p className="text-sm mb-4 line-clamp-3" style={{ color: '#8898b8' }}>
                  {testimonial.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {testimonial.results.slice(0, 2).map((result, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}
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
      <section className="py-20" style={{ background: 'rgba(99, 130, 255, 0.03)' }}>
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
                title: "Читай истории",
                description: "Узнай, как коллеги уже используют AI",
                icon: "📖",
              },
              {
                step: "2",
                title: "Предложи идею",
                description: "Опиши проблему и решение с AI",
                icon: "💡",
              },
              {
                step: "3",
                title: "Получи ресурсы",
                description: "Claude Pro/Team, помощь разработчиков",
                icon: "🛠️",
              },
              {
                step: "4",
                title: "Выиграй приз",
                description: "Премия + признание в холдинге",
                icon: "🏆",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                  style={{ background: 'rgba(99, 130, 255, 0.1)' }}
                >
                  {item.icon}
                </div>
                <div
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#6382ff' }}
                >
                  Шаг {item.step}
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm" style={{ color: '#8898b8' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="hero-glow absolute inset-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Готов предложить свою идею?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#8898b8' }}>
            Участвуй в конкурсе EAI Challenge и получи шанс выиграть премию,
            подписку на AI-инструменты и признание в холдинге.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contest#apply" className="btn-primary text-lg !px-8 !py-4">
              Подать заявку
            </Link>
            <Link href="/contest" className="btn-secondary text-lg !px-8 !py-4">
              Условия конкурса
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
