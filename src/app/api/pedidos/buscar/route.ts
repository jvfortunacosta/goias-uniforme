import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { limitarPorIp } from "@/lib/rateLimit";

const bodySchema = z.object({
  email: z.string().email(),
  cpf: z.string(),
});

export async function POST(req: NextRequest) {
  if (!limitarPorIp(req, "buscar-pedido", 10, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." },
      { status: 429 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const cpf = parsed.data.cpf.replace(/\D/g, "");

  const pedidos = await prisma.pedido.findMany({
    where: { clienteEmail: { equals: email, mode: "insensitive" }, clienteCpf: cpf },
    orderBy: { dataCriacao: "desc" },
    select: {
      id: true,
      dataCriacao: true,
      statusPedido: true,
      valorTotalCents: true,
    },
  });

  return NextResponse.json({ pedidos });
}
