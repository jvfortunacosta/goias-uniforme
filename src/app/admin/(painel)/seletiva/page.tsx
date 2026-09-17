import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDataHora } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pendente: "Aguardando pagamento",
  pago: "Pago",
  recusado: "Recusado",
};

export default async function AdminSeletivaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filtroStatus = status && status !== "todos" ? status : undefined;

  const [inscricoes, totalPago, totalPendente] = await Promise.all([
    prisma.inscricaoSeletiva.findMany({
      where: filtroStatus ? { statusPagamento: filtroStatus } : undefined,
      orderBy: { criadoEm: "desc" },
    }),
    prisma.inscricaoSeletiva.count({ where: { statusPagamento: "pago" } }),
    prisma.inscricaoSeletiva.count({ where: { statusPagamento: "pendente" } }),
  ]);

  const filtros = [
    { valor: "todos", label: "Todos" },
    { valor: "pago", label: `Pagos (${totalPago})` },
    { valor: "pendente", label: `Aguardando pagamento (${totalPendente})` },
    { valor: "recusado", label: "Recusados" },
  ];

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Inscrições - Seletiva
      </h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <Link
            key={f.valor}
            href={`/admin/seletiva?status=${f.valor}`}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              (status ?? "todos") === f.valor
                ? "border-forest-700 bg-forest-700 text-white"
                : "border-slate-300 text-slate-600 hover:border-forest-400"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Nome</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Nascimento</th>
              <th className="p-3">Altura/Peso</th>
              <th className="p-3">Cidade</th>
              <th className="p-3">Já conhece?</th>
              <th className="p-3">Pratica esporte</th>
              <th className="p-3">Indicação</th>
              <th className="p-3">Inscrito em</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {inscricoes.map((i) => (
              <tr key={i.id} className="border-b border-slate-100 align-top">
                <td className="p-3 font-medium">{i.nomeCompleto}</td>
                <td className="p-3 text-slate-500">
                  {i.email}
                  <br />
                  {i.telefone}
                </td>
                <td className="p-3 text-slate-500">
                  {i.dataNascimento.toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                </td>
                <td className="p-3 text-slate-500">
                  {i.alturaCm}cm / {i.pesoKg}kg
                </td>
                <td className="p-3 text-slate-500">{i.cidade}</td>
                <td className="p-3 text-slate-500">
                  {i.conheceFutebolAmericano ? "Sim" : "Não"}
                </td>
                <td className="p-3 text-slate-500">
                  {i.praticaEsporte ? (
                    <>
                      {i.qualEsporte || "Sim"}
                      {i.tempoPratica ? ` · ${i.tempoPratica}` : ""}
                    </>
                  ) : (
                    "Não"
                  )}
                </td>
                <td className="p-3 text-slate-500">
                  {i.indicadoPorAtleta ? i.nomeIndicacao || "Sim" : "Não"}
                </td>
                <td className="p-3 text-slate-500">{formatDataHora(i.criadoEm)}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      i.statusPagamento === "pago"
                        ? "bg-pitch-50 text-forest-700"
                        : i.statusPagamento === "recusado"
                          ? "bg-red-50 text-red-600"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {STATUS_LABELS[i.statusPagamento] ?? i.statusPagamento}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">{formatCents(i.valorCents)}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inscricoes.length === 0 && (
          <p className="p-6 text-center text-slate-500">Nenhuma inscrição encontrada.</p>
        )}
      </div>
    </div>
  );
}
