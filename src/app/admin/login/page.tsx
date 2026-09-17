"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErro(data?.error ?? "Não foi possível entrar.");
      setEnviando(false);
      return;
    }

    router.push(searchParams.get("from") || "/admin/pedidos");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Painel administrativo
      </h1>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <input
          type="email"
          placeholder="E-mail"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-md bg-forest-700 px-4 py-2 font-heading font-bold uppercase tracking-wide text-white transition hover:bg-forest-800 disabled:opacity-50"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
