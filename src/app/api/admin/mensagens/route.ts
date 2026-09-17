import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const mensagens = await prisma.mensagemContato.findMany({
    orderBy: { criadoEm: "desc" },
  });
  return NextResponse.json(mensagens);
}
