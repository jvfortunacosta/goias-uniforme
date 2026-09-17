import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jogo = await prisma.jogo.findUnique({ where: { id } });
  if (!jogo) {
    return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
  }
  return NextResponse.json(jogo);
}

const bodySchema = z.object({
  temporada: z.string().min(1),
  adversario: z.string().min(1),
  dataHora: z.string().min(1),
  local: z.string().min(1),
  mandante: z.boolean(),
  golsPro: z.number().int().nullable().optional(),
  golsContra: z.number().int().nullable().optional(),
  ativo: z.boolean(),
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

  const jogo = await prisma.jogo.update({
    where: { id },
    data: { ...parsed.data, dataHora: new Date(parsed.data.dataHora) },
  });
  return NextResponse.json(jogo);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.jogo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
