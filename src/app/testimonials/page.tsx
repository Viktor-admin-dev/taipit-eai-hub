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
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Истории успеха</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
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
                  index % 2 === 0 ? "" : "bg-card rounded-2xl p-8 -mx-4 md:mx-0"
                }`}
              >
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Profile Card */}
                  <div className="md:col-span-1">
                    <div className="card sticky top-24">
                      <div className="flex flex-col items-center text-center">
                        <Avatar src={testimonial.photo} name={testimonial.name} size="lg" className="mb-4" />
                        <h2 className="text-xl font-bold text-primary mb-1">
                          {testimonial.name}
                        </h2>
                        <p className="text-accent font-medium mb-2">
                          {testimonial.position}
                        </p>
                        <p className="text-sm text-muted mb-4">
                          {testimonial.responsibility}
                        </p>
                        <div className="bg-blue-50 text-primary text-sm px-3 py-1 rounded-full">
                          {testimonial.division}
                        </div>
                      </div>

                      {/* Results */}
                      <div className="mt-6 pt-6 border-t border-border">
                        <h3 className="font-semibold text-primary mb-3 text-center">
                          Результаты
                        </h3>
                        <ul className="space-y-2">
                          {testimonial.results.map((result, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <svg
                                className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-foreground">{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Full Text */}
                  <div className="md:col-span-2">
                    <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-border">
                      <blockquote className="text-lg text-muted italic mb-6 border-l-4 border-accent pl-4">
                        {testimonial.summary}
                      </blockquote>

                      <div className="prose prose-slate max-w-none">
                        {testimonial.fullText.split("\n\n").map((paragraph, i) => {
                          if (paragraph.startsWith("**") && paragraph.includes(":**")) {
                            const [title, ...rest] = paragraph.split(":**");
                            return (
                              <div key={i} className="mb-4">
                                <h3 className="font-semibold text-primary mb-2">
                                  {title.replace(/\*\*/g, "")}
                                </h3>
                                <p className="text-foreground">{rest.join(":**")}</p>
                              </div>
                            );
                          }
                          if (paragraph.startsWith("**")) {
                            return (
                              <h3 key={i} className="font-semibold text-primary mb-2 mt-6">
                                {paragraph.replace(/\*\*/g, "")}
                              </h3>
                            );
                          }
                          if (paragraph.startsWith("- ")) {
                            const items = paragraph.split("\n").filter(line => line.startsWith("- "));
                            return (
                              <ul key={i} className="list-disc list-inside text-foreground mb-4 space-y-1">
                                {items.map((item, j) => (
                                  <li key={j}>{item.replace("- ", "")}</li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <p key={i} className="text-foreground mb-4">
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
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Хотите поделиться своей историей?
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Участвуйте в конкурсе EAI Challenge и расскажите, как AI помогает вам в работе.
          </p>
          <Link href="/contest#apply" className="btn-primary !bg-white !text-primary hover:!bg-blue-50">
            Подать заявку на конкурс
          </Link>
        </div>
      </section>
    </>
  );
}
