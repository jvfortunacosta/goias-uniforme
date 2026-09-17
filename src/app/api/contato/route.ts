import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ASSUNTOS = [
  "Informações Gerais",
  "Patrocinadores",
  "Imprensa",
  "Tryouts/Testes",
  "Outros",
] as const;

const bodySchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  telefone: z.string().min(8),
  assunto: z.enum(ASSUNTOS),
  mensagem: z.string().min(1),
  aceitouTermos: z.literal(true),
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

  const { nome, email, telefone, assunto, mensagem } = parsed.data;

  await prisma.mensagemContato.create({
    data: { nome, email, telefone, assunto, mensagem },
  });

  return NextResponse.json({ ok: true });
}
