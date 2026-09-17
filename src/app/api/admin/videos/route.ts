import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { extrairYoutubeId } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  const videos = await prisma.video.findMany({ orderBy: { ordem: "asc" } });
  return NextResponse.json(videos);
}

const bodySchema = z.object({
  titulo: z.string().min(1),
  youtubeUrl: z.string().min(1),
  ordem: z.number().int(),
  ativo: z.boolean(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", detalhes: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const youtubeId = extrairYoutubeId(parsed.data.youtubeUrl);
  if (!youtubeId) {
    return NextResponse.json(
      { error: "Não foi possível identificar o ID do vídeo nesse link do YouTube." },
      { status: 400 }
    );
  }

  const video = await prisma.video.create({
    data: {
      titulo: parsed.data.titulo,
      youtubeId,
      ordem: parsed.data.ordem,
      ativo: parsed.data.ativo,
    },
  });
  return NextResponse.json(video);
}
