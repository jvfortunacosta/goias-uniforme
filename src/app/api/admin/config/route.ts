import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getConfiguracaoLoja } from "@/lib/loja";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getConfiguracaoLoja();
  return NextResponse.json(config);
}

const bodySchema = z.object({
  vendasAbertas: z.boolean(),
  dataLimite: z.string().nullable(),
  mensagemEncerramento: z.string().min(1),
});

export async function PUT(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { vendasAbertas, dataLimite, mensagemEncerramento } = parsed.data;

  const config = await prisma.configuracaoLoja.upsert({
    where: { id: 1 },
    update: {
      vendasAbertas,
      dataLimite: dataLimite ? new Date(dataLimite) : null,
      mensagemEncerramento,
    },
    create: {
      id: 1,
      vendasAbertas,
      dataLimite: dataLimite ? new Date(dataLimite) : null,
      mensagemEncerramento,
    },
  });

  return NextResponse.json(config);
}
