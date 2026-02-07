import { testimonials } from "@/data/testimonials";
import Link from "next/link";
import Avatar from "@/components/Avatar";

export const metadata = {
  title: "Истории успеха — EAI Hub Тайпит",
  description: "Реальные истории сотрудников Тайпит, которые используют AI в работе и получают измеримые результаты.",
};

export default function TestimonialsPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden py-16">
        <div className="hero-glow absolute inset-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Истории успеха</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "#8898b8" }}>
            Ваши коллеги уже используют AI и получают реальные результаты.
            Узнайте, как они это делают.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {testimonials.map((testimonial, index) => (
              <article
                key={testimonial.id}
                id={testimonial.id}
                className={`scroll-mt-24 ${
                  index % 2 === 0 ? "" : "rounded-2xl p-8 -mx-4 md:mx-0"
                }`}
                style={index % 2 !== 0 ? { background: "rgba(99, 130, 255, 0.03)" } : undefined}
              >
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Profile Card */}
                  <div className="md:col-span-1">
                    <div className="card sticky top-24">
                      <div className="flex flex-col items-center text-center">
                        <Avatar src={testimonial.photo} name={testimonial.name} size="xl" className="mb-4" />
                        <h2 className="text-xl font-bold text-white mb-1">
                          {testimonial.name}
                        </h2>
                        <p className="font-medium mb-2" style={{ color: "#6382ff" }}>
                          {testimonial.position}
                        </p>
                        <p className="text-sm mb-4" style={{ color: "#8898b8" }}>
                          {testimonial.responsibility}
                        </p>
                        <div
                          className="text-sm px-3 py-1 rounded-full"
                          style={{ background: "rgba(99, 130, 255, 0.1)", color: "#6382ff" }}
                        >
                          {testimonial.division}
                        </div>
                      </div>

                      {/* Results */}
                      <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(99, 130, 255, 0.15)" }}>
                        <h3 className="font-semibold text-white mb-3 text-center">
                          Результаты
                        </h3>
                        <ul className="space-y-2">
                          {testimonial.results.map((result, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <svg
                                className="w-5 h-5 flex-shrink-0 mt-0.5"
                                fill="#4ade80"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span style={{ color: "#e2e8f0" }}>{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Full Text */}
                  <div className="md:col-span-2">
                    <div className="card">
                      <blockquote
                        className="text-lg italic mb-6 pl-4"
                        style={{
                          color: "#8898b8",
                          borderLeft: "4px solid #6382ff",
                        }}
                      >
                        {testimonial.summary}
                      </blockquote>

                      <div className="space-y-4">
                        {testimonial.fullText.split("\n\n").map((paragraph, i) => {
                          if (paragraph.startsWith("**") && paragraph.includes(":**")) {
                            const [title, ...rest] = paragraph.split(":**");
                            return (
                              <div key={i} className="mb-4">
                                <h3 className="font-semibold text-white mb-2">
                                  {title.replace(/\*\*/g, "")}
                                </h3>
                                <p style={{ color: "#e2e8f0" }}>{rest.join(":**")}</p>
                              </div>
                            );
                          }
                          if (paragraph.startsWith("**")) {
                            return (
                              <h3 key={i} className="font-semibold text-white mb-2 mt-6">
                                {paragraph.replace(/\*\*/g, "")}
                              </h3>
                            );
                          }
                          if (paragraph.startsWith("- ")) {
                            const items = paragraph.split("\n").filter(line => line.startsWith("- "));
                            return (
                              <ul key={i} className="list-disc list-inside mb-4 space-y-1" style={{ color: "#e2e8f0" }}>
                                {items.map((item, j) => (
                                  <li key={j}>{item.replace("- ", "")}</li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <p key={i} className="mb-4" style={{ color: "#e2e8f0" }}>
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient relative overflow-hidden">
        <div className="hero-glow absolute inset-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Хотите поделиться своей историей?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: "#8898b8" }}>
            Участвуйте в конкурсе EAI Challenge и расскажите, как AI помогает вам в работе.
          </p>
          <Link href="/contest#apply" className="btn-primary">
            Подать заявку на конкурс
          </Link>
        </div>
      </section>
    </>
  );
}
