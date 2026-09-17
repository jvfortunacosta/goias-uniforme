import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProdutoAdminForm } from "@/components/ProdutoAdminForm";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produto = await prisma.produto.findUnique({ where: { id: Number(id) } });

  if (!produto) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Editar produto
      </h1>
      <ProdutoAdminForm produtoInicial={produto} />
    </div>
  );
}
