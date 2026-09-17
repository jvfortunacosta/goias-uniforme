import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calcularFrete } from "@/lib/melhorenvio";

const bodySchema = z.object({
  cep: z.string().min(8),
  produtoIds: z.array(z.number().int()).min(1),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { cep, produtoIds } = parsed.data;
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }

  const produtos = await prisma.produto.findMany({
    where: { id: { in: produtoIds } },
  });
  const produtoMap = new Map(produtos.map((p) => [p.id, p]));

  const itensParaFrete = produtoIds
    .map((id) => produtoMap.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      pesoGramas: p.pesoGramas,
      alturaCm: p.alturaCm,
      larguraCm: p.larguraCm,
      comprimentoCm: p.comprimentoCm,
      valorCents: p.precoCents,
    }));

  if (itensParaFrete.length === 0) {
    return NextResponse.json(
      { error: "Nenhum produto válido no carrinho." },
      { status: 400 }
    );
  }

  const frete = await calcularFrete(cepLimpo, itensParaFrete);

  if (!frete) {
    return NextResponse.json(
      { error: "Não foi possível calcular o frete para esse CEP no momento." },
      { status: 502 }
    );
  }

  return NextResponse.json(frete);
}
