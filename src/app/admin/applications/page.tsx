"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Application {
  id: number;
  applicantName: string;
  applicantEmail: string;
  title: string;
  category: string;
  type: string;
  format: string;
  status: string;
  createdAt: string;
  division: { id: number; name: string };
}

interface Division {
  id: number;
  name: string;
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

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    division: "",
    category: "",
    type: "",
    status: "",
  });
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetch("/api/divisions")
      .then((res) => res.json())
      .then(setDivisions)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (filters.division) params.set("division", filters.division);
    if (filters.category) params.set("category", filters.category);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);

    fetch(`/api/applications?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Заявки</h1>
          <p style={{ color: "#8898b8" }}>Всего: {total} заявок</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (filters.division) params.set("division", filters.division);
              if (filters.category) params.set("category", filters.category);
              if (filters.type) params.set("type", filters.type);
              if (filters.status) params.set("status", filters.status);
              window.open(`/api/applications/export?${params}&format=csv`, "_blank");
            }}
            className="btn-secondary !py-2 !px-4 text-sm"
          >
            Экспорт CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: "#8898b8" }}>
              Дивизион
            </label>
            <select
              value={filters.division}
              onChange={(e) => handleFilterChange("division", e.target.value)}
              className="w-full"
            >
              <option value="">Все</option>
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: "#8898b8" }}>
              Категория
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full"
            >
              <option value="">Все</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: "#8898b8" }}>
              Тип
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full"
            >
              <option value="">Все</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: "#8898b8" }}>
              Статус
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full"
            >
              <option value="">Все</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
          </div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center" style={{ color: "#5a6a8a" }}>
            Заявок не найдено
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(99, 130, 255, 0.1)" }}>
                <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                  #
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                  Дата
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                  Заявитель
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                  Название
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                  Дивизион
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                  Категория
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                  Тип
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                  Статус
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium" style={{ color: "#8898b8" }}>
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  style={{ borderBottom: "1px solid rgba(99, 130, 255, 0.05)" }}
                >
                  <td className="py-3 px-3 text-sm text-white">{app.id}</td>
                  <td className="py-3 px-3 text-sm" style={{ color: "#8898b8" }}>
                    {new Date(app.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-sm text-white">{app.applicantName}</div>
                    <div className="text-xs" style={{ color: "#5a6a8a" }}>
                      {app.applicantEmail}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-white max-w-xs truncate">
                    {app.title}
                  </td>
                  <td className="py-3 px-3 text-sm" style={{ color: "#8898b8" }}>
                    {app.division.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`badge-${app.category} text-xs px-2 py-1 rounded-full`}>
                      {categoryLabels[app.category] || app.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm" style={{ color: "#8898b8" }}>
                    {typeLabels[app.type] || app.type}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`badge-${app.status} text-xs px-2 py-1 rounded-full`}>
                      {statusLabels[app.status] || app.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-sm px-3 py-1 rounded-lg transition-colors"
                      style={{
                        background: "rgba(99, 130, 255, 0.1)",
                        color: "#6382ff",
                      }}
                    >
                      Просмотр
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2 pt-4 mt-4" style={{ borderTop: "1px solid rgba(99, 130, 255, 0.1)" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg text-sm disabled:opacity-50"
              style={{ background: "rgba(99, 130, 255, 0.1)", color: "#6382ff" }}
            >
              ←
            </button>
            <span className="px-3 py-1 text-sm" style={{ color: "#8898b8" }}>
              Страница {page} из {Math.ceil(total / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-3 py-1 rounded-lg text-sm disabled:opacity-50"
              style={{ background: "rgba(99, 130, 255, 0.1)", color: "#6382ff" }}
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.8)" }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Заявка #{selectedApp.id}
                </h2>
                <p style={{ color: "#8898b8" }}>{selectedApp.title}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-lg"
                style={{ background: "rgba(99, 130, 255, 0.1)" }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm" style={{ color: "#5a6a8a" }}>
                    Заявитель
                  </div>
                  <div className="text-white">{selectedApp.applicantName}</div>
                  <div className="text-sm" style={{ color: "#8898b8" }}>
                    {selectedApp.applicantEmail}
                  </div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#5a6a8a" }}>
                    Дивизион
                  </div>
                  <div className="text-white">{selectedApp.division.name}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#5a6a8a" }}>
                    Категория
                  </div>
                  <span className={`badge-${selectedApp.category} text-xs px-2 py-1 rounded-full`}>
                    {categoryLabels[selectedApp.category] || selectedApp.category}
                  </span>
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#5a6a8a" }}>
                    Тип
                  </div>
                  <div className="text-white">{typeLabels[selectedApp.type] || selectedApp.type}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#5a6a8a" }}>
                    Статус
                  </div>
                  <span className={`badge-${selectedApp.status} text-xs px-2 py-1 rounded-full`}>
                    {statusLabels[selectedApp.status] || selectedApp.status}
                  </span>
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#5a6a8a" }}>
                    Дата подачи
                  </div>
                  <div className="text-white">
                    {new Date(selectedApp.createdAt).toLocaleString("ru-RU")}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href={`/admin/applications/${selectedApp.id}`}
                className="btn-primary !py-2 !px-4 text-sm"
              >
                Подробнее
              </Link>
              <button
                onClick={() => setSelectedApp(null)}
                className="btn-secondary !py-2 !px-4 text-sm"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
