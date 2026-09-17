import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDataHora, itemDescricao } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATUS_OPCOES = [
  "",
  "aguardando_pagamento",
  "aguardando_pix",
  "processando",
  "pago",
  "recusado",
];

const STATUS_BADGE: Record<string, string> = {
  pago: "bg-pitch-50 text-forest-700 ring-1 ring-inset ring-pitch-200",
  recusado: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  aguardando_pagamento: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  aguardando_pix: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  processando: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

const TAMANHO_PAGINA = 30;

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; pagina?: string }>;
}) {
  const { status, pagina: paginaParam } = await searchParams;
  const filtro = status && STATUS_OPCOES.includes(status) ? status : "";
  const pagina = Math.max(1, Number(paginaParam) || 1);

  const resultado = await prisma.pedido.findMany({
    where: filtro ? { statusPedido: filtro } : undefined,
    orderBy: { dataCriacao: "desc" },
    include: { itens: true },
    skip: (pagina - 1) * TAMANHO_PAGINA,
    take: TAMANHO_PAGINA + 1,
  });
  const temProximaPagina = resultado.length > TAMANHO_PAGINA;
  const pedidos = resultado.slice(0, TAMANHO_PAGINA);

  const queryBase = filtro ? `status=${filtro}&` : "";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
          Pedidos
        </h1>
        <a
          href={`/api/admin/pedidos/export${filtro ? `?status=${filtro}` : ""}`}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Exportar CSV
        </a>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_OPCOES.map((s) => (
          <Link
            key={s || "todos"}
            href={s ? `/admin/pedidos?status=${s}` : "/admin/pedidos"}
            className={`rounded-full border px-3 py-1 text-sm ${
              filtro === s
                ? "border-forest-700 bg-forest-700 text-white"
                : "border-slate-300 hover:bg-slate-50"
            }`}
          >
            {s ? STATUS_LABELS[s] ?? s : "Todos"}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Data
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cliente
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Itens do pedido
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pagamento
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="align-top transition hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatDataHora(pedido.dataCriacao)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{pedido.clienteNome}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{pedido.clienteEmail}</p>
                    <p className="text-xs text-slate-500">{pedido.clienteTelefone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <ul className="space-y-1.5">
                      {pedido.itens.map((item) => (
                        <li key={item.id} className="text-xs leading-relaxed text-slate-600">
                          {itemDescricao(item)}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-medium tabular-nums text-ink">
                    {formatCents(pedido.valorTotalCents)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {pedido.metodoPagamento === "pix"
                      ? "Pix"
                      : pedido.metodoPagamento === "credit_card"
                        ? "Cartão"
                        : "-"}
                    {pedido.parcelas > 1 ? ` (${pedido.parcelas}x)` : ""}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_BADGE[pedido.statusPedido] ??
                        "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
                      }`}
                    >
                      {STATUS_LABELS[pedido.statusPedido] ?? pedido.statusPedido}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pedidos.length === 0 && (
          <p className="p-8 text-center text-slate-500">Nenhum pedido encontrado.</p>
        )}
      </div>

      {(pagina > 1 || temProximaPagina) && (
        <div className="mt-4 flex items-center justify-between">
          {pagina > 1 ? (
            <Link
              href={`/admin/pedidos?${queryBase}pagina=${pagina - 1}`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-slate-500">Página {pagina}</span>
          {temProximaPagina ? (
            <Link
              href={`/admin/pedidos?${queryBase}pagina=${pagina + 1}`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Próxima →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
