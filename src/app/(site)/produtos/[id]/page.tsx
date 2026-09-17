import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getConfiguracaoLoja, vendasEstaoAbertas } from "@/lib/loja";
import { formatCents } from "@/lib/format";
import { ProdutoForm } from "@/components/ProdutoForm";

export const dynamic = "force-dynamic";

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produtoId = Number(id);
  if (!Number.isInteger(produtoId)) notFound();

  const [produto, config] = await Promise.all([
    prisma.produto.findUnique({ where: { id: produtoId } }),
    getConfiguracaoLoja(),
  ]);

  if (!produto || !produto.ativo) notFound();

  const aberto = vendasEstaoAbertas(config);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="mx-auto flex w-fit justify-center overflow-hidden rounded-xl bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={produto.imagemUrl}
            alt={produto.nome}
            className="max-h-[560px] w-auto object-contain"
          />
        </div>

        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide">
            {produto.nome}
          </h1>
          <p className="mt-2 font-display text-3xl text-forest-700">
            {formatCents(produto.precoCents)}
          </p>
          <p className="mt-4 text-slate-600">{produto.descricao}</p>
          <p className="mt-2 text-sm text-slate-500">
            Frete por conta do comprador.
          </p>

          {!aberto ? (
            <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
              {config.mensagemEncerramento}
            </div>
          ) : (
            <ProdutoForm produto={produto} />
          )}
        </div>
      </div>
    </div>
  );
}
