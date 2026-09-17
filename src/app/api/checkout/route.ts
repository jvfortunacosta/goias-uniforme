import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mpPreference } from "@/lib/mercadopago";
import { calcularFrete } from "@/lib/melhorenvio";
import { getConfiguracaoLoja, vendasEstaoAbertas } from "@/lib/loja";
import { isValidCpf } from "@/lib/format";
import { sendOrderCreatedEmail } from "@/lib/email";

const itemSchema = z.object({
  produtoId: z.number().int(),
  tamanho: z.string().nullable().optional(),
  cor: z.string().nullable().optional(),
  nomePersonalizado: z.string().max(20).nullable().optional(),
  numeroPersonalizado: z.string().max(3).nullable().optional(),
});

const bodySchema = z.object({
  cliente: z.object({
    nome: z.string().min(1),
    cpf: z.string(),
    email: z.string().email(),
    telefone: z.string().min(8),
  }),
  endereco: z.object({
    cep: z.string().min(8),
    logradouro: z.string().min(1),
    numero: z.string().min(1),
    complemento: z.string().nullable().optional(),
    bairro: z.string().min(1),
    cidade: z.string().min(1),
    estado: z.string().length(2),
  }),
  itens: z.array(itemSchema).min(1),
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
  const { cliente, endereco, itens } = parsed.data;

  if (!isValidCpf(cliente.cpf)) {
    return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
  }

  const config = await getConfiguracaoLoja();
  if (!vendasEstaoAbertas(config)) {
    return NextResponse.json(
      { error: "As vendas deste lote estão encerradas." },
      { status: 403 }
    );
  }

  const produtoIds = [...new Set(itens.map((i) => i.produtoId))];
  const produtos = await prisma.produto.findMany({
    where: { id: { in: produtoIds } },
  });
  const produtoMap = new Map(produtos.map((p) => [p.id, p]));

  let itensCents = 0;
  const itensValidados: {
    produtoId: number;
    nomeProduto: string;
    precoUnitarioCents: number;
    tamanho: string | null;
    cor: string | null;
    nomePersonalizado: string | null;
    numeroPersonalizado: string | null;
  }[] = [];
  const itensParaFrete: {
    pesoGramas: number;
    alturaCm: number;
    larguraCm: number;
    comprimentoCm: number;
    valorCents: number;
  }[] = [];

  for (const item of itens) {
    const produto = produtoMap.get(item.produtoId);
    if (!produto || !produto.ativo) {
      return NextResponse.json(
        { error: "Um dos produtos do carrinho não está mais disponível." },
        { status: 400 }
      );
    }
    if (
      produto.tamanhos.length > 0 &&
      (!item.tamanho || !produto.tamanhos.includes(item.tamanho))
    ) {
      return NextResponse.json(
        { error: `Tamanho inválido para o produto "${produto.nome}".` },
        { status: 400 }
      );
    }
    if (
      produto.cores.length > 1 &&
      (!item.cor || !produto.cores.includes(item.cor))
    ) {
      return NextResponse.json(
        { error: `Cor inválida para o produto "${produto.nome}".` },
        { status: 400 }
      );
    }
    if (
      produto.cores.length === 1 &&
      item.cor &&
      item.cor !== produto.cores[0]
    ) {
      return NextResponse.json(
        { error: `Cor inválida para o produto "${produto.nome}".` },
        { status: 400 }
      );
    }

    itensCents += produto.precoCents;
    itensValidados.push({
      produtoId: produto.id,
      nomeProduto: produto.nome,
      precoUnitarioCents: produto.precoCents,
      tamanho: item.tamanho ?? null,
      cor: item.cor ?? (produto.cores.length === 1 ? produto.cores[0] : null),
      nomePersonalizado: item.nomePersonalizado ?? null,
      numeroPersonalizado: item.numeroPersonalizado ?? null,
    });
    itensParaFrete.push({
      pesoGramas: produto.pesoGramas,
      alturaCm: produto.alturaCm,
      larguraCm: produto.larguraCm,
      comprimentoCm: produto.comprimentoCm,
      valorCents: produto.precoCents,
    });
  }

  const frete = await calcularFrete(endereco.cep, itensParaFrete);
  if (!frete) {
    return NextResponse.json(
      { error: "Não foi possível calcular o frete para esse CEP no momento. Tente novamente." },
      { status: 502 }
    );
  }

  const valorTotalCents = itensCents + frete.valorCents;

  const pedido = await prisma.pedido.create({
    data: {
      clienteNome: cliente.nome,
      clienteCpf: cliente.cpf.replace(/\D/g, ""),
      clienteEmail: cliente.email,
      clienteTelefone: cliente.telefone,
      enderecoCep: endereco.cep,
      enderecoLogradouro: endereco.logradouro,
      enderecoNumero: endereco.numero,
      enderecoComplemento: endereco.complemento || null,
      enderecoBairro: endereco.bairro,
      enderecoCidade: endereco.cidade,
      enderecoEstado: endereco.estado,
      itensCents,
      freteCents: frete.valorCents,
      freteServico: frete.servico,
      fretePrazoDias: frete.prazoDias,
      valorTotalCents,
      metodoPagamento: "mercado_pago",
      parcelas: 1,
      statusPedido: "aguardando_pagamento",
      itens: { create: itensValidados },
    },
    include: { itens: true },
  });

  const [primeiroNome, ...restoNome] = cliente.nome.trim().split(/\s+/);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  try {
    const preferenceItems = itensValidados.map((item) => ({
      id: String(item.produtoId),
      title: item.nomeProduto,
      quantity: 1,
      unit_price: item.precoUnitarioCents / 100,
      currency_id: "BRL",
    }));
    preferenceItems.push({
      id: "frete",
      title: `Frete${frete.servico ? ` (${frete.servico})` : ""}`,
      quantity: 1,
      unit_price: frete.valorCents / 100,
      currency_id: "BRL",
    });

    const mpResponse = await mpPreference.create({
      body: {
        items: preferenceItems,
        payer: {
          name: primeiroNome,
          surname: restoNome.join(" ") || primeiroNome,
          email: cliente.email,
          identification: {
            type: "CPF",
            number: cliente.cpf.replace(/\D/g, ""),
          },
        },
        external_reference: pedido.id,
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${siteUrl}/pedido/${pedido.id}`,
          pending: `${siteUrl}/pedido/${pedido.id}`,
          failure: `${siteUrl}/pedido/${pedido.id}`,
        },
        auto_return: "approved",
      },
    });

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        mercadopagoPreferenceId: mpResponse.id ?? null,
        linkPagamento: mpResponse.init_point ?? null,
      },
      include: { itens: true },
    });

    sendOrderCreatedEmail(pedidoAtualizado).catch((e) =>
      console.error("Erro ao enviar e-mail de pedido:", e)
    );

    return NextResponse.json({
      pedidoId: pedidoAtualizado.id,
      linkPagamento: pedidoAtualizado.linkPagamento,
    });
  } catch (err) {
    console.error("Erro ao criar link de pagamento no Mercado Pago:", err);
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { statusPedido: "recusado" },
    });
    return NextResponse.json(
      { error: "Não foi possível gerar o link de pagamento. Tente novamente." },
      { status: 502 }
    );
  }
}
