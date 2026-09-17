import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const produtos = await prisma.produto.findMany({ orderBy: { id: "asc" } });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
          Produtos
        </h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-md bg-forest-700 px-4 py-2 font-heading text-sm font-bold uppercase tracking-wide text-white transition hover:bg-forest-800"
        >
          Novo produto
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Produto</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Tamanhos</th>
              <th className="p-3">Cores</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id} className="border-b border-slate-100">
                <td className="p-3 font-medium">{produto.nome}</td>
                <td className="p-3 text-slate-500">{produto.categoria}</td>
                <td className="p-3">{formatCents(produto.precoCents)}</td>
                <td className="p-3 text-slate-500">
                  {produto.tamanhos.join(", ") || "-"}
                </td>
                <td className="p-3 text-slate-500">
                  {produto.cores.join(", ") || "-"}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      produto.ativo
                        ? "bg-pitch-50 text-forest-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {produto.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/produtos/${produto.id}`}
                    className="text-sm font-medium text-forest-700 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {produtos.length === 0 && (
          <p className="p-6 text-center text-slate-500">Nenhum produto cadastrado.</p>
        )}
      </div>
    </div>
  );
}
