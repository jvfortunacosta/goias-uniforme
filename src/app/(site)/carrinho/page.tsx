"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { CalculoFrete, type FreteInfo } from "@/components/CalculoFrete";
import { formatCents } from "@/lib/format";

export default function CarrinhoPage() {
  const { itens, remover, totalCents } = useCart();
  const [frete, setFrete] = useState<FreteInfo | null>(null);

  if (itens.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide">
          Seu carrinho está vazio
        </h1>
        <Link
          href="/loja"
          className="mt-4 inline-block rounded-md bg-forest-700 px-5 py-2.5 font-heading font-bold uppercase tracking-wide text-white transition hover:bg-forest-800"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide">
        Seu carrinho
      </h1>

      <ul className="space-y-4">
        {itens.map((item) => (
          <li
            key={item.itemId}
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
              <Image
                src={item.imagemUrl}
                alt={item.nomeProduto}
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold uppercase tracking-wide">
                {item.nomeProduto}
              </p>
              <p className="text-sm text-slate-500">
                {[
                  item.tamanho && `Tamanho ${item.tamanho}`,
                  item.cor && `Cor ${item.cor}`,
                  item.nomePersonalizado && `Nome "${item.nomePersonalizado}"`,
                  item.numeroPersonalizado && `Número ${item.numeroPersonalizado}`,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Sem personalização"}
              </p>
              <p className="mt-1 font-display text-lg text-forest-700">
                {formatCents(item.precoUnitarioCents)}
              </p>
            </div>
            <button
              onClick={() => remover(item.itemId)}
              className="text-sm text-red-600 hover:underline"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium">
          Calcule o frete (por conta do comprador):
        </p>
        <CalculoFrete
          produtoIds={itens.map((i) => i.produtoId)}
          onResult={setFrete}
        />

        <div className="mt-4 space-y-1 border-t border-slate-200 pt-4">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Produtos</span>
            <span>{formatCents(totalCents)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Frete</span>
            <span>{frete ? formatCents(frete.valorCents) : "a calcular"}</span>
          </div>
          <div className="flex justify-between font-display text-xl text-ink">
            <span className="font-heading text-sm font-bold uppercase tracking-wide">
              Total
            </span>
            <span>{formatCents(totalCents + (frete?.valorCents ?? 0))}</span>
          </div>
        </div>

        <Link
          href="/checkout"
          className="mt-4 block rounded-md bg-forest-700 px-4 py-3 text-center font-heading font-bold uppercase tracking-wide text-white transition hover:bg-forest-800"
        >
          Continuar para o pagamento
        </Link>
      </div>
    </div>
  );
}
