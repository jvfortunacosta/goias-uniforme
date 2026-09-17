import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProducaoPage() {
  const itens = await prisma.itemPedido.findMany({
    where: { pedido: { statusPedido: "pago" } },
    include: { pedido: true },
  });

  const agrupado = new Map<
    string,
    { nomeProduto: string; cor: string; tamanho: string; quantidade: number }
  >();

  for (const item of itens) {
    const chave = `${item.nomeProduto}__${item.cor ?? "-"}__${item.tamanho ?? "-"}`;
    const atual = agrupado.get(chave);
    if (atual) {
      atual.quantidade += 1;
    } else {
      agrupado.set(chave, {
        nomeProduto: item.nomeProduto,
        cor: item.cor ?? "-",
        tamanho: item.tamanho ?? "-",
        quantidade: 1,
      });
    }
  }

  const resumo = [...agrupado.values()].sort((a, b) =>
    a.nomeProduto === b.nomeProduto
      ? a.tamanho.localeCompare(b.tamanho)
      : a.nomeProduto.localeCompare(b.nomeProduto)
  );

  const personalizados = itens
    .filter((i) => i.nomePersonalizado || i.numeroPersonalizado)
    .sort((a, b) => a.nomeProduto.localeCompare(b.nomeProduto));

  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Resumo de produção
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Baseado apenas em pedidos com pagamento confirmado.
      </p>

      <div className="mb-8 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Produto</th>
              <th className="p-3">Cor</th>
              <th className="p-3">Tamanho</th>
              <th className="p-3">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {resumo.map((linha, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="p-3">{linha.nomeProduto}</td>
                <td className="p-3">{linha.cor}</td>
                <td className="p-3">{linha.tamanho}</td>
                <td className="p-3 font-medium">{linha.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {resumo.length === 0 && (
          <p className="p-6 text-center text-slate-500">
            Nenhum pedido pago ainda.
          </p>
        )}
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold uppercase tracking-wide text-forest-700">
        Peças personalizadas
      </h2>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Produto</th>
              <th className="p-3">Cor</th>
              <th className="p-3">Tamanho</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Número</th>
              <th className="p-3">Pedido</th>
            </tr>
          </thead>
          <tbody>
            {personalizados.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="p-3">{item.nomeProduto}</td>
                <td className="p-3">{item.cor ?? "-"}</td>
                <td className="p-3">{item.tamanho ?? "-"}</td>
                <td className="p-3">{item.nomePersonalizado ?? "-"}</td>
                <td className="p-3">{item.numeroPersonalizado ?? "-"}</td>
                <td className="p-3 text-xs text-slate-400">
                  #{item.pedidoId.slice(0, 8)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {personalizados.length === 0 && (
          <p className="p-6 text-center text-slate-500">
            Nenhuma peça personalizada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
