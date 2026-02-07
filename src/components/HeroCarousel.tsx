"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface Slide {
  id: number;
  title: string;
  accent: string;
  subtitle: string;
  antiFear: string;
  cta1: { text: string; href: string };
  cta2: { text: string; href: string };
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Твои коллеги уже экономят часы каждый день.",
    accent: "Узнай как — и получи премию.",
    subtitle:
      "4 директора из 55-го дивизиона рассказывают, как AI изменил их работу. Предложи свою идею — 45 премий ждут авторов лучших решений.",
    antiFear: "Это не про замену людей. Это про то, как работать умнее.",
    cta1: { text: "Подать идею на конкурс", href: "/contest#apply" },
    cta2: { text: "Читать истории коллег", href: "/testimonials" },
  },
  {
    id: 2,
    title: "AI — не замена тебе.",
    accent: "Это твоё усиление.",
    subtitle:
      "Покажи, как искусственный интеллект может улучшить процессы в твоём дивизионе. Лучшие идеи получат премию и ресурсы для реализации.",
    antiFear:
      "Мы ищем не тех, кого заменить — а тех, кто поведёт компанию вперёд.",
    cta1: { text: "Участвовать в конкурсе", href: "/contest#apply" },
    cta2: { text: "Узнать подробности", href: "/contest" },
  },
  {
    id: 3,
    title: "15 дивизионов. 45 премий.",
    accent: "Твой ход.",
    subtitle:
      "Конкурс на лучшую идею по использованию AI в работе. Каждый дивизион — отдельное соревнование. Победители получат премию и всё необходимое для воплощения.",
    antiFear:
      "Не нужно быть программистом. Нужна идея, как сделать свою работу эффективнее.",
    cta1: { text: "Принять вызов", href: "/contest#apply" },
    cta2: { text: "Как это работает", href: "/contest" },
  },
  {
    id: 4,
    title: "Предложи идею —",
    accent: "получи премию и ресурсы.",
    subtitle:
      "Расскажи, как AI может упростить твою работу или работу твоей команды. Мы дадим подписки, консультации разработчиков и поддержку для реализации лучших предложений.",
    antiFear:
      "Даже если у тебя просто идея без технических навыков — подавай заявку. Мы поможем с реализацией.",
    cta1: { text: "Подать заявку", href: "/contest#apply" },
    cta2: { text: "Истории тех, кто уже попробовал", href: "/testimonials" },
  },
  {
    id: 5,
    title: "Вместе разберёмся,",
    accent: "как AI поможет именно тебе.",
    subtitle:
      "Никто не заставляет становиться экспертом за ночь. Задай вопрос на форуме, почитай истории коллег, а когда будешь готов — предложи свою идею. 45 премий для тех, кто попробует.",
    antiFear:
      "Конкурс — это не экзамен. Это возможность попробовать новое при поддержке компании.",
    cta1: { text: "Начать с историй коллег", href: "/testimonials" },
    cta2: { text: "Задать вопрос на форуме", href: "/forum" },
  },
];

const SLIDE_DURATION = 7000; // 7 seconds

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentSlide(index);
      setProgress(0);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, goToSlide]);

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 100 / (SLIDE_DURATION / 50);
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isPaused, nextSlide]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  // Calculate days remaining
  const contestEnd = new Date("2026-04-30T23:59:59");
  const now = new Date();
  const daysRemaining = Math.ceil(
    (contestEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const slide = slides[currentSlide];

  return (
    <section
      ref={containerRef}
      className="hero-gradient relative overflow-hidden py-20 md:py-32 min-h-[600px] md:min-h-[700px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-glow absolute inset-0" />

      {/* Slide Content */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <div
          key={slide.id}
          className={`transition-all duration-300 ${
            isAnimating
              ? "opacity-0 translate-y-5"
              : "opacity-100 translate-y-0"
          }`}
        >
          {/* Title */}
          <h1 className="text-3xl md:text-[46px] font-black mb-2 leading-tight text-white">
            {slide.title}
          </h1>

          {/* Accent */}
          <h2 className="text-3xl md:text-[46px] font-black mb-6 gradient-text">
            {slide.accent}
          </h2>

          {/* Subtitle */}
          <p
            className="text-base md:text-[17px] mb-6 max-w-[640px] mx-auto"
            style={{ color: "#8898b8" }}
          >
            {slide.subtitle}
          </p>

          {/* Anti-fear box */}
          <div className="anti-fear-box max-w-xl mx-auto mb-6">
            <p className="text-sm italic" style={{ color: "#607090" }}>
              «{slide.antiFear}»
            </p>
          </div>

          {/* Contest deadline */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm" style={{ color: "#8898b8" }}>
              Конкурс до 30 апреля 2026
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: "rgba(99, 130, 255, 0.2)", color: "#6382ff" }}
            >
              Осталось {daysRemaining} дней
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={slide.cta1.href}
              className="btn-primary text-lg !px-8 !py-4"
            >
              {slide.cta1.text}
            </Link>
            <Link
              href={slide.cta2.href}
              className="btn-secondary text-lg !px-8 !py-4"
            >
              {slide.cta2.text}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows (visible on hover) */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full opacity-0 hover:opacity-100 transition-opacity hidden md:block"
        style={{ background: "rgba(99, 130, 255, 0.2)" }}
        aria-label="Previous slide"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full opacity-0 hover:opacity-100 transition-opacity hidden md:block"
        style={{ background: "rgba(99, 130, 255, 0.2)" }}
        aria-label="Next slide"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dots and Progress Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        {/* Dots */}
        <div className="flex gap-2 mb-2 justify-center">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-[#6382ff] scale-110"
                  : "border border-[#6382ff] bg-transparent hover:bg-[#6382ff]/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div
          className="w-32 h-1 rounded-full overflow-hidden mx-auto"
          style={{ background: "rgba(99, 130, 255, 0.2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-50"
            style={{
              width: `${progress}%`,
              background: "#6382ff",
            }}
          />
        </div>
      </div>
    </section>
  );
}
