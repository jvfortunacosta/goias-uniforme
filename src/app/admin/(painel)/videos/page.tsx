import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminDeleteButton } from "@/components/AdminDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await prisma.video.findMany({ orderBy: { ordem: "asc" } });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
          Vídeos
        </h1>
        <Link
          href="/admin/videos/novo"
          className="rounded-md bg-forest-700 px-4 py-2 font-heading text-sm font-bold uppercase tracking-wide text-white transition hover:bg-forest-800"
        >
          Novo vídeo
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Título</th>
              <th className="p-3">YouTube ID</th>
              <th className="p-3">Ordem</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} className="border-b border-slate-100">
                <td className="p-3 font-medium">{video.titulo}</td>
                <td className="p-3 text-slate-500">{video.youtubeId}</td>
                <td className="p-3 text-slate-500">{video.ordem}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      video.ativo ? "bg-pitch-50 text-forest-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {video.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/videos/${video.id}`}
                      className="text-sm font-medium text-forest-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <AdminDeleteButton
                      url={`/api/admin/videos/${video.id}`}
                      confirmMessage={`Excluir o vídeo "${video.titulo}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {videos.length === 0 && (
          <p className="p-6 text-center text-slate-500">Nenhum vídeo cadastrado.</p>
        )}
      </div>
    </div>
  );
}
