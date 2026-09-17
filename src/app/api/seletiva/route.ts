import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  nomeCompleto: z.string().min(1),
  dataNascimento: z.string().min(1),
  alturaCm: z.number().int().min(1),
  pesoKg: z.number().min(1),
  cidade: z.string().min(1),
  email: z.string().email(),
  telefone: z.string().min(8),
  conheceFutebolAmericano: z.boolean(),
  praticaEsporte: z.boolean(),
  qualEsporte: z.string().nullable().optional(),
  tempoPratica: z.string().nullable().optional(),
  indicadoPorAtleta: z.boolean(),
  nomeIndicacao: z.string().nullable().optional(),
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

  const data = parsed.data;

  const inscricao = await prisma.inscricaoSeletiva.create({
    data: {
      nomeCompleto: data.nomeCompleto,
      dataNascimento: new Date(data.dataNascimento),
      alturaCm: data.alturaCm,
      pesoKg: data.pesoKg,
      cidade: data.cidade,
      email: data.email,
      telefone: data.telefone,
      conheceFutebolAmericano: data.conheceFutebolAmericano,
      praticaEsporte: data.praticaEsporte,
      qualEsporte: data.praticaEsporte ? data.qualEsporte || null : null,
      tempoPratica: data.praticaEsporte ? data.tempoPratica || null : null,
      indicadoPorAtleta: data.indicadoPorAtleta,
      nomeIndicacao: data.indicadoPorAtleta ? data.nomeIndicacao || null : null,
    },
  });

  return NextResponse.json({
    inscricaoId: inscricao.id,
    valorCents: inscricao.valorCents,
  });
}
