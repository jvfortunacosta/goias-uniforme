import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    select: {
      id: true,
      statusPedido: true,
      linkPagamento: true,
      qrCodePix: true,
      qrCodePixBase64: true,
      itensCents: true,
      freteCents: true,
      freteServico: true,
      valorTotalCents: true,
      itens: {
        select: {
          id: true,
          nomeProduto: true,
          tamanho: true,
          cor: true,
          nomePersonalizado: true,
          numeroPersonalizado: true,
          precoUnitarioCents: true,
        },
      },
    },
  });

  if (!pedido) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="font-heading text-xs font-bold uppercase tracking-widest text-forest-700">
        Pedido #{pedido.id.slice(0, 8)}
      </p>
      <h1 className="mt-1 font-display text-3xl uppercase text-ink">
        {STATUS_LABELS[pedido.statusPedido] ?? pedido.statusPedido}
      </h1>

      {pedido.statusPedido === "aguardando_pagamento" && pedido.linkPagamento && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center">
          <p className="mb-4 font-medium">
            Falta pouco! Finalize o pagamento no Mercado Pago.
          </p>
          <a
            href={pedido.linkPagamento}
            className="inline-block rounded-md bg-forest-700 px-5 py-2.5 font-heading font-bold uppercase tracking-wide text-white transition hover:bg-forest-800"
          >
            Pagar agora
          </a>
        </div>
      )}

      {pedido.statusPedido === "aguardando_pix" && pedido.qrCodePixBase64 && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center">
          <p className="mb-4 font-medium">Escaneie o QR Code para pagar via Pix</p>
          <Image
            src={`data:image/png;base64,${pedido.qrCodePixBase64}`}
            alt="QR Code Pix"
            width={240}
            height={240}
            className="mx-auto"
            unoptimized
          />
          {pedido.qrCodePix && (
            <div className="mt-4">
              <p className="mb-1 text-sm text-slate-500">
                Ou copie o código Pix:
              </p>
              <textarea
                readOnly
                value={pedido.qrCodePix}
                className="w-full resize-none rounded-md border border-slate-300 p-2 text-xs"
                rows={3}
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
          )}
          <Link
            href={`/pedido/${pedido.id}`}
            className="mt-4 inline-block text-sm font-medium text-forest-700 hover:underline"
          >
            Já paguei, atualizar status
          </Link>
        </div>
      )}

      {pedido.statusPedido === "pago" && (
        <div className="mt-6 rounded-lg border border-pitch-300 bg-pitch-50 p-4 text-forest-800">
          Pagamento confirmado! Você receberá um e-mail com os detalhes.
        </div>
      )}

      {pedido.statusPedido === "recusado" && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
          Pagamento recusado. Você pode tentar novamente pelo catálogo.
        </div>
      )}

      {pedido.statusPedido === "processando" && (
        <div className="mt-6 rounded-lg border border-slate-300 bg-slate-50 p-4 text-slate-700">
          Estamos confirmando seu pagamento. Isso pode levar alguns instantes.
        </div>
      )}

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-forest-700">
          Itens
        </h2>
        <ul className="space-y-2 text-sm text-slate-600">
          {pedido.itens.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>
                {item.nomeProduto}
                {item.tamanho ? ` (${item.tamanho})` : ""}
                {item.cor ? ` · ${item.cor}` : ""}
                {item.nomePersonalizado ? ` · "${item.nomePersonalizado}"` : ""}
                {item.numeroPersonalizado ? ` #${item.numeroPersonalizado}` : ""}
              </span>
              <span>{formatCents(item.precoUnitarioCents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-slate-200 pt-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Produtos</span>
            <span>{formatCents(pedido.itensCents)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>
              Frete{pedido.freteServico ? ` (${pedido.freteServico})` : ""}
            </span>
            <span>{formatCents(pedido.freteCents)}</span>
          </div>
          <div className="flex justify-between pt-1 font-display text-xl text-ink">
            <span className="font-heading text-sm font-bold uppercase tracking-wide">
              Total
            </span>
            <span>{formatCents(pedido.valorTotalCents)}</span>
          </div>
        </div>
      </div>

      <Link href="/loja" className="mt-6 inline-block text-sm text-slate-500 hover:underline">
        ← Voltar ao catálogo
      </Link>
    </div>
  );
}
