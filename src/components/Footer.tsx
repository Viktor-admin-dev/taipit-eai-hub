import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: '#0a1020', borderTop: '1px solid rgba(99, 130, 255, 0.1)' }} className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-white" style={{ background: 'linear-gradient(135deg, #4a65f0, #6382ff)' }}>
                EAI
              </div>
              <div>
                <div className="font-bold text-lg text-white">EAI Hub</div>
                <div className="text-xs" style={{ color: '#8898b8' }}>Холдинг Тайпит</div>
              </div>
            </div>
            <p style={{ color: '#8898b8' }} className="text-sm">
              Платформа внедрения Enterprise AI в холдинге Тайпит.
              Конкурс идей, истории успеха, ресурсы для сотрудников.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Навигация</h3>
            <ul className="space-y-2" style={{ color: '#8898b8' }}>
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
              <li>
                <Link href="/how-to-participate" className="hover:text-white transition-colors">
                  Как участвовать
                </Link>
              </li>
              <li>
                <Link href="/voting" className="hover:text-white transition-colors">
                  Модель голосования
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Контакты модератора</h3>
            <p style={{ color: '#8898b8' }} className="text-sm mb-2">
              Вопросы по конкурсу и платформе:
            </p>
            <a
              href="mailto:eai@taipit.ru"
              className="transition-colors"
              style={{ color: '#6382ff' }}
            >
              eai@taipit.ru
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(99, 130, 255, 0.1)', color: '#5a6a8a' }} className="mt-8 pt-8 text-center text-sm">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Холдинг Тайпит. Все права защищены.</p>
          <p className="mt-1">Внутренний корпоративный ресурс</p>
        </div>
      </div>
    </footer>
  );
}
