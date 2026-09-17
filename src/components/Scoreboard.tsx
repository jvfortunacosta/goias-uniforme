"use client";

import { useEffect, useState } from "react";

function calcularRestante(alvo: Date) {
  const diffMs = alvo.getTime() - Date.now();
  if (diffMs <= 0) return null;
  const totalSegundos = Math.floor(diffMs / 1000);
  return {
    dias: Math.floor(totalSegundos / 86400),
    horas: Math.floor((totalSegundos % 86400) / 3600),
    minutos: Math.floor((totalSegundos % 3600) / 60),
    segundos: totalSegundos % 60,
  };
}

function Digito({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-md bg-ink px-3 py-2 font-display text-3xl tabular-nums text-pitch shadow-glow-sm sm:text-4xl">
        {String(valor).padStart(2, "0")}
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-chalk/60">
        {label}
      </span>
    </div>
  );
}

export function Scoreboard({
  dataLimite,
  aberto,
  mensagemEncerramento,
}: {
  dataLimite: string | null;
  aberto: boolean;
  mensagemEncerramento: string;
}) {
  const alvo = dataLimite ? new Date(dataLimite) : null;
  const [restante, setRestante] = useState(() => (alvo ? calcularRestante(alvo) : null));

  useEffect(() => {
    if (!alvo) return;
    const intervalo = setInterval(() => setRestante(calcularRestante(alvo)), 1000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLimite]);

  if (!aberto || (alvo && !restante)) {
    return (
      <div className="rounded-lg border border-forest-700 bg-forest-800 px-5 py-4 text-chalk">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-pitch">
          Vendas encerradas
        </p>
        <p className="mt-1 text-sm text-chalk/80">{mensagemEncerramento}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-forest-700 bg-forest-800 px-5 py-4">
      <p className="font-heading text-xs font-bold uppercase tracking-widest text-pitch">
        Pedidos abertos
      </p>
      {restante ? (
        <>
          <p className="mt-1 mb-3 text-sm text-chalk/70">Encerra em</p>
          <div className="flex gap-2 sm:gap-3">
            <Digito valor={restante.dias} label="dias" />
            <Digito valor={restante.horas} label="hrs" />
            <Digito valor={restante.minutos} label="min" />
            <Digito valor={restante.segundos} label="seg" />
          </div>
        </>
      ) : (
        <p className="mt-1 text-sm text-chalk/80">
          Sem data limite definida no momento.
        </p>
      )}
    </div>
  );
}
