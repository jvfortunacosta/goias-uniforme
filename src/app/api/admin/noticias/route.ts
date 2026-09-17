import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const noticias = await prisma.noticia.findMany({ orderBy: { publicadoEm: "desc" } });
  return NextResponse.json(noticias);
}

const bodySchema = z.object({
  titulo: z.string().min(1),
  resumo: z.string().min(1),
  conteudo: z.string().min(1),
  imagemUrl: z.string().nullable().optional(),
  ativo: z.boolean(),
  publicadoEm: z.string().min(1),
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

  const noticia = await prisma.noticia.create({
    data: {
      ...parsed.data,
      imagemUrl: parsed.data.imagemUrl || null,
      publicadoEm: new Date(parsed.data.publicadoEm),
    },
  });
  return NextResponse.json(noticia);
}
