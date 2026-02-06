import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-xl">
                EAI
              </div>
              <div>
                <div className="font-bold text-lg">EAI Hub</div>
                <div className="text-xs text-blue-200">Холдинг Тайпит</div>
              </div>
            </div>
            <p className="text-blue-200 text-sm">
              Платформа внедрения Enterprise AI в холдинге Тайпит.
              Конкурс идей, истории успеха, ресурсы для сотрудников.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2 text-blue-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-white transition-colors">
                  Истории успеха
                </Link>
              </li>
              <li>
                <Link href="/contest" className="hover:text-white transition-colors">
                  Конкурс EAI Challenge
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Контакты модератора</h3>
            <p className="text-blue-200 text-sm mb-2">
              Вопросы по конкурсу и платформе:
            </p>
            <a
              href="mailto:eai@taipit.ru"
              className="text-accent-light hover:text-white transition-colors"
            >
              eai@taipit.ru
            </a>
          </div>
        </div>

        <div className="border-t border-primary-light mt-8 pt-8 text-center text-blue-200 text-sm">
          <p>&copy; {new Date().getFullYear()} Холдинг Тайпит. Все права защищены.</p>
          <p className="mt-1">Внутренний корпоративный ресурс</p>
        </div>
      </div>
    </footer>
  );
}
