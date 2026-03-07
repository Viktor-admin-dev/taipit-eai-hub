"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CommissionMember {
  id: number;
  name: string;
  email: string;
  role: string;
  profile: string | null;
  isActive: boolean;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  ai_expert: "AI-эксперт",
  business_expert: "Бизнес-эксперт",
  ceo: "CEO",
};

const profileLabels: Record<string, { text: string; color: string }> = {
  ai_advanced: { text: "AI-продвинутый", color: "#6382ff" },
  business_focused: { text: "Бизнес-фокус", color: "#f59e0b" },
};

export default function CommissionPage() {
  const [members, setMembers] = useState<CommissionMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "ai_expert", profile: "ai_advanced" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/commission")
      .then((r) => r.json())
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ name: "", email: "", role: "ai_expert", profile: "ai_advanced" });
        load();
      } else {
        const d = await res.json();
        alert(d.error || "Ошибка");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (member: CommissionMember) => {
    await fetch("/api/admin/commission", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, isActive: !member.isActive }),
    });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить участника?")) return;
    await fetch(`/api/admin/commission?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <nav style={{ color: "#5a6a8a" }} className="text-sm">
        <Link href="/admin" className="hover:text-[#6382ff]">Дашборд</Link>
        <span className="mx-2">→</span>
        <span style={{ color: "#8898b8" }}>Комиссия</span>
      </nav>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Состав комиссии</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Отмена" : "+ Добавить"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4">
          <h3 className="text-lg font-semibold text-white">Новый участник</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "#8898b8" }}>Имя *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Виктор Ярутов"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "#8898b8" }}>Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="yarutov@taipit.ru"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "#8898b8" }}>Роль</label>
              <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                <option value="ai_expert">AI-эксперт</option>
                <option value="business_expert">Бизнес-эксперт</option>
                <option value="ceo">CEO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "#8898b8" }}>Профиль (для адаптации контента)</label>
              <select value={form.profile} onChange={(e) => setForm((p) => ({ ...p, profile: e.target.value }))}>
                <option value="ai_advanced">AI-продвинутый</option>
                <option value="business_focused">Бизнес-фокус</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Сохранение..." : "Добавить"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#6382ff] border-t-transparent rounded-full" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12" style={{ color: "#5a6a8a" }}>
          Нет членов комиссии. Добавьте первого.
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => {
            const pl = profileLabels[m.profile || ""] || null;
            return (
              <div
                key={m.id}
                className="card flex items-center justify-between gap-4"
                style={{ opacity: m.isActive ? 1 : 0.5 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ background: "rgba(99,130,255,0.2)" }}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{m.name}</div>
                    <div className="text-sm" style={{ color: "#8898b8" }}>{m.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(99,130,255,0.1)", color: "#6382ff" }}>
                        {roleLabels[m.role] || m.role}
                      </span>
                      {pl && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${pl.color}15`, color: pl.color }}>
                          {pl.text}
                        </span>
                      )}
                      {!m.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                          Неактивен
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(m)}
                    className="text-sm px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: m.isActive ? "rgba(239,68,68,0.1)" : "rgba(74,222,128,0.1)",
                      color: m.isActive ? "#ef4444" : "#4ade80",
                    }}
                  >
                    {m.isActive ? "Деактивировать" : "Активировать"}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-sm px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
