import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { uploadToR2 } from "../src/lib/r2";
import { ORDEM_TAMANHOS } from "../src/lib/constants";

const prisma = new PrismaClient();

const r2Configurado = Boolean(
  process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
);

async function resolveImagemUrl(arquivo: string): Promise<string> {
  if (r2Configurado) {
    const caminhoLocal = path.join(
      process.cwd(),
      "imagens-produtos",
      arquivo
    );
    const buffer = fs.readFileSync(caminhoLocal);
    const url = await uploadToR2(`produtos/${arquivo}`, buffer, "image/jpeg");
    console.log(`  imagem enviada pro R2: ${url}`);
    return url;
  }

  console.log(
    `  R2 não configurado — usando fallback local /produtos/${arquivo}`
  );
  return `/produtos/${arquivo}`;
}

async function main() {
  console.log("Configuração da loja...");
  await prisma.configuracaoLoja.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      vendasAbertas: true,
      mensagemEncerramento:
        "As vendas deste lote estão encerradas. Fique de olho para o próximo período de pedidos.",
    },
  });

  console.log("Catálogo...");
  const jerseyImg = await resolveImagemUrl("jersey_torcedor.jpg");
  const flagImg = await resolveImagemUrl("jersey_flag.jpg");

  await prisma.produto.upsert({
    where: { id: 1 },
    update: {
      imagemUrl: jerseyImg,
    },
    create: {
      id: 1,
      nome: "Jersey Torcedor F.A.",
      descricao:
        "Jersey oficial de torcedor do Goiás F.A. Nome e número de personalização opcionais.",
      precoCents: 15500,
      imagemUrl: jerseyImg,
      categoria: "jersey",
      tamanhos: [...ORDEM_TAMANHOS],
      cores: [],
      permitePersonalizacao: true,
      ativo: true,
    },
  });

  await prisma.produto.upsert({
    where: { id: 2 },
    update: {
      imagemUrl: flagImg,
    },
    create: {
      id: 2,
      nome: "Regata Flag",
      descricao:
        "Regata de flag football do Goiás F.A., disponível em branca ou verde. Nome e número de personalização opcionais.",
      precoCents: 8500,
      imagemUrl: flagImg,
      categoria: "regata",
      tamanhos: [...ORDEM_TAMANHOS],
      cores: ["Branca", "Verde"],
      permitePersonalizacao: true,
      ativo: true,
    },
  });

  // Mantém a sequência do id autoincrement sincronizada após os upserts com id fixo.
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Produto"', 'id'), (SELECT MAX(id) FROM "Produto"))`
  );

  console.log("Notícias (rascunho inicial)...");
  const totalNoticias = await prisma.noticia.count();
  if (totalNoticias === 0) {
    await prisma.noticia.createMany({
      data: [
        {
          titulo: "Parceria para a temporada 2026",
          resumo: "Conteúdo a ser publicado pela equipe.",
          conteudo:
            "Rascunho criado automaticamente. Edite esta notícia no painel admin antes de publicar.",
          ativo: false,
        },
        {
          titulo: "Despedida do Head Coach Andrew Bernardini",
          resumo: "Conteúdo a ser publicado pela equipe.",
          conteudo:
            "Rascunho criado automaticamente. Edite esta notícia no painel admin antes de publicar.",
          ativo: false,
        },
        {
          titulo: "Novo uniforme 2026 da WV Sports",
          resumo: "Conteúdo a ser publicado pela equipe.",
          conteudo:
            "Rascunho criado automaticamente. Edite esta notícia no painel admin antes de publicar.",
          ativo: false,
        },
      ],
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    console.log("Usuário admin...");
    const senhaHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        senhaHash,
        nome: "Administrador",
      },
    });
  } else {
    console.warn(
      "ADMIN_EMAIL/ADMIN_PASSWORD não definidos no .env — nenhum usuário admin criado."
    );
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
