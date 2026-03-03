"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Preset {
  id: string;
  name: string;
  description: string;
  tag: string;
  tagColor: string;
  empPoints: number;
  leaderPoints: number;
  empCount: number;
  leaderCount: number;
  commissionPct: number;
}

const presets: Preset[] = [
  {
    id: "balanced",
    name: "Сбалансированная",
    description: "50/50 между сотрудниками и руководством",
    tag: "Рекомендуемая",
    tagColor: "#4ade80",
    empPoints: 3,
    leaderPoints: 15,
    empCount: 750,
    leaderCount: 50,
    commissionPct: 0,
  },
  {
    id: "democratic",
    name: "Демократическая",
    description: "Голос народа решает, руководство — совещательно",
    tag: "Макс. вовлечённость",
    tagColor: "#60a5fa",
    empPoints: 3,
    leaderPoints: 5,
    empCount: 750,
    leaderCount: 50,
    commissionPct: 0,
  },
  {
    id: "expert",
    name: "Экспертная",
    description: "Руководство имеет решающий голос",
    tag: "Макс. качество",
    tagColor: "#f59e0b",
    empPoints: 1,
    leaderPoints: 10,
    empCount: 750,
    leaderCount: 50,
    commissionPct: 0,
  },
  {
    id: "hybrid",
    name: "Гибридная (3 этапа)",
    description: "Народное голосование → экспертиза → комиссия",
    tag: "Макс. легитимность",
    tagColor: "#a78bfa",
    empPoints: 3,
    leaderPoints: 10,
    empCount: 750,
    leaderCount: 50,
    commissionPct: 30,
  },
];

export default function VotingPage() {
  const [activePreset, setActivePreset] = useState<string>("hybrid");
  const [empPoints, setEmpPoints] = useState(3);
  const [leaderPoints, setLeaderPoints] = useState(10);
  const [empCount, setEmpCount] = useState(750);
  const [leaderCount, setLeaderCount] = useState(50);
  const [commissionPct, setCommissionPct] = useState(30);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setEmpPoints(preset.empPoints);
    setLeaderPoints(preset.leaderPoints);
    setEmpCount(preset.empCount);
    setLeaderCount(preset.leaderCount);
    setCommissionPct(preset.commissionPct);
  };

  const calculations = useMemo(() => {
    const empTotal = empCount * empPoints;
    const leaderTotal = leaderCount * leaderPoints;
    const votingTotal = empTotal + leaderTotal;
    const votingPct = 100 - commissionPct;
    const empShare = votingTotal > 0 ? (empTotal / votingTotal) * votingPct : 0;
    const leaderShare = votingTotal > 0 ? (leaderTotal / votingTotal) * votingPct : 0;

    return {
      empTotal,
      leaderTotal,
      votingTotal,
      votingPct,
      empShare: Math.round(empShare * 10) / 10,
      leaderShare: Math.round(leaderShare * 10) / 10,
      totalPeople: empCount + leaderCount,
    };
  }, [empPoints, leaderPoints, empCount, leaderCount, commissionPct]);

  const sliders = [
    {
      label: "Баллы рядового сотрудника",
      value: empPoints,
      setValue: setEmpPoints,
      min: 1,
      max: 10,
      step: 1,
    },
    {
      label: "Баллы руководителя / ключевого лица",
      value: leaderPoints,
      setValue: setLeaderPoints,
      min: 1,
      max: 30,
      step: 1,
    },
    {
      label: "Количество рядовых сотрудников",
      value: empCount,
      setValue: setEmpCount,
      min: 100,
      max: 800,
      step: 50,
    },
    {
      label: "Количество руководителей",
      value: leaderCount,
      setValue: setLeaderCount,
      min: 10,
      max: 100,
      step: 5,
    },
    {
      label: "Доля комиссии (финальное решение)",
      value: commissionPct,
      setValue: setCommissionPct,
      min: 0,
      max: 50,
      step: 5,
      suffix: "%",
    },
  ];

  const protections = [
    "Один человек — один голос (привязка к корп. email)",
    "Нельзя голосовать за свою заявку",
    "Голосование анонимное, результаты — публичные",
    "Комиссия видит баллы только после своей оценки (двойное слепое)",
    "Право вето у комиссии: отклонение заявки при обнаружении плагиата",
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="mb-6" style={{ color: "#5a6a8a" }}>
          <Link href="/" className="hover:text-[#6382ff] transition-colors">Главная</Link>
          <span className="mx-2">→</span>
          <Link href="/voting" className="hover:text-[#6382ff] transition-colors">Голосование</Link>
          <span className="mx-2">→</span>
          <span style={{ color: "#8898b8" }}>Алгоритм</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Алгоритм голосования EAI Challenge
          </h1>
          <p className="text-lg mb-4" style={{ color: "#8898b8" }}>
            Интерактивный калькулятор баланса голосов: сотрудники vs руководство vs комиссия
          </p>
          <Link
            href="/voting"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: "#6382ff" }}
          >
            ← Простым языком о голосовании
          </Link>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="text-left p-5 rounded-xl transition-all"
              style={{
                background: activePreset === preset.id ? `rgba(${preset.tagColor === "#4ade80" ? "74, 222, 128" : preset.tagColor === "#60a5fa" ? "96, 165, 250" : preset.tagColor === "#f59e0b" ? "245, 158, 11" : "167, 139, 250"}, 0.1)` : "rgba(99, 130, 255, 0.04)",
                border: `2px solid ${activePreset === preset.id ? preset.tagColor : "rgba(99, 130, 255, 0.12)"}`,
              }}
            >
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2"
                style={{ background: `${preset.tagColor}20`, color: preset.tagColor }}
              >
                {preset.tag}
              </span>
              <h3 className="font-semibold text-white mb-1">{preset.name}</h3>
              <p className="text-sm" style={{ color: "#8898b8" }}>
                {preset.description}
              </p>
            </button>
          ))}
        </div>

        {/* Two columns layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left column - Parameters */}
          <div>
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-white mb-6">Параметры модели</h2>
              <div className="space-y-6">
                {sliders.map((slider) => (
                  <div key={slider.label}>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm" style={{ color: "#8898b8" }}>
                        {slider.label}
                      </label>
                      <span className="font-bold text-white">
                        {slider.value}{slider.suffix || ""}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      value={slider.value}
                      onChange={(e) => {
                        slider.setValue(Number(e.target.value));
                        setActivePreset("");
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: "#5a6a8a" }}>
                      <span>{slider.min}{slider.suffix || ""}</span>
                      <span>{slider.max}{slider.suffix || ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Math block */}
            <div className="card" style={{ fontFamily: "monospace" }}>
              <h2 className="text-xl font-semibold text-white mb-4">Математика</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "#60a5fa" }}>Сотрудники:</span>
                  <span style={{ color: "#60a5fa" }}>
                    {empCount} × {empPoints} = {calculations.empTotal} баллов
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#f59e0b" }}>Руководители:</span>
                  <span style={{ color: "#f59e0b" }}>
                    {leaderCount} × {leaderPoints} = {calculations.leaderTotal} баллов
                  </span>
                </div>
                <div className="border-t my-3" style={{ borderColor: "rgba(99, 130, 255, 0.15)" }} />
                <div className="flex justify-between text-white">
                  <span>Всего голосование:</span>
                  <span className="font-bold">{calculations.votingTotal} баллов</span>
                </div>
                <div style={{ color: "#8898b8" }} className="text-xs mt-2">
                  Голосование определяет {calculations.votingPct}% итога, комиссия — {commissionPct}%
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Results */}
          <div>
            {/* Influence distribution */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-white mb-6">Распределение влияния</h2>
              <div className="space-y-4">
                {/* Employees bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm" style={{ color: "#60a5fa" }}>
                      Рядовые сотрудники ({empCount} чел.)
                    </span>
                    <span className="font-bold" style={{ color: "#60a5fa" }}>
                      {calculations.empShare}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill flex items-center justify-end pr-3"
                      style={{
                        width: `${Math.max(calculations.empShare, 5)}%`,
                        background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                      }}
                    >
                      <span className="text-xs text-white font-semibold">
                        {calculations.empTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leaders bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm" style={{ color: "#f59e0b" }}>
                      Руководители ({leaderCount} чел.)
                    </span>
                    <span className="font-bold" style={{ color: "#f59e0b" }}>
                      {calculations.leaderShare}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill flex items-center justify-end pr-3"
                      style={{
                        width: `${Math.max(calculations.leaderShare, 5)}%`,
                        background: "linear-gradient(90deg, #d97706, #f59e0b)",
                      }}
                    >
                      <span className="text-xs text-white font-semibold">
                        {calculations.leaderTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Commission bar (if > 0) */}
                {commissionPct > 0 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm" style={{ color: "#a78bfa" }}>
                        Комиссия
                      </span>
                      <span className="font-bold" style={{ color: "#a78bfa" }}>
                        {commissionPct}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${commissionPct}%`,
                          background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Process timeline */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-white mb-6">Процесс определения победителей</h2>
              <div className="space-y-0">
                <div className="timeline-step" style={{ color: "#60a5fa" }}>
                  <div className="font-semibold text-white">Открытое голосование</div>
                  <p className="text-sm mt-1" style={{ color: "#8898b8" }}>
                    Все {calculations.totalPeople} человек голосуют на сайте. Сотрудник — {empPoints} балл(а), руководитель — {leaderPoints}. Каждый распределяет баллы между заявками своего дивизиона.
                  </p>
                </div>

                <div className="timeline-step" style={{ color: "#f59e0b" }}>
                  <div className="font-semibold text-white">Формирование рейтинга</div>
                  <p className="text-sm mt-1" style={{ color: "#8898b8" }}>
                    По всем поданным заявкам формируется рейтинг. Доля сотрудников: {calculations.empShare}%, руководителей: {calculations.leaderShare}%.
                  </p>
                </div>

                {commissionPct > 0 && (
                  <div className="timeline-step" style={{ color: "#a78bfa" }}>
                    <div className="font-semibold text-white">Комиссия ({commissionPct}% итогового балла)</div>
                    <p className="text-sm mt-1" style={{ color: "#8898b8" }}>
                      Комиссия из представителей сотрудников, руководства и акционеров оценивает топ-30 заявок в рейтинге. Их оценка добавляется к народному рейтингу.
                    </p>
                  </div>
                )}

                <div className="timeline-step" style={{ color: "#4ade80" }}>
                  <div className="font-semibold text-white">Питч финалистов + награждение</div>
                  <p className="text-sm mt-1" style={{ color: "#8898b8" }}>
                    Топ-3 каждого дивизиона презентуют решения. Комиссия может скорректировать места в пределах ±1 позиции. Вручение 30 премий.
                  </p>
                </div>
              </div>
            </div>

            {/* Protection measures */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">Защита от злоупотреблений</h2>
              <ul className="space-y-3">
                {protections.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span style={{ color: "#4ade80" }}>✓</span>
                    <span className="text-sm" style={{ color: "#8898b8" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div
          className="mt-12 p-6 rounded-xl"
          style={{
            background: "rgba(74, 222, 128, 0.05)",
            border: "2px solid rgba(74, 222, 128, 0.3)",
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-white mb-2">Рекомендация для Тайпит:</h3>
              <p style={{ color: "#8898b8" }}>
                Гибридная модель с параметрами: сотрудник = 3 балла, руководитель = 10–15 баллов, комиссия = 30%.
                Это даёт ~50% влияния народу (вовлечённость и легитимность), ~20% руководителям (экспертиза)
                и ~30% комиссии (стратегический фильтр). Комиссия: 1 представитель сотрудников + 1 от руководства + 1 от акционеров — всего 3 человека, решения принимаются большинством.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
