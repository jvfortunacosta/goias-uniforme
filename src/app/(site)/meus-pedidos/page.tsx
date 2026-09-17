"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCents, isValidCpf } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/constants";

type PedidoResumo = {
  id: string;
  dataCriacao: string;
  statusPedido: string;
  valorTotalCents: number;
};

export default function MeusPedidosPage() {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [pedidos, setPedidos] = useState<PedidoResumo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErro("E-mail inválido.");
      return;
    }
    if (!isValidCpf(cpf)) {
      setErro("CPF inválido.");
      return;
    }

    setBuscando(true);
    setPedidos(null);
    try {
      const res = await fetch("/api/pedidos/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cpf }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível buscar seus pedidos.");
        return;
      }
      setPedidos(data.pedidos);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wide">
        Consultar meu pedido
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Informe o e-mail e o CPF usados na compra pra ver o status do seu pedido.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button
          type="submit"
          disabled={buscando}
          className="w-full rounded-md bg-forest-700 px-4 py-2.5 font-heading font-bold uppercase tracking-wide text-white transition hover:bg-forest-800 disabled:opacity-50"
        >
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {pedidos && (
        <div className="mt-6">
          {pedidos.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhum pedido encontrado com esses dados.
            </p>
          ) : (
            <ul className="space-y-2">
              {pedidos.map((pedido) => (
                <li key={pedido.id}>
                  <Link
                    href={`/pedido/${pedido.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-forest-500"
                  >
                    <div>
                      <p className="font-medium">
                        Pedido #{pedido.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(pedido.dataCriacao).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-forest-700">
                        {formatCents(pedido.valorTotalCents)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {STATUS_LABELS[pedido.statusPedido] ?? pedido.statusPedido}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
