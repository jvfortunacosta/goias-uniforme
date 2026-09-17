import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDataHora } from "@/lib/format";
import { AdminDeleteButton } from "@/components/AdminDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminAgendaPage() {
  const jogos = await prisma.jogo.findMany({ orderBy: { dataHora: "desc" } });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
          Agenda
        </h1>
        <Link
          href="/admin/agenda/novo"
          className="rounded-md bg-forest-700 px-4 py-2 font-heading text-sm font-bold uppercase tracking-wide text-white transition hover:bg-forest-800"
        >
          Novo jogo
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Temporada</th>
              <th className="p-3">Confronto</th>
              <th className="p-3">Data</th>
              <th className="p-3">Local</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {jogos.map((jogo) => (
              <tr key={jogo.id} className="border-b border-slate-100">
                <td className="p-3 text-slate-500">{jogo.temporada}</td>
                <td className="p-3 font-medium">
                  Goiás F.A. {jogo.mandante ? "x" : "@"} {jogo.adversario}
                </td>
                <td className="p-3 text-slate-500">{formatDataHora(jogo.dataHora)}</td>
                <td className="p-3 text-slate-500">{jogo.local}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      jogo.ativo ? "bg-pitch-50 text-forest-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {jogo.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/agenda/${jogo.id}`}
                      className="text-sm font-medium text-forest-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <AdminDeleteButton
                      url={`/api/admin/jogos/${jogo.id}`}
                      confirmMessage={`Excluir o jogo contra "${jogo.adversario}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {jogos.length === 0 && (
          <p className="p-6 text-center text-slate-500">Nenhum jogo cadastrado.</p>
        )}
      </div>
    </div>
  );
}
