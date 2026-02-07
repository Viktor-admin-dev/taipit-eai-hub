"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push("/admin");
      } else {
        const data = await response.json();
        setError(data.error || "Ошибка входа");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#060b18" }}>
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl text-white mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #4a65f0, #6382ff)" }}
          >
            EAI
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Админ-панель</h1>
          <p style={{ color: "#8898b8" }}>EAI Hub Тайпит</p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: "#8898b8" }}>
              Пароль администратора
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="w-full"
              autoFocus
            />
          </div>

          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: "#5a6a8a" }}>
          Вход только для администраторов конкурса
        </p>
      </div>
    </div>
  );
}
