# Goiás FA | Loja oficial de uniformes

E-commerce completo da equipe de futebol americano **Goiás FA**, construído do zero em Next.js para vender uniformes personalizados no modelo de **venda por lote** (abre o período de pedidos, fecha na data limite e envia a lista consolidada para a confecção).

🔗 **Demo:** [goiasfa.vercel.app](https://goiasfa.vercel.app)

## Funcionalidades

- **Catálogo com personalização:** tamanho, cor, nome e número em cada peça
- **Carrinho por unidade personalizada:** cada combinação vira um item próprio, garantindo um resumo de produção correto
- **Checkout Mercado Pago (Checkout Bricks):** Pix, boleto e cartão de crédito com parcelamento
- **Webhook com validação HMAC-SHA256:** o pedido é confirmado automaticamente e o cliente recebe o e-mail de confirmação
- **Preço sempre recalculado no servidor:** o back-end nunca confia no valor enviado pelo navegador
- **Data limite de vendas:** fechamento automático do lote, verificado no servidor
- **Painel administrativo:** pedidos com filtro e exportação CSV, configuração da loja e **resumo de produção** agrupado por produto, cor e tamanho
- Upload de imagens dos produtos no Cloudflare R2

## Stack

| Camada | Tecnologia |
|---|---|
| Front-end | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Back-end | Route Handlers do Next.js, Zod, JOSE (JWT), bcrypt |
| Banco de dados | PostgreSQL (Supabase) com Prisma ORM |
| Pagamentos | Mercado Pago SDK |
| E-mail | Resend |
| Armazenamento | Cloudflare R2 (API S3) |
| Deploy | Vercel |

## Como rodar localmente

```bash
git clone https://github.com/jvfortunacosta/goias-uniforme.git
cd goias-uniforme
npm install
cp .env.example .env   # preencha as variáveis
npx prisma migrate dev
npm run db:seed
npm run dev
```

Acesse `http://localhost:3000`.

## Documentação técnica

O arquivo [`CONTEXTO-E-APRENDIZADOS.md`](./CONTEXTO-E-APRENDIZADOS.md) reúne regras de negócio, modelo de dados e os aprendizados da integração com o Mercado Pago (validação de webhook, Pix, boleto e tokenização de cartão).

---

Desenvolvido por [João Victor Fortuna Costa](https://github.com/jvfortunacosta)
