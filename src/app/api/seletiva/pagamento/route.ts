import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";
import { sendSeletivaConfirmadaEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  inscricaoId: z.string().min(1),
  formData: z.object({
    transaction_amount: z.number(),
    token: z.string().optional(),
    installments: z.number().optional(),
    payment_method_id: z.string(),
    issuer_id: z.union([z.string(), z.number()]).optional(),
    payer: z.object({
      email: z.string().email(),
      identification: z
        .object({
          type: z.string().optional(),
          number: z.string().optional(),
        })
        .optional(),
    }),
  }),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados de pagamento inválidos." },
      { status: 400 }
    );
  }

  const { inscricaoId, formData } = parsed.data;

  const inscricao = await prisma.inscricaoSeletiva.findUnique({
    where: { id: inscricaoId },
  });
  if (!inscricao) {
    return NextResponse.json({ error: "Inscrição não encontrada." }, { status: 404 });
  }
  if (inscricao.statusPagamento === "pago") {
    return NextResponse.json({ error: "Esta inscrição já foi paga." }, { status: 409 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  try {
    const payment = await mpPayment.create({
      body: {
        transaction_amount: inscricao.valorCents / 100,
        token: formData.token,
        installments: formData.installments ?? 1,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id ? Number(formData.issuer_id) : undefined,
        payer: {
          email: formData.payer.email,
          identification: formData.payer.identification,
        },
        description: "Inscrição Seletiva Goiás F.A. 2026",
        external_reference: inscricao.id,
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      },
    });

    let statusPagamento = inscricao.statusPagamento;
    if (payment.status === "approved") statusPagamento = "pago";
    else if (payment.status === "rejected") statusPagamento = "recusado";
    else if (payment.status === "pending" || payment.status === "in_process")
      statusPagamento = "pendente";

    const inscricaoAtualizada = await prisma.inscricaoSeletiva.update({
      where: { id: inscricao.id },
      data: {
        statusPagamento,
        mercadopagoPaymentId: String(payment.id),
        mercadopagoRaw: payment as unknown as Prisma.InputJsonValue,
        dataPagamento: statusPagamento === "pago" ? new Date() : null,
      },
    });

    if (statusPagamento === "pago") {
      sendSeletivaConfirmadaEmail(inscricaoAtualizada).catch((e) =>
        console.error("Erro ao enviar e-mail de confirmação da seletiva:", e)
      );
    }

    return NextResponse.json({
      status: payment.status,
      status_detail: payment.status_detail,
      payment_method_id: payment.payment_method_id,
      point_of_interaction: payment.point_of_interaction ?? null,
    });
  } catch (err) {
    console.error("Erro ao processar pagamento da seletiva:", err);
    return NextResponse.json(
      { error: "Não foi possível processar o pagamento. Tente novamente." },
      { status: 502 }
    );
  }
}
