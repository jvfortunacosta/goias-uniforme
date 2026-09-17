import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDataHora } from "@/lib/format";

const STATUS_VALIDOS = [
  "aguardando_pagamento",
  "aguardando_pix",
  "processando",
  "pago",
  "recusado",
];

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const filtro = status && STATUS_VALIDOS.includes(status) ? status : undefined;

  const pedidos = await prisma.pedido.findMany({
    where: filtro ? { statusPedido: filtro } : undefined,
    orderBy: { dataCriacao: "desc" },
    include: { itens: true },
  });

  const cabecalho = [
    "Pedido",
    "Data",
    "Status",
    "Cliente",
    "CPF",
    "E-mail",
    "Telefone",
    "Endereço",
    "Produto",
    "Tamanho",
    "Cor",
    "Nome personalizado",
    "Número personalizado",
    "Preço unitário",
    "Pagamento",
    "Parcelas",
    "Frete",
    "Total do pedido",
  ];

  const linhas: string[] = [cabecalho.join(";")];

  for (const pedido of pedidos) {
    const endereco = [
      pedido.enderecoLogradouro,
      pedido.enderecoNumero,
      pedido.enderecoComplemento,
      pedido.enderecoBairro,
      pedido.enderecoCidade,
      pedido.enderecoEstado,
      pedido.enderecoCep,
    ]
      .filter(Boolean)
      .join(", ");

    for (const item of pedido.itens) {
      linhas.push(
        [
          pedido.id,
          formatDataHora(pedido.dataCriacao),
          pedido.statusPedido,
          pedido.clienteNome,
          pedido.clienteCpf,
          pedido.clienteEmail,
          pedido.clienteTelefone,
          endereco,
          item.nomeProduto,
          item.tamanho ?? "",
          item.cor ?? "",
          item.nomePersonalizado ?? "",
          item.numeroPersonalizado ?? "",
          formatCents(item.precoUnitarioCents),
          pedido.metodoPagamento,
          String(pedido.parcelas),
          formatCents(pedido.freteCents),
          formatCents(pedido.valorTotalCents),
        ]
          .map((v) => csvEscape(String(v)))
          .join(";")
      );
    }
  }

  const csv = "﻿" + linhas.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-goiasfa-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
