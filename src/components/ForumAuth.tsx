"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ForumUser {
  id: number;
  name: string;
  email: string;
  role: string;
  division?: { id: number; name: string };
}

interface ForumUserContextType {
  user: ForumUser | null;
  loading: boolean;
  login: (name: string, email: string, divisionId: number) => Promise<string | null>;
  logout: () => Promise<void>;
}

const ForumUserContext = createContext<ForumUserContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
});

export function useForumUser() {
  return useContext(ForumUserContext);
}

export function ForumAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ForumUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/forum/auth/verify")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (name: string, email: string, divisionId: number): Promise<string | null> => {
    try {
      const res = await fetch("/api/forum/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, divisionId }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || "Ошибка авторизации";
      setUser(data.user);
      return null;
    } catch {
      return "Ошибка соединения";
    }
  };

  const logout = async () => {
    await fetch("/api/forum/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <ForumUserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </ForumUserContext.Provider>
  );
}

interface Division {
  id: number;
  name: string;
}

export function ForumLoginForm({ onClose }: { onClose?: () => void }) {
  const { login } = useForumUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [divisionId, setDivisionId] = useState<number | "">("");
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/divisions")
      .then((res) => res.json())
      .then(setDivisions)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divisionId) return;
    setError("");
    setIsLoading(true);

    const err = await login(name, email, Number(divisionId));
    if (err) {
      setError(err);
      setIsLoading(false);
    } else {
      onClose?.();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl text-white mx-auto mb-3"
          style={{ background: "linear-gradient(135deg, #4a65f0, #6382ff)" }}
        >
          EAI
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Вход на форум</h2>
        <p className="text-sm" style={{ color: "#8898b8" }}>
          Авторизуйтесь для участия в форуме
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8898b8" }}>
            Имя
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван Иванов"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8898b8" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.ru"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8898b8" }}>
            Дивизион
          </label>
          <select
            value={divisionId}
            onChange={(e) => setDivisionId(Number(e.target.value))}
            required
          >
            <option value="">Выберите дивизион</option>
            {divisions.map((div) => (
              <option key={div.id} value={div.id}>
                {div.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !name || !email || !divisionId}
          className="btn-primary w-full disabled:opacity-50"
        >
          {isLoading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
