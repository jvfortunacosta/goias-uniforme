export const TAMANHOS_MASCULINO = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "XG",
  "EXG",
  "EXGG",
] as const;

export const TAMANHOS_FEMININO = ["PPF", "PF", "MF", "GF", "GGF", "XGF"] as const;

export const ORDEM_TAMANHOS = [...TAMANHOS_MASCULINO, ...TAMANHOS_FEMININO] as const;

export const STATUS_LABELS: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  aguardando_pix: "Aguardando pagamento (Pix)",
  processando: "Processando pagamento",
  pago: "Pago",
  recusado: "Recusado",
};
