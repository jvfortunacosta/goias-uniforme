# Contexto e aprendizados — Loja Goiás FA

Este documento reúne tudo que já foi construído, testado e aprendido no projeto anterior
(site institucional do Goiás FA, em Angular + Express), pra servir de base pro sistema novo,
independente, feito do zero em Next.js. A ideia é não perder nenhum conhecimento já validado
com dinheiro e API reais.

## O negócio, em poucas palavras

O time não vende de estoque fixo. O modelo é **venda por lote**: abre um período de pedidos
com prazo definido, fecha, manda a lista consolidada pra confecção, produz, entrega. Isso muda
a arquitetura de uma loja "normal": não existe controle de estoque por unidade, existe uma
**data limite de vendas** que precisa ser configurável e checada no servidor (nunca só escondida
no front-end).

## Catálogo atual (dados reais)

| Produto | Preço | Tamanhos | Cor | Personalização |
|---|---|---|---|---|
| Jersey Torcedor F.A. | R$ 155,00 | PP, P, M, G, GG, XG, EXG, EXGG | — | Nome (opcional, até 20 caracteres) e número (opcional, até 3 dígitos) |
| Regata Flag | R$ 85,00 | PP, P, M, G, GG, XG, EXG, EXGG | Branca ou Verde (obrigatório escolher) | Nome (opcional) e número (opcional) |

As duas fotos usadas (`imagens-produtos/jersey_torcedor.jpg` e `jersey_flag.jpg`) são artes de
divulgação completas (com texto e logo), não fotos isoladas do produto — servem de placeholder
até ter fotos de produto de verdade.

**Regra de negócio importante sobre a Regata Flag**: existe um único produto com um seletor de
cor (branca/verde), não dois produtos separados. Cada combinação de tamanho + cor + nome +
número vira uma unidade própria no pedido (ver seção de carrinho abaixo).

**Frete**: sempre por conta do comprador. Isso precisa aparecer com destaque no carrinho e na
tela de pagamento, antes de fechar a compra.

## Regras de personalização e carrinho

- Tamanho é **obrigatório** quando o produto tem tamanhos.
- Cor é **obrigatória** quando o produto tem mais de uma cor.
- Nome e número são **opcionais**.
- Cada unidade personalizada (uma combinação específica de tamanho/cor/nome/número) é um item
  de carrinho próprio, com quantidade travada em 1 — nunca mesclar duas jerseys iguais com nomes
  diferentes num único item de quantidade 2. Isso é crítico pro resumo de produção fazer sentido
  (ver abaixo).

## Painel administrativo necessário

Três telas, essenciais pro time operar sem precisar mexer em código ou banco direto:

1. **Pedidos** — lista tudo que foi vendido, com filtro por status e exportação em CSV.
2. **Configuração da loja** — data limite do lote atual (com fechamento automático de vendas
   quando o prazo vence) e mensagem exibida depois de encerrado.
3. **Resumo de produção** — o relatório que vai pra confecção: quantidade agrupada por
   produto + cor + tamanho, mais a lista individual de nome/número de cada peça personalizada.
   Isso só funciona certo se o carrinho nunca mesclar itens personalizados diferentes (ver acima).

## Pagamento — o que já foi validado

- Gateway usado: **Mercado Pago**, conta oficial do time, CNPJ `27.397.752/0001-94`
  (Associação Atlética de Futebol Americano) — verificado via `GET /users/me`.
- Testado de ponta a ponta em modo de teste **e** em produção: Pix, boleto e cartão de crédito
  (com parcelamento real, juros calculados pelo próprio Mercado Pago via `getInstallments`).
- O servidor **nunca** confia no preço que vem do navegador — sempre recalcula o total a partir
  do catálogo que mora no próprio servidor. Isso é inegociável na versão nova também.
- Confirmação automática via webhook: ao pagar Pix/boleto, o Mercado Pago avisa o servidor, que
  atualiza o pedido e dispara e-mail de confirmação sozinho, sem intervenção manual.

### Pegadinha real que já mordeu a gente: Pix "não cadastrado"

Depois de trocar pra credenciais de produção, todo pedido de Pix falhava com
`processing_error` (nenhum dinheiro se movia). A causa **não era código** — era que a conta do
Mercado Pago simplesmente não tinha o Pix ativo ainda (confirmado consultando
`GET /v1/payment_methods` com o token: `pix` não aparecia na lista de métodos habilitados).
Assim que uma chave Pix aleatória foi cadastrada na conta, o Pix passou a funcionar
normalmente. **Lição**: antes de testar Pix numa conta nova, confirmar que ela tem uma chave Pix
cadastrada — senão o erro parece um bug de integração e não é.

### Outras pegadinhas já resolvidas

- **Assinatura do webhook**: o Mercado Pago manda o header `x-signature` no formato
  `ts=...,v1=...`. A validação é HMAC-SHA256 do texto `id:{data.id};request-id:{x-request-id};ts:{ts};`
  usando o segredo gerado ao cadastrar a URL do webhook no painel, comparado ao valor `v1`.
- **Tokenização de cartão exige HTTPS**: o SDK do Mercado Pago recusa gerar o token do cartão
  se a página não estiver em conexão segura, mesmo em `localhost` durante desenvolvimento.
- **Boleto**: o endereço do pagador usa o campo `state` (não `federal_unit`, que é da API
  clássica antiga).
- Cartão de teste que realmente funciona no ambiente de teste do Mercado Pago:
  `5480 8328 0103 3311`, CVV `123`, validade `11/30` (Mastercard). Vale reconfirmar na
  documentação oficial antes de reusar, credenciais de teste podem mudar o catálogo de cartões.

## Modelo de dados (equivalente ao que existia em JSON, agora pensado pra Postgres/Prisma)

```
Produto
  id, nome, descricao, precoCents, imagemUrl, categoria
  tamanhos: string[] | null       // ex: ["PP","P","M","G","GG","XG","EXG","EXGG"]
  cores: string[] | null          // ex: ["Branca","Verde"]
  permitePersonalizacao: boolean

Pedido
  id, mercadopagoOrderId
  cliente: { nome, cpf, email, telefone }
  endereco: { cep, address, number, complement, neighborhood, city, state }
  itens: ItemPedido[]
  valorTotalCents, metodoPagamento, parcelas
  statusPedido: 'aguardando_pix' | 'aguardando_boleto' | 'pago' | 'recusado' | 'processando'
  dataCriacao, dataPagamento

ItemPedido
  produtoId, nome, quantidade (sempre 1 quando personalizado), precoUnitarioCents
  tamanho, cor, nomePersonalizado, numeroPersonalizado

ConfiguracaoLoja
  vendasAbertas: boolean
  dataLimite: datetime | null
  mensagemEncerramento: string
```

## Credenciais Mercado Pago já em uso (produção)

Reaproveitadas no `.env` desta pasta (`.env`) — mesma conta, não precisa gerar nada novo pra
começar a testar o sistema novo. Se decidirem separar contas/aplicações Mercado Pago no futuro,
é só trocar os valores.
