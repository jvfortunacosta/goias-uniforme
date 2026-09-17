import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const noticia = await prisma.noticia.findUnique({ where: { id } });
  if (!noticia) {
    return NextResponse.json({ error: "Notícia não encontrada." }, { status: 404 });
  }
  return NextResponse.json(noticia);
}

const bodySchema = z.object({
  titulo: z.string().min(1),
  resumo: z.string().min(1),
  conteudo: z.string().min(1),
  imagemUrl: z.string().nullable().optional(),
  ativo: z.boolean(),
  publicadoEm: z.string().min(1),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", detalhes: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const noticia = await prisma.noticia.update({
    where: { id },
    data: {
      ...parsed.data,
      imagemUrl: parsed.data.imagemUrl || null,
      publicadoEm: new Date(parsed.data.publicadoEm),
    },
  });
  return NextResponse.json(noticia);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.noticia.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
