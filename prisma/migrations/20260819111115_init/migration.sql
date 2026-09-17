-- CreateTable
CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "precoCents" INTEGER NOT NULL,
    "imagemUrl" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tamanhos" TEXT[],
    "cores" TEXT[],
    "permitePersonalizacao" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "mercadopagoPaymentId" TEXT,
    "clienteNome" TEXT NOT NULL,
    "clienteCpf" TEXT NOT NULL,
    "clienteEmail" TEXT NOT NULL,
    "clienteTelefone" TEXT NOT NULL,
    "enderecoCep" TEXT NOT NULL,
    "enderecoLogradouro" TEXT NOT NULL,
    "enderecoNumero" TEXT NOT NULL,
    "enderecoComplemento" TEXT,
    "enderecoBairro" TEXT NOT NULL,
    "enderecoCidade" TEXT NOT NULL,
    "enderecoEstado" TEXT NOT NULL,
    "valorTotalCents" INTEGER NOT NULL,
    "metodoPagamento" TEXT NOT NULL,
    "parcelas" INTEGER NOT NULL DEFAULT 1,
    "statusPedido" TEXT NOT NULL,
    "qrCodePix" TEXT,
    "qrCodePixBase64" TEXT,
    "mercadopagoRaw" JSONB,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPagamento" TIMESTAMP(3),

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "nomeProduto" TEXT NOT NULL,
    "precoUnitarioCents" INTEGER NOT NULL,
    "tamanho" TEXT,
    "cor" TEXT,
    "nomePersonalizado" TEXT,
    "numeroPersonalizado" TEXT,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracaoLoja" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "vendasAbertas" BOOLEAN NOT NULL DEFAULT true,
    "dataLimite" TIMESTAMP(3),
    "mensagemEncerramento" TEXT NOT NULL DEFAULT 'As vendas deste lote estão encerradas. Fique de olho para o próximo período de pedidos.',

    CONSTRAINT "ConfiguracaoLoja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pedido_statusPedido_idx" ON "Pedido"("statusPedido");

-- CreateIndex
CREATE INDEX "Pedido_mercadopagoPaymentId_idx" ON "Pedido"("mercadopagoPaymentId");

-- CreateIndex
CREATE INDEX "ItemPedido_pedidoId_idx" ON "ItemPedido"("pedidoId");

-- CreateIndex
CREATE INDEX "ItemPedido_produtoId_idx" ON "ItemPedido"("produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
