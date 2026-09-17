import Image from "next/image";
import { CartProvider } from "@/components/CartContext";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Header />
      <main className="min-h-[calc(100vh-73px)]">
        <PageTransition>{children}</PageTransition>
      </main>
      <footer className="border-t border-forest-700 bg-forest-800 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <Image
              src="/marca/logo-branca.png"
              alt="Escudo Goiás F.A."
              width={28}
              height={31}
              className="h-7 w-auto opacity-80"
            />
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-chalk/70">
              Goiás F.A. Futebol Americano
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 text-xs text-chalk/50 sm:items-end">
            <p>Pagamentos processados pelo Mercado Pago.</p>
          </div>
        </div>
      </footer>
    </CartProvider>
  );
}
