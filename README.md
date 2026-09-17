# Loja Goiás F.A.

Sistema de vendas por lote de uniformes do Goiás F.A. (futebol americano). Next.js 14 (App
Router) + TypeScript + Tailwind + Prisma/PostgreSQL + Mercado Pago (Checkout Bricks) + Cloudflare
R2 + Resend.

Contexto de negócio e decisões já validadas: ver `PROMPT.md` e `CONTEXTO-E-APRENDIZADOS.md`.

## Setup local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Preencha o `.env` (copie de `.env.example` se estiver começando do zero):
   - `DATABASE_URL`: string de conexão do Postgres.
   - `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `NEXT_PUBLIC_MP_PUBLIC_KEY`, `MP_WEBHOOK_SECRET`: já
     preenchidos com a conta de produção do Mercado Pago.
   - `R2_*`: credenciais do bucket Cloudflare R2 (opcional em dev, sem elas o seed usa as
     imagens de `public/produtos/` como fallback local).
   - `RESEND_API_KEY`: opcional em dev, sem ela os e-mails só são logados no console em vez de
     enviados.
   - `JWT_SECRET`: gerar um valor aleatório forte antes de produção (`openssl rand -hex 32`).
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`: credenciais do primeiro usuário admin, usadas pelo seed.

3. Rode as migrations e o seed (cria o catálogo inicial, a configuração da loja e o usuário
   admin):

   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. Suba o servidor:

   ```bash
   npm run dev
   ```

   Loja em `http://localhost:3000`, painel admin em `http://localhost:3000/admin/login`.

## Webhook do Mercado Pago em desenvolvimento

O Mercado Pago precisa alcançar `NEXT_PUBLIC_SITE_URL/api/webhooks/mercadopago` publicamente.
Em dev, use um túnel (ex: `ngrok http 3000`) e cadastre a URL + o segredo de assinatura no painel
do Mercado Pago (o valor deve bater com `MP_WEBHOOK_SECRET`).

**Antes de testar Pix**: confirme que a conta Mercado Pago tem uma chave Pix cadastrada
(`GET /v1/payment_methods` deve listar `pix`). Sem isso, todo pagamento Pix falha com
`processing_error`, não é bug de código (ver `CONTEXTO-E-APRENDIZADOS.md`).

## Deploy

Aplicação padrão Next.js. Qualquer host que rode Node.js (Vercel, Railway, etc.) funciona.
Pontos de atenção:

- Configurar todas as variáveis de ambiente do `.env` no host de produção.
- Rodar `npx prisma migrate deploy` contra o banco de produção antes do primeiro deploy.
- Rodar `npm run db:seed` uma vez para criar o catálogo inicial e o usuário admin (ou criar o
  catálogo manualmente).
- Cadastrar a URL de produção do webhook no painel do Mercado Pago.
