"use client";

import { useEffect, useState } from "react";

interface Stats {
  applicationsCount: number;
  divisionsWithApps: number;
  daysRemaining: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stats>({
    applicationsCount: 0,
    divisionsWithApps: 0,
    daysRemaining: 0,
  });
  const [showPrizeTooltip, setShowPrizeTooltip] = useState(false);

  useEffect(() => {
    // Calculate days remaining until April 30, 2026
    const endDate = new Date("2026-04-30T23:59:59");
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Fetch applications count
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          applicationsCount: data.applicationsCount || 0,
          divisionsWithApps: data.divisionsWithApps || 0,
          daysRemaining: diffDays > 0 ? diffDays : 0,
        });
      })
      .catch(() => {
        setStats((prev) => ({
          ...prev,
          daysRemaining: diffDays > 0 ? diffDays : 0,
        }));
      });
  }, []);

  const statsData = [
    { value: "15", label: "дивизионов", color: "#6382ff" },
    { value: "~800", label: "приглашённых участников", color: "#6382ff" },
    {
      value: "45",
      label: "премий",
      color: "#6382ff",
      hasTooltip: true,
    },
    {
      value: stats.applicationsCount.toString(),
      label: "заявок подано",
      color: "#4ade80",
      isLive: true,
    },
    {
      value: stats.daysRemaining.toString(),
      label: "дней до окончания",
      color: "#f59e0b",
    },
  ];

  return (
    <section className="py-10" style={{ background: 'rgba(99, 130, 255, 0.03)' }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="text-center relative"
              onMouseEnter={() => stat.hasTooltip && setShowPrizeTooltip(true)}
              onMouseLeave={() => stat.hasTooltip && setShowPrizeTooltip(false)}
            >
              <div
                className="text-4xl md:text-5xl font-bold mb-1"
                style={{ color: stat.color }}
              >
                {stat.value}
                {stat.isLive && (
                  <span className="inline-block w-2 h-2 rounded-full ml-2 animate-pulse" style={{ background: '#4ade80' }} />
                )}
              </div>
              <div className="text-sm" style={{ color: '#8898b8' }}>
                {stat.label}
              </div>

              {/* Prize tooltip */}
              {stat.hasTooltip && showPrizeTooltip && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-20 w-64 rounded-xl p-4 text-left"
                  style={{
                    background: '#101a38',
                    border: '1px solid rgba(99, 130, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="font-semibold mb-3 text-white">Призовой фонд:</div>
                  <ul className="space-y-2 text-sm" style={{ color: '#8898b8' }}>
                    <li className="flex justify-between">
                      <span>15 премий по</span>
                      <span className="font-semibold" style={{ color: '#4ade80' }}>150 000 руб.</span>
                    </li>
                    <li className="flex justify-between">
                      <span>15 премий по</span>
                      <span className="font-semibold" style={{ color: '#60a5fa' }}>100 000 руб.</span>
                    </li>
                    <li className="flex justify-between">
                      <span>15 премий по</span>
                      <span className="font-semibold" style={{ color: '#a78bfa' }}>50 000 руб.</span>
                    </li>
                  </ul>
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderBottom: '8px solid #101a38',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
