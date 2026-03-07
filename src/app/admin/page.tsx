"use client";

import { useEffect, useState } from "react";

function BatchEvaluateButton() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handle = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/batch-evaluate", { method: "POST" });
      const data = await res.json();
      setResult(data.message || JSON.stringify(data));
    } catch {
      setResult("Ошибка запроса");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="card flex items-center justify-between gap-4">
      <div>
        <div className="text-white font-semibold">🤖 AI-оценка всех заявок</div>
        <div className="text-sm mt-1" style={{ color: "#8898b8" }}>
          Запустить AI-оценку для заявок без оценки (работает в фоне ~2 мин)
        </div>
        {result && <div className="text-sm mt-2" style={{ color: "#4ade80" }}>{result}</div>}
      </div>
      <button
        onClick={handle}
        disabled={running}
        className="btn-primary !px-6 !py-2 text-sm flex-shrink-0 disabled:opacity-50"
      >
        {running ? "Запускается..." : "Запустить"}
      </button>
    </div>
  );
}
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import Link from "next/link";

interface DashboardData {
  total: number;
  today: number;
  divisionsActive: number;
  daysRemaining: number;
  byDay: Array<{ date: string; count: number; cumulative: number }>;
  byCategory: Array<{ category: string; label: string; count: number; color: string }>;
  byDivision: Array<{ divisionId: number; divisionName: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  recent: Array<{
    id: number;
    title: string;
    applicantName: string;
    category: string;
    type: string;
    status: string;
    divisionName: string;
    createdAt: string;
  }>;
}

const categoryLabels: Record<string, string> = {
  efficiency: "Эффективность",
  new_process: "Новый процесс",
  new_product: "Новый продукт",
  new_feature: "Новая функция",
  analytics: "Аналитика",
  content: "Контент",
};

const typeLabels: Record<string, string> = {
  idea: "Идея",
  prototype: "Прототип",
  implementation: "Внедрение",
};

const statusLabels: Record<string, string> = {
  submitted: "Новая",
  reviewing: "На рассмотрении",
  finalist: "Финалист",
  winner: "Победитель",
  rejected: "Отклонена",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12" style={{ color: "#8898b8" }}>
        Ошибка загрузки данных
      </div>
    );
  }

  const kpiCards = [
    { label: "Всего заявок", value: data.total, icon: "📋", color: "#6382ff" },
    { label: "Сегодня", value: data.today, icon: "📈", color: "#4ade80" },
    { label: "Дивизионов с заявками", value: data.divisionsActive, icon: "🏢", color: "#f59e0b" },
    { label: "Дней до окончания", value: data.daysRemaining, icon: "⏳", color: "#a78bfa" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Дашборд</h1>
        <p style={{ color: "#8898b8" }}>Обзор статистики конкурса EAI Challenge</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-sm" style={{ color: "#8898b8" }}>
                {card.label}
              </span>
            </div>
            <div className="text-3xl font-bold" style={{ color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications by Day */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Заявки по дням</h2>
          {data.byDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 130, 255, 0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#5a6a8a"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
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
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#6382ff"
                  fill="rgba(99, 130, 255, 0.2)"
                  name="Накопительно"
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4ade80"
                  fill="rgba(74, 222, 128, 0.2)"
                  name="За день"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center" style={{ color: "#5a6a8a" }}>
              Нет данных
            </div>
          )}
        </div>

        {/* Applications by Category */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Заявки по категориям</h2>
          {data.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.byCategory}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {data.byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#101a38",
                    border: "1px solid rgba(99, 130, 255, 0.2)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center" style={{ color: "#5a6a8a" }}>
              Нет данных
            </div>
          )}
        </div>
      </div>

      {/* Applications by Division */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Заявки по дивизионам</h2>
        {data.byDivision.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byDivision} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 130, 255, 0.1)" />
              <XAxis type="number" stroke="#5a6a8a" fontSize={12} />
              <YAxis
                type="category"
                dataKey="divisionName"
                stroke="#5a6a8a"
                fontSize={12}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  background: "#101a38",
                  border: "1px solid rgba(99, 130, 255, 0.2)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#6382ff" radius={[0, 4, 4, 0]} name="Заявок" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center" style={{ color: "#5a6a8a" }}>
            Нет данных
          </div>
        )}
      </div>

      {/* AI Tools */}
      <BatchEvaluateButton />

      {/* Recent Applications */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Последние заявки</h2>
          <Link href="/admin/applications" className="text-sm" style={{ color: "#6382ff" }}>
            Все заявки →
          </Link>
        </div>
        {data.recent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(99, 130, 255, 0.1)" }}>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: "#8898b8" }}>
                    #
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: "#8898b8" }}>
                    Название
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: "#8898b8" }}>
                    Дивизион
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: "#8898b8" }}>
                    Категория
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: "#8898b8" }}>
                    Тип
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: "#8898b8" }}>
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((app) => (
                  <tr
                    key={app.id}
                    style={{ borderBottom: "1px solid rgba(99, 130, 255, 0.05)" }}
                  >
                    <td className="py-3 px-2 text-sm text-white">{app.id}</td>
                    <td className="py-3 px-2 text-sm text-white">{app.title}</td>
                    <td className="py-3 px-2 text-sm" style={{ color: "#8898b8" }}>
                      {app.divisionName}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`badge-${app.category} text-xs px-2 py-1 rounded-full`}
                      >
                        {categoryLabels[app.category] || app.category}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm" style={{ color: "#8898b8" }}>
                      {typeLabels[app.type] || app.type}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`badge-${app.status} text-xs px-2 py-1 rounded-full`}
                      >
                        {statusLabels[app.status] || app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center" style={{ color: "#5a6a8a" }}>
            Пока нет заявок
          </div>
        )}
      </div>
    </div>
  );
}
