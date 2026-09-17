import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JogoAdminForm } from "@/components/JogoAdminForm";
import { toDatetimeLocalValue } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditarJogoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jogo = await prisma.jogo.findUnique({ where: { id } });

  if (!jogo) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Editar jogo
      </h1>
      <JogoAdminForm
        jogoInicial={{
          id: jogo.id,
          temporada: jogo.temporada,
          adversario: jogo.adversario,
          dataHora: toDatetimeLocalValue(jogo.dataHora),
          local: jogo.local,
          mandante: jogo.mandante,
          golsPro: jogo.golsPro,
          golsContra: jogo.golsContra,
          ativo: jogo.ativo,
        }}
      />
    </div>
  );
}
