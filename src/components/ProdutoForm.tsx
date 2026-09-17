"use client";

import { useState } from "react";
import Link from "next/link";
import type { Produto } from "@prisma/client";
import { useCart } from "./CartContext";
import { TAMANHOS_MASCULINO, TAMANHOS_FEMININO } from "@/lib/constants";

export function ProdutoForm({ produto }: { produto: Produto }) {
  const { adicionar } = useCart();

  const tamanhosMasculinos = TAMANHOS_MASCULINO.filter((t) =>
    produto.tamanhos.includes(t)
  );
  const tamanhosFemininos = TAMANHOS_FEMININO.filter((t) =>
    produto.tamanhos.includes(t)
  );
  const tamanhosDisponiveis = [...tamanhosMasculinos, ...tamanhosFemininos];
  const precisaCor = produto.cores.length > 1;

  const [tamanho, setTamanho] = useState("");
  const [cor, setCor] = useState("");
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [adicionado, setAdicionado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdicionado(false);

    if (tamanhosDisponiveis.length > 0 && !tamanho) {
      setErro("Selecione um tamanho.");
      return;
    }
    if (precisaCor && !cor) {
      setErro("Selecione uma cor.");
      return;
    }
    if (numero && !/^\d{1,3}$/.test(numero)) {
      setErro("O número deve ter até 3 dígitos.");
      return;
    }
    if (nome && nome.length > 20) {
      setErro("O nome pode ter no máximo 20 caracteres.");
      return;
    }

    setErro(null);
    adicionar({
      produtoId: produto.id,
      nomeProduto: produto.nome,
      imagemUrl: produto.imagemUrl,
      precoUnitarioCents: produto.precoCents,
      tamanho: tamanhosDisponiveis.length > 0 ? tamanho : null,
      cor: precisaCor ? cor : produto.cores[0] ?? null,
      nomePersonalizado: nome || null,
      numeroPersonalizado: numero || null,
    });
    setAdicionado(true);
    setNome("");
    setNumero("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {tamanhosMasculinos.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Tamanho · Masculino
          </label>
          <div className="flex flex-wrap gap-2">
            {tamanhosMasculinos.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTamanho(t)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  tamanho === t
                    ? "border-forest-700 bg-forest-700 text-white"
                    : "border-slate-300 hover:border-forest-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {tamanhosFemininos.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Tamanho · Feminino
          </label>
          <div className="flex flex-wrap gap-2">
            {tamanhosFemininos.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTamanho(t)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  tamanho === t
                    ? "border-forest-700 bg-forest-700 text-white"
                    : "border-slate-300 hover:border-forest-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {produto.cores.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Cor{precisaCor ? "" : " (opcional)"}
          </label>
          <div className="flex flex-wrap gap-2">
            {produto.cores.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCor(c)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  cor === c
                    ? "border-forest-700 bg-forest-700 text-white"
                    : "border-slate-300 hover:border-forest-400"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {produto.permitePersonalizacao && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nome (opcional)
            </label>
            <input
              type="text"
              value={nome}
              maxLength={20}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase focus:border-forest-500 focus:outline-none"
              placeholder="Ex: SILVA"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Número (opcional)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={numero}
              maxLength={3}
              onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
              placeholder="Ex: 7"
            />
          </div>
        </div>
      )}

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-forest-700 px-4 py-3 font-heading font-bold uppercase tracking-wide text-white transition hover:bg-forest-800"
      >
        Adicionar ao carrinho
      </button>

      {adicionado && (
        <p className="text-sm text-forest-700">
          Item adicionado.{" "}
          <Link href="/carrinho" className="underline">
            Ir para o carrinho
          </Link>
        </p>
      )}
    </form>
  );
}
