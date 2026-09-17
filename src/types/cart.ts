export type CartItem = {
  itemId: string;
  produtoId: number;
  nomeProduto: string;
  imagemUrl: string;
  precoUnitarioCents: number;
  tamanho: string | null;
  cor: string | null;
  nomePersonalizado: string | null;
  numeroPersonalizado: string | null;
};
