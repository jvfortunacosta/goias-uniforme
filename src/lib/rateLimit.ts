import { NextRequest } from "next/server";

const janelas = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
}

/**
 * Limitador em memória por IP. Não é perfeito em ambiente serverless (cada
 * instância fria começa do zero), mas já eleva bastante o custo de um ataque
 * automatizado de força bruta/enumeração sem precisar de infraestrutura extra.
 */
export function limitarPorIp(
  req: NextRequest,
  chave: string,
  limite: number,
  janelaMs: number
): boolean {
  const id = `${chave}:${clientIp(req)}`;
  const agora = Date.now();
  const tentativas = (janelas.get(id) ?? []).filter((t) => agora - t < janelaMs);

  if (tentativas.length >= limite) {
    janelas.set(id, tentativas);
    return false;
  }

  tentativas.push(agora);
  janelas.set(id, tentativas);
  return true;
}
