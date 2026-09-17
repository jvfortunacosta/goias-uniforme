import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (
    !process.env.R2_ACCOUNT_ID ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_BUCKET_NAME ||
    !process.env.R2_PUBLIC_URL
  ) {
    return NextResponse.json(
      { error: "R2 não está configurado no servidor." },
      { status: 503 }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo não enviado." }, { status: 400 });
  }

  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato de imagem não suportado. Use JPG, PNG ou WebP." },
      { status: 400 }
    );
  }

  if (file.size > TAMANHO_MAXIMO_BYTES) {
    return NextResponse.json(
      { error: "Imagem muito grande. Envie um arquivo de até 8MB." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extensao = file.type.split("/")[1];
  const chave = `produtos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;

  const url = await uploadToR2(chave, buffer, file.type);

  return NextResponse.json({ url });
}
