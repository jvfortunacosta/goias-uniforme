import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const produtos = await prisma.produto.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(produtos);
}

const bodySchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().min(1),
  precoCents: z.number().int().min(0),
  imagemUrl: z.string().min(1),
  categoria: z.string().min(1),
  tamanhos: z.array(z.string()),
  cores: z.array(z.string()),
  permitePersonalizacao: z.boolean(),
  ativo: z.boolean(),
  pesoGramas: z.number().int().min(1),
  alturaCm: z.number().int().min(1),
  larguraCm: z.number().int().min(1),
  comprimentoCm: z.number().int().min(1),
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

  const produto = await prisma.produto.create({ data: parsed.data });
  return NextResponse.json(produto);
}
