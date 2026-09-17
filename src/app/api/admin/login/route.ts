import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import { limitarPorIp } from "@/lib/rateLimit";

const bodySchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

const LIMITE_TENTATIVAS = 5;
const DURACAO_BLOQUEIO_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  if (!limitarPorIp(req, "admin-login", 20, 15 * 60 * 1000)) {
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

  const { email, senha } = parsed.data;
  const usuario = await prisma.adminUser.findUnique({ where: { email } });

  if (usuario?.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
    return NextResponse.json(
      { error: "Conta bloqueada temporariamente por excesso de tentativas. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  const senhaValida = usuario && (await bcrypt.compare(senha, usuario.senhaHash));

  if (!usuario || !senhaValida) {
    if (usuario) {
      const tentativas = usuario.tentativasFalhas + 1;
      await prisma.adminUser.update({
        where: { id: usuario.id },
        data: {
          tentativasFalhas: tentativas,
          bloqueadoAte:
            tentativas >= LIMITE_TENTATIVAS
              ? new Date(Date.now() + DURACAO_BLOQUEIO_MS)
              : null,
        },
      });
    }
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  }

  if (usuario.tentativasFalhas > 0 || usuario.bloqueadoAte) {
    await prisma.adminUser.update({
      where: { id: usuario.id },
      data: { tentativasFalhas: 0, bloqueadoAte: null },
    });
  }

  const token = await signAdminToken({ sub: usuario.id, email: usuario.email });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
