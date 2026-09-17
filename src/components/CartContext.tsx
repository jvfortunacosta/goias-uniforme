"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { CartItem } from "@/types/cart";

const STORAGE_KEY = "goiasfa_carrinho";

type CartContextValue = {
  itens: CartItem[];
  adicionar: (item: Omit<CartItem, "itemId">) => void;
  remover: (itemId: string) => void;
  limpar: () => void;
  totalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItens(JSON.parse(raw));
    } catch {
      // ignora carrinho corrompido
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
  }, [itens, carregado]);

  const adicionar = useCallback((item: Omit<CartItem, "itemId">) => {
    const itemId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    setItens((prev) => [...prev, { ...item, itemId }]);
  }, []);

  const remover = useCallback((itemId: string) => {
    setItens((prev) => prev.filter((i) => i.itemId !== itemId));
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const totalCents = itens.reduce((sum, i) => sum + i.precoUnitarioCents, 0);

  return (
    <CartContext.Provider
      value={{ itens, adicionar, remover, limpar, totalCents }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de CartProvider");
  return ctx;
}
