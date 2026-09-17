import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const jogos = await prisma.jogo.findMany({ orderBy: { dataHora: "desc" } });
  return NextResponse.json(jogos);
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

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", detalhes: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const jogo = await prisma.jogo.create({
    data: { ...parsed.data, dataHora: new Date(parsed.data.dataHora) },
  });
  return NextResponse.json(jogo);
}
