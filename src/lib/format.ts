type ItemDescricaoInput = {
  nomeProduto: string;
  tamanho: string | null;
  cor: string | null;
  nomePersonalizado: string | null;
  numeroPersonalizado: string | null;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function itemDescricao(item: ItemDescricaoInput): string {
  return [
    item.nomeProduto,
    item.tamanho && `Tamanho ${item.tamanho}`,
    item.cor && `Cor ${item.cor}`,
    item.nomePersonalizado && `Nome "${item.nomePersonalizado}"`,
    item.numeroPersonalizado && `Número ${item.numeroPersonalizado}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDataHora(data: Date): string {
  return data.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function toDatetimeLocalValue(data: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(data);
  const get = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function extrairYoutubeId(input: string): string | null {
  const valor = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(valor)) return valor;

  const padroes = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const padrao of padroes) {
    const match = valor.match(padrao);
    if (match) return match[1];
  }
  return null;
}

export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calcCheckDigit = (base: string) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * (base.length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const d1 = calcCheckDigit(digits.slice(0, 9));
  const d2 = calcCheckDigit(digits.slice(0, 10));

  return d1 === parseInt(digits[9], 10) && d2 === parseInt(digits[10], 10);
}
