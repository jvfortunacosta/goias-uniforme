"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type JogoFormData = {
  id?: string;
  temporada: string;
  adversario: string;
  dataHora: string;
  local: string;
  mandante: boolean;
  golsPro: number | null;
  golsContra: number | null;
  ativo: boolean;
};

const VAZIO: JogoFormData = {
  temporada: "2026",
  adversario: "",
  dataHora: "",
  local: "",
  mandante: true,
  golsPro: null,
  golsContra: null,
  ativo: true,
};

export function JogoAdminForm({ jogoInicial }: { jogoInicial?: JogoFormData }) {
  const router = useRouter();
  const editando = Boolean(jogoInicial?.id);

  const [form, setForm] = useState<JogoFormData>(jogoInicial ?? VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!form.adversario.trim() || !form.dataHora || !form.local.trim()) {
      setErro("Preencha adversário, data/hora e local.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(
        editando ? `/api/admin/jogos/${jogoInicial!.id}` : "/api/admin/jogos",
        {
          method: editando ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível salvar o jogo.");
        setEnviando(false);
        return;
      }
      router.push("/admin/agenda");
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Temporada</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={form.temporada}
            onChange={(e) => setForm((f) => ({ ...f, temporada: e.target.value }))}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Data e hora</label>
          <input
            type="datetime-local"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={form.dataHora}
            onChange={(e) => setForm((f) => ({ ...f, dataHora: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Adversário</label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          value={form.adversario}
          onChange={(e) => setForm((f) => ({ ...f, adversario: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Local</label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          value={form.local}
          onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.mandante}
          onChange={(e) => setForm((f) => ({ ...f, mandante: e.target.checked }))}
        />
        Goiás F.A. manda o jogo
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Gols/pontos pró (opcional)</label>
          <input
            type="number"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={form.golsPro ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                golsPro: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Gols/pontos contra (opcional)</label>
          <input
            type="number"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={form.golsContra ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                golsContra: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.ativo}
          onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
        />
        Ativo (visível na agenda)
      </label>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-forest-700 px-5 py-2.5 font-heading text-sm font-bold uppercase tracking-wide text-white transition hover:bg-forest-800 disabled:opacity-50"
      >
        {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar jogo"}
      </button>
    </form>
  );
}
