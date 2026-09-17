type ProdutoParaFrete = {
  pesoGramas: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  valorCents: number;
};

export type OpcaoFrete = {
  servico: string;
  valorCents: number;
  prazoDias: number | null;
};

type OpcaoMelhorEnvio = {
  price?: string;
  delivery_time?: number;
  name?: string;
  error?: string;
  company?: { name?: string };
};

const BASE_URL =
  process.env.MELHOR_ENVIO_SANDBOX === "true"
    ? "https://sandbox.melhorenvio.com.br/api/v2"
    : "https://melhorenvio.com.br/api/v2";

export async function calcularFrete(
  cepDestino: string,
  produtos: ProdutoParaFrete[]
): Promise<OpcaoFrete | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const cepOrigem = process.env.CEP_ORIGEM;
  if (!token || !cepOrigem || produtos.length === 0) return null;

  const res = await fetch(`${BASE_URL}/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Loja Goias FA (contato@goiasfa.com.br)",
    },
    body: JSON.stringify({
      from: { postal_code: cepOrigem.replace(/\D/g, "") },
      to: { postal_code: cepDestino.replace(/\D/g, "") },
      products: produtos.map((p, i) => ({
        id: String(i),
        width: p.larguraCm,
        height: p.alturaCm,
        length: p.comprimentoCm,
        weight: p.pesoGramas / 1000,
        insurance_value: p.valorCents / 100,
        quantity: 1,
      })),
    }),
  });

  if (!res.ok) return null;

  const data: OpcaoMelhorEnvio[] = await res.json().catch(() => null);
  if (!Array.isArray(data)) return null;

  const validas = data.filter((o) => o.price && !o.error);
  if (validas.length === 0) return null;

  const maisBarata = validas.reduce((min, atual) =>
    parseFloat(atual.price!) < parseFloat(min.price!) ? atual : min
  );

  return {
    servico: [maisBarata.company?.name, maisBarata.name]
      .filter(Boolean)
      .join(" "),
    valorCents: Math.round(parseFloat(maisBarata.price!) * 100),
    prazoDias: maisBarata.delivery_time ?? null,
  };
}
