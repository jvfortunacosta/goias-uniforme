import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDataHora } from "@/lib/format";
import { AdminDeleteButton } from "@/components/AdminDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminNoticiasPage() {
  const noticias = await prisma.noticia.findMany({ orderBy: { publicadoEm: "desc" } });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
          Notícias
        </h1>
        <Link
          href="/admin/noticias/nova"
          className="rounded-md bg-forest-700 px-4 py-2 font-heading text-sm font-bold uppercase tracking-wide text-white transition hover:bg-forest-800"
        >
          Nova notícia
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Título</th>
              <th className="p-3">Publicação</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {noticias.map((noticia) => (
              <tr key={noticia.id} className="border-b border-slate-100">
                <td className="p-3 font-medium">{noticia.titulo}</td>
                <td className="p-3 text-slate-500">{formatDataHora(noticia.publicadoEm)}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      noticia.ativo
                        ? "bg-pitch-50 text-forest-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {noticia.ativo ? "Publicada" : "Rascunho"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/noticias/${noticia.id}`}
                      className="text-sm font-medium text-forest-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <AdminDeleteButton
                      url={`/api/admin/noticias/${noticia.id}`}
                      confirmMessage={`Excluir a notícia "${noticia.titulo}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {noticias.length === 0 && (
          <p className="p-6 text-center text-slate-500">Nenhuma notícia cadastrada.</p>
        )}
      </div>
    </div>
  );
}
