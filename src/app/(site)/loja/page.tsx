import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getConfiguracaoLoja, vendasEstaoAbertas } from "@/lib/loja";
import { formatCents } from "@/lib/format";
import { Scoreboard } from "@/components/Scoreboard";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const [produtos, config] = await Promise.all([
    prisma.produto.findMany({
      where: { ativo: true },
      orderBy: { id: "asc" },
    }),
    getConfiguracaoLoja(),
  ]);

  const aberto = vendasEstaoAbertas(config);

  return (
    <div>
      <section className="relative overflow-hidden bg-forest-800">
        <div className="absolute inset-0 bg-hash-lines opacity-60" />
        <Image
          src="/marca/logo-verde.png"
          alt=""
          width={640}
          height={708}
          className="pointer-events-none absolute -right-24 -top-16 h-[420px] w-auto opacity-[0.08] sm:h-[520px]"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-pitch">
            Lote 2026
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] text-chalk sm:text-7xl">
            Uniforme
            <br />
            Oficial
          </h1>
          <p className="mt-4 max-w-md text-chalk/70">
            Vista as cores do Goiás F.A. Os pedidos são feitos em lotes.
          </p>

          <div className="mt-6 max-w-md rounded-xl border border-pitch/40 bg-pitch/10 p-4">
            <p className="font-heading text-xs font-bold uppercase tracking-widest text-pitch">
              O que significa &ldquo;pedido em lote&rdquo;?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-chalk/80">
              Pedidos feitos em lote são agrupados com outros pedidos e
              processados/enviados juntos, em datas específicas, em vez de
              individualmente e de forma imediata. Esse modelo ajuda a
              otimizar produção e frete, mas pode fazer com que o prazo de
              entrega seja um pouco maior, já que seu pedido aguarda o
              fechamento do lote antes de seguir para envio.
            </p>
          </div>

          <div className="mt-8 max-w-sm">
            <Scoreboard
              dataLimite={config.dataLimite?.toISOString() ?? null}
              aberto={aberto}
              mensagemEncerramento={config.mensagemEncerramento}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-forest-700">
          Catálogo
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {produtos.map((produto) => (
            <Link
              key={produto.id}
              href={`/produtos/${produto.id}`}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-forest-500 hover:shadow-lg"
            >
              <div className="mx-auto flex w-fit justify-center overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={produto.imagemUrl}
                  alt={produto.nome}
                  className="max-h-96 w-auto object-contain transition group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <h3 className="font-heading font-bold uppercase tracking-wide">
                  {produto.nome}
                </h3>
                <p className="font-display text-2xl text-forest-700">
                  {formatCents(produto.precoCents)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {produtos.length === 0 && (
          <p className="mt-6 text-slate-500">Nenhum produto disponível no momento.</p>
        )}
      </section>
    </div>
  );
}
