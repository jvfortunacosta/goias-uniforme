import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mpPayment, mpPreference } from "@/lib/mercadopago";
import { sendPaymentConfirmedEmail, sendSeletivaConfirmadaEmail } from "@/lib/email";

function validarAssinatura(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  const partes = Object.fromEntries(
    xSignature.split(",").map((par) => {
      const [chave, valor] = par.split("=");
      return [chave?.trim(), valor?.trim()];
    })
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const esperado = crypto
    .createHmac("sha256", process.env.MP_WEBHOOK_SECRET!)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(v1));
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const body = await req.json().catch(() => null);

  const topic = url.searchParams.get("type") ?? body?.type ?? body?.topic;
  if (topic && topic !== "payment") {
    return NextResponse.json({ received: true });
  }

  const dataId =
    url.searchParams.get("data.id") ?? body?.data?.id ?? body?.id;
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");

  if (!dataId || !xSignature || !xRequestId) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  let assinaturaValida: boolean;
  try {
    assinaturaValida = validarAssinatura(xSignature, xRequestId, String(dataId));
  } catch {
    assinaturaValida = false;
  }

  if (!assinaturaValida) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  const payment = await mpPayment.get({ id: String(dataId) });

  let pedido = await prisma.pedido.findFirst({
    where: { mercadopagoPaymentId: String(payment.id) },
  });

  if (!pedido && payment.external_reference) {
    pedido = await prisma.pedido.findUnique({
      where: { id: payment.external_reference },
    });
  }

  if (!pedido) {
    await processarPagamentoSeletiva(payment);
    return NextResponse.json({ received: true });
  }

  if (pedido.statusPedido === "pago" && payment.status !== "approved") {
    // Um pedido já pago (por outra tentativa de pagamento, ex: cartão recusado
    // seguido de Pix aprovado) nunca deve regredir por causa de um webhook
    // atrasado/fora de ordem de uma tentativa anterior.
    return NextResponse.json({ received: true });
  }

  const isPix = payment.payment_method_id === "pix";

  let statusPedido = pedido.statusPedido;
  if (payment.status === "approved") statusPedido = "pago";
  else if (payment.status === "rejected") statusPedido = "recusado";
  else if (payment.status === "pending" || payment.status === "in_process") {
    statusPedido = isPix ? "aguardando_pix" : "processando";
  }

  const jaEstavaPago = pedido.statusPedido === "pago";

  const pedidoAtualizado = await prisma.pedido.update({
    where: { id: pedido.id },
    data: {
      mercadopagoPaymentId: String(payment.id),
      metodoPagamento: isPix ? "pix" : "credit_card",
      parcelas: payment.installments ?? pedido.parcelas,
      statusPedido,
      mercadopagoRaw: payment as unknown as Prisma.InputJsonValue,
      dataPagamento:
        statusPedido === "pago" ? pedido.dataPagamento ?? new Date() : pedido.dataPagamento,
    },
    include: { itens: true },
  });

  if (statusPedido === "pago" && !jaEstavaPago) {
    sendPaymentConfirmedEmail(pedidoAtualizado).catch((e) =>
      console.error("Erro ao enviar e-mail de pagamento:", e)
    );
    if (pedido.mercadopagoPreferenceId) {
      const itemsExpirados = pedidoAtualizado.itens.map((item) => ({
        id: String(item.produtoId),
        title: item.nomeProduto,
        quantity: 1,
        unit_price: item.precoUnitarioCents / 100,
        currency_id: "BRL",
      }));
      itemsExpirados.push({
        id: "frete",
        title: `Frete${pedidoAtualizado.freteServico ? ` (${pedidoAtualizado.freteServico})` : ""}`,
        quantity: 1,
        unit_price: pedidoAtualizado.freteCents / 100,
        currency_id: "BRL",
      });

      mpPreference
        .update({
          id: pedido.mercadopagoPreferenceId,
          updatePreferenceRequest: {
            items: itemsExpirados,
            expires: true,
            expiration_date_to: new Date().toISOString(),
          },
        })
        .catch((e) => console.error("Erro ao expirar link de pagamento:", e));
    }
  }

  return NextResponse.json({ received: true });
}

async function processarPagamentoSeletiva(
  payment: Awaited<ReturnType<typeof mpPayment.get>>
) {
  let inscricao = await prisma.inscricaoSeletiva.findFirst({
    where: { mercadopagoPaymentId: String(payment.id) },
  });

  if (!inscricao && payment.external_reference) {
    inscricao = await prisma.inscricaoSeletiva.findUnique({
      where: { id: payment.external_reference },
    });
  }

  if (!inscricao) return;

  if (inscricao.statusPagamento === "pago" && payment.status !== "approved") {
    return;
  }

  let statusPagamento = inscricao.statusPagamento;
  if (payment.status === "approved") statusPagamento = "pago";
  else if (payment.status === "rejected") statusPagamento = "recusado";
  else if (payment.status === "pending" || payment.status === "in_process") {
    statusPagamento = "pendente";
  }

  const jaEstavaPago = inscricao.statusPagamento === "pago";

  const inscricaoAtualizada = await prisma.inscricaoSeletiva.update({
    where: { id: inscricao.id },
    data: {
      mercadopagoPaymentId: String(payment.id),
      statusPagamento,
      mercadopagoRaw: payment as unknown as Prisma.InputJsonValue,
      dataPagamento:
        statusPagamento === "pago" ? inscricao.dataPagamento ?? new Date() : inscricao.dataPagamento,
    },
  });

  if (statusPagamento === "pago" && !jaEstavaPago) {
    sendSeletivaConfirmadaEmail(inscricaoAtualizada).catch((e) =>
      console.error("Erro ao enviar e-mail de confirmação da seletiva:", e)
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
