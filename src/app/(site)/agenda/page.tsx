import { prisma } from "@/lib/prisma";
import { AgendaTabs } from "@/components/AgendaTabs";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const jogos = await prisma.jogo.findMany({
    where: { ativo: true },
    orderBy: { dataHora: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Agenda
      </h1>
      <p className="mt-1 text-slate-500">Jogos e resultados do Goiás F.A.</p>

      <AgendaTabs jogos={jogos} />
    </div>
  );
}
