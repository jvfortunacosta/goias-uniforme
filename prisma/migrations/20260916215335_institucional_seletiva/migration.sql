-- CreateTable
CREATE TABLE "Noticia" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "publicadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Noticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jogo" (
    "id" TEXT NOT NULL,
    "temporada" TEXT NOT NULL,
    "adversario" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "local" TEXT NOT NULL,
    "mandante" BOOLEAN NOT NULL DEFAULT true,
    "golsPro" INTEGER,
    "golsContra" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensagemContato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MensagemContato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscricaoSeletiva" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "alturaCm" INTEGER NOT NULL,
    "pesoKg" DOUBLE PRECISION NOT NULL,
    "cidade" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "conheceFutebolAmericano" BOOLEAN NOT NULL,
    "praticaEsporte" BOOLEAN NOT NULL,
    "qualEsporte" TEXT,
    "tempoPratica" TEXT,
    "indicadoPorAtleta" BOOLEAN NOT NULL,
    "nomeIndicacao" TEXT,
    "valorCents" INTEGER NOT NULL DEFAULT 5000,
    "statusPagamento" TEXT NOT NULL DEFAULT 'pendente',
    "mercadopagoPaymentId" TEXT,
    "mercadopagoRaw" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPagamento" TIMESTAMP(3),

    CONSTRAINT "InscricaoSeletiva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Noticia_ativo_publicadoEm_idx" ON "Noticia"("ativo", "publicadoEm");

-- CreateIndex
CREATE INDEX "Video_ativo_ordem_idx" ON "Video"("ativo", "ordem");

-- CreateIndex
CREATE INDEX "Jogo_temporada_dataHora_idx" ON "Jogo"("temporada", "dataHora");

-- CreateIndex
CREATE INDEX "MensagemContato_criadoEm_idx" ON "MensagemContato"("criadoEm");

-- CreateIndex
CREATE INDEX "InscricaoSeletiva_statusPagamento_idx" ON "InscricaoSeletiva"("statusPagamento");

-- CreateIndex
CREATE INDEX "InscricaoSeletiva_mercadopagoPaymentId_idx" ON "InscricaoSeletiva"("mercadopagoPaymentId");
