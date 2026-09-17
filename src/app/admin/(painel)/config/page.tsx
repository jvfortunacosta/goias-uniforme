"use client";

import { useEffect, useState } from "react";

type Config = {
  vendasAbertas: boolean;
  dataLimite: string | null;
  mensagemEncerramento: string;
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function ConfigLojaPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then(setConfig);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSalvando(true);
    setMensagem(null);

    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (res.ok) {
      setConfig(await res.json());
      setMensagem("Configuração salva.");
    } else {
      setMensagem("Erro ao salvar.");
    }
    setSalvando(false);
  }

  if (!config) return <p>Carregando...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Configuração da loja
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.vendasAbertas}
            onChange={(e) =>
              setConfig({ ...config, vendasAbertas: e.target.checked })
            }
          />
          <span className="text-sm font-medium">Vendas abertas</span>
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Data limite (opcional)
          </label>
          <input
            type="datetime-local"
            value={toDatetimeLocal(config.dataLimite)}
            onChange={(e) =>
              setConfig({
                ...config,
                dataLimite: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">
            Após essa data, as vendas fecham automaticamente mesmo com o
            toggle acima ligado.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Mensagem de encerramento
          </label>
          <textarea
            value={config.mensagemEncerramento}
            onChange={(e) =>
              setConfig({ ...config, mensagemEncerramento: e.target.value })
            }
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {mensagem && <p className="text-sm text-forest-700">{mensagem}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="rounded-md bg-forest-700 px-4 py-2 font-heading font-bold uppercase tracking-wide text-white transition hover:bg-forest-800 disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
