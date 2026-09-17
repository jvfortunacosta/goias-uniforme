import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NoticiaAdminForm } from "@/components/NoticiaAdminForm";

export const dynamic = "force-dynamic";

export default async function EditarNoticiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const noticia = await prisma.noticia.findUnique({ where: { id } });

  if (!noticia) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Editar notícia
      </h1>
      <NoticiaAdminForm
        noticiaInicial={{
          id: noticia.id,
          titulo: noticia.titulo,
          resumo: noticia.resumo,
          conteudo: noticia.conteudo,
          imagemUrl: noticia.imagemUrl,
          ativo: noticia.ativo,
          publicadoEm: noticia.publicadoEm.toISOString(),
        }}
      />
    </div>
  );
}
