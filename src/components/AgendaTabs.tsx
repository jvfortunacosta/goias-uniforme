"use client";

import { useState } from "react";
import type { Jogo } from "@prisma/client";
import { formatDataHora } from "@/lib/format";

const TEMPORADAS = ["2026", "2025"];

export function AgendaTabs({ jogos }: { jogos: Jogo[] }) {
  const [temporada, setTemporada] = useState(TEMPORADAS[0]);

  const jogosDaTemporada = jogos.filter((j) => j.temporada === temporada);

  return (
    <div className="mt-6">
      <div className="flex gap-2 border-b border-slate-200">
        {TEMPORADAS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTemporada(t)}
            className={`px-4 py-2 font-heading text-sm font-bold uppercase tracking-wide transition ${
              temporada === t
                ? "border-b-2 border-forest-700 text-forest-800"
                : "text-slate-400 hover:text-forest-600"
            }`}
          >
            Temporada {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {jogosDaTemporada.length === 0 ? (
          <p className="text-slate-500">Nenhum jogo agendado no momento.</p>
        ) : (
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {jogosDaTemporada.map((jogo) => (
              <div
                key={jogo.id}
                className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-heading font-bold uppercase tracking-wide text-forest-800">
                    Goiás F.A. {jogo.mandante ? "x" : "@"} {jogo.adversario}
                  </p>
                  <p className="text-sm text-slate-500">{jogo.local}</p>
                  {jogo.golsPro !== null && jogo.golsContra !== null && (
                    <p className="text-sm font-medium text-forest-700">
                      Resultado: {jogo.golsPro} x {jogo.golsContra}
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-600">
                  {formatDataHora(jogo.dataHora)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
