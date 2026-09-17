"use client";

import { useEffect, useState } from "react";
import { formatCents } from "@/lib/format";

export type FreteInfo = {
  valorCents: number;
  servico: string;
  prazoDias: number | null;
};

export function CalculoFrete({
  produtoIds,
  cepControlado,
  onResult,
}: {
  produtoIds: number[];
  /** Quando informado, o CEP é controlado pelo componente pai e o cálculo dispara automaticamente. */
  cepControlado?: string;
  onResult?: (frete: FreteInfo | null) => void;
}) {
  const [cepLocal, setCepLocal] = useState("");
  const [frete, setFrete] = useState<FreteInfo | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const cep = cepControlado ?? cepLocal;

  async function calcular(cepParaCalcular: string) {
    const cepLimpo = cepParaCalcular.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setErro("CEP inválido.");
      return;
    }
    setCalculando(true);
    setErro(null);
    try {
      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: cepLimpo, produtoIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível calcular o frete.");
        setFrete(null);
        onResult?.(null);
        return;
      }
      setFrete(data);
      onResult?.(data);
    } catch {
      setErro("Falha de conexão ao calcular o frete.");
      setFrete(null);
      onResult?.(null);
    } finally {
      setCalculando(false);
    }
  }

  useEffect(() => {
    if (!cepControlado) return;
    const cepLimpo = cepControlado.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    const timeout = setTimeout(() => calcular(cepControlado), 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepControlado]);

  return (
    <div>
      {!cepControlado && (
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            placeholder="Seu CEP"
            value={cepLocal}
            onChange={(e) => setCepLocal(e.target.value)}
          />
          <button
            type="button"
            onClick={() => calcular(cep)}
            disabled={calculando}
            className="rounded-md border border-forest-700 px-3 py-2 text-sm font-medium text-forest-700 hover:bg-forest-50 disabled:opacity-50"
          >
            {calculando ? "Calculando..." : "Calcular frete"}
          </button>
        </div>
      )}
      {calculando && cepControlado && (
        <p className="text-sm text-slate-500">Calculando frete...</p>
      )}
      {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}
      {frete && (
        <p className="mt-2 text-sm text-slate-600">
          Frete: <span className="font-semibold text-forest-700">{formatCents(frete.valorCents)}</span>
          {" "}via {frete.servico}
          {frete.prazoDias ? ` (até ${frete.prazoDias} dias úteis)` : ""}
        </p>
      )}
    </div>
  );
}
