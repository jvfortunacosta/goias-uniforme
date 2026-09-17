import type { Pedido, ItemPedido, InscricaoSeletiva } from "@prisma/client";
import { getResend, EMAIL_FROM } from "./resend";
import { formatCents, itemDescricao, escapeHtml } from "./format";

type PedidoComItens = Pedido & { itens: ItemPedido[] };

export async function sendOrderCreatedEmail(pedido: PedidoComItens) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY não configurada: e-mail de pedido não enviado.");
    return;
  }

  const linkPagamento = pedido.linkPagamento
    ? `<p><a href="${pedido.linkPagamento}">Clique aqui para pagar seu pedido</a></p>`
    : "";

  await resend.emails.send({
    from: EMAIL_FROM,
    to: pedido.clienteEmail,
    subject: `Pedido recebido, Goiás F.A. #${pedido.id.slice(0, 8)}`,
    html: `
      <h1>Recebemos seu pedido!</h1>
      <p>Olá ${escapeHtml(pedido.clienteNome)}, seu pedido foi registrado com sucesso.</p>
      ${linkPagamento}
      <ul>
        ${pedido.itens
          .map((i) => `<li>${escapeHtml(itemDescricao(i))}: ${formatCents(i.precoUnitarioCents)}</li>`)
          .join("")}
      </ul>
      <p>Produtos: ${formatCents(pedido.itensCents)}</p>
      <p>Frete${pedido.freteServico ? ` (${pedido.freteServico})` : ""}: ${formatCents(pedido.freteCents)}</p>
      <p><strong>Total: ${formatCents(pedido.valorTotalCents)}</strong></p>
      <p>Se perder este e-mail, você pode consultar o status do seu pedido a qualquer
      momento em <a href="${process.env.NEXT_PUBLIC_SITE_URL}/meus-pedidos">${process.env.NEXT_PUBLIC_SITE_URL}/meus-pedidos</a>,
      informando o e-mail e o CPF usados na compra.</p>
    `,
  });
}

export async function sendPaymentConfirmedEmail(pedido: PedidoComItens) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY não configurada: e-mail de pagamento não enviado.");
    return;
  }

  await resend.emails.send({
    from: EMAIL_FROM,
    to: pedido.clienteEmail,
    subject: `Pagamento confirmado, Goiás F.A. #${pedido.id.slice(0, 8)}`,
    html: `
      <h1>Pagamento confirmado!</h1>
      <p>Olá ${escapeHtml(pedido.clienteNome)}, seu pagamento de ${formatCents(pedido.valorTotalCents)} foi aprovado.</p>
      <p>Seu pedido entrou no lote de produção. Avisaremos quando a confecção estiver pronta.</p>
    `,
  });
}

export async function sendSeletivaConfirmadaEmail(inscricao: InscricaoSeletiva) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY não configurada: e-mail de inscrição não enviado.");
    return;
  }

  await resend.emails.send({
    from: EMAIL_FROM,
    to: inscricao.email,
    subject: "Inscrição confirmada - Seletiva Goiás F.A. 2026",
    html: `
      <h1>Inscrição confirmada!</h1>
      <p>Olá ${escapeHtml(inscricao.nomeCompleto)}, sua inscrição e pagamento de ${formatCents(inscricao.valorCents)} foram confirmados.</p>
      <p><strong>Seletiva Goiás F.A. 2026</strong></p>
      <p>Dia 21/10/2026, às 20:30 — Clube Oásis (C-197 - St. Bueno)</p>
      <p>Leve chuteira society ou tênis (proibido chuteira de cravo e roupas vermelhas).</p>
      <p>Nos vemos lá!</p>
    `,
  });
}
