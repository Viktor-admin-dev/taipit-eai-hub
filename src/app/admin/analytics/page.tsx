"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsData {
  period: string;
  totalVisits: number;
  uniqueVisitors: number;
  dailyStats: Array<{ date: string; uniqueVisitors: number; totalVisits: number }>;
  popularPages: Array<{ path: string; visits: number }>;
}

const periodLabels: Record<string, string> = {
  week: "Неделя",
  month: "Месяц",
  all: "Всё время",
};

const pageLabels: Record<string, string> = {
  "/": "Главная",
  "/testimonials": "Истории успеха",
  "/contest": "Конкурс",
  "/voting": "Голосование",
  "/voting/algorithm": "Алгоритм",
  "/forum": "Форум",
  "/resources": "Ресурсы",
  "/admin": "Админ-панель",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?period=${period}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const handleExport = () => {
    if (!data) return;

    const csv = [
      "Дата,Уникальные посетители,Всего визитов",
      ...data.dailyStats.map((d) => `${d.date},${d.uniqueVisitors},${d.totalVisits}`),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${period}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Аналитика посещений</h1>
          <p style={{ color: "#8898b8" }}>
            Статистика посещаемости сайта
          </p>
        </div>
        <div className="flex gap-3">
          {/* Period selector */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(99, 130, 255, 0.2)" }}>
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: period === key ? "rgba(99, 130, 255, 0.2)" : "transparent",
                  color: period === key ? "#6382ff" : "#8898b8",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="btn-secondary">
            Экспорт CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👁️</span>
            <span className="text-sm" style={{ color: "#8898b8" }}>
              Всего визитов
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: "#6382ff" }}>
            {data?.totalVisits || 0}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👤</span>
            <span className="text-sm" style={{ color: "#8898b8" }}>
              Уникальных посетителей
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: "#4ade80" }}>
            {data?.uniqueVisitors || 0}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-sm" style={{ color: "#8898b8" }}>
              Среднее в день
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: "#f59e0b" }}>
            {data && data.dailyStats.length > 0
              ? Math.round(data.totalVisits / data.dailyStats.length)
              : 0}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📄</span>
            <span className="text-sm" style={{ color: "#8898b8" }}>
              Страниц просмотрено
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: "#a78bfa" }}>
            {data?.popularPages?.length || 0}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visitors Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Посетители по дням</h2>
          {data && data.dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 130, 255, 0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#5a6a8a"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                />
                <YAxis stroke="#5a6a8a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#101a38",
                    border: "1px solid rgba(99, 130, 255, 0.2)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#8898b8" }}
                />
                <Line
                  type="monotone"
                  dataKey="uniqueVisitors"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ fill: "#4ade80" }}
                  name="Уникальные"
                />
                <Line
                  type="monotone"
                  dataKey="totalVisits"
                  stroke="#6382ff"
                  strokeWidth={2}
                  dot={{ fill: "#6382ff" }}
                  name="Всего визитов"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center" style={{ color: "#5a6a8a" }}>
              Нет данных за выбранный период
            </div>
          )}
        </div>

        {/* Popular Pages */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Популярные страницы</h2>
          {data && data.popularPages.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.popularPages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 130, 255, 0.1)" />
                <XAxis type="number" stroke="#5a6a8a" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="path"
                  stroke="#5a6a8a"
                  fontSize={12}
                  width={120}
                  tickFormatter={(value) => pageLabels[value] || value}
                />
                <Tooltip
                  contentStyle={{
                    background: "#101a38",
                    border: "1px solid rgba(99, 130, 255, 0.2)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [value, "Визитов"]}
                  labelFormatter={(value) => pageLabels[value] || value}
                />
                <Bar dataKey="visits" fill="#6382ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center" style={{ color: "#5a6a8a" }}>
              Нет данных
            </div>
          )}
        </div>
      </div>

      {/* Pages Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Детальная статистика страниц</h2>
        {data && data.popularPages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(99, 130, 255, 0.1)" }}>
                  <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                    Страница
                  </th>
                  <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                    URL
                  </th>
                  <th className="text-right py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                    Визитов
                  </th>
                  <th className="text-right py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                    % от общего
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.popularPages.map((page, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid rgba(99, 130, 255, 0.05)" }}>
                    <td className="py-3 px-3 text-white">
                      {pageLabels[page.path] || page.path}
                    </td>
                    <td className="py-3 px-3" style={{ color: "#5a6a8a" }}>
                      {page.path}
                    </td>
                    <td className="py-3 px-3 text-right text-white font-semibold">
                      {page.visits}
                    </td>
                    <td className="py-3 px-3 text-right" style={{ color: "#6382ff" }}>
                      {((page.visits / data.totalVisits) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center" style={{ color: "#5a6a8a" }}>
            Нет данных
          </div>
        )}
      </div>
    </div>
  );
}
