import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VideoAdminForm } from "@/components/VideoAdminForm";

export const dynamic = "force-dynamic";

export default async function EditarVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id } });

  if (!video) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Editar vídeo
      </h1>
      <VideoAdminForm
        videoInicial={{
          id: video.id,
          titulo: video.titulo,
          youtubeUrl: video.youtubeId,
          ordem: video.ordem,
          ativo: video.ativo,
        }}
      />
    </div>
  );
}
