"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/agenda", label: "Agenda" },
  { href: "/seletiva", label: "Seletiva" },
  { href: "/loja", label: "Loja" },
];

export function Header() {
  const { itens } = useCart();
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-forest-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/marca/logo-branca.png"
            alt="Escudo Goiás F.A."
            width={40}
            height={44}
            className="h-10 w-auto"
            priority
          />
          <span className="font-heading text-sm font-bold uppercase tracking-widest text-chalk">
            Goiás F.A.
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const ativo =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  ativo ? "text-pitch" : "text-chalk/70 hover:text-pitch"
                }`}
              >
                {link.label}
                <span
                  className={`pointer-events-none absolute inset-x-3 -bottom-0.5 h-0.5 origin-center scale-x-0 bg-pitch transition-transform duration-300 ease-out ${
                    ativo ? "scale-x-100" : "group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/meus-pedidos"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-chalk/70 transition-colors duration-200 hover:text-pitch lg:block"
          >
            Meus pedidos
          </Link>
          <Link
            href="/carrinho"
            className="relative rounded-full border border-forest-500 px-4 py-2 text-sm font-medium text-chalk transition-colors duration-200 hover:border-pitch hover:text-pitch"
          >
            Carrinho
            {itens.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-pitch text-xs font-bold text-forest-900">
                {itens.length}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            className="relative h-9 w-9 rounded-md border border-forest-500 text-chalk transition-colors duration-200 hover:border-pitch md:hidden"
          >
            <span
              className={`absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 bg-current transition-all duration-300 ease-out ${
                menuAberto ? "-translate-y-1/2 rotate-45" : "-translate-y-[5px] rotate-0"
              }`}
            />
            <span
              className={`absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 bg-current transition-all duration-300 ease-out ${
                menuAberto ? "opacity-0" : "-translate-y-1/2 opacity-100"
              }`}
            />
            <span
              className={`absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 bg-current transition-all duration-300 ease-out ${
                menuAberto ? "-translate-y-1/2 -rotate-45" : "translate-y-[4px] rotate-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out md:hidden ${
          menuAberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-1 border-t border-forest-700 px-4 py-3">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuAberto(false)}
                style={{ transitionDelay: menuAberto ? `${i * 40}ms` : "0ms" }}
                className={`rounded-md px-3 py-2 text-sm font-medium text-chalk/80 transition-all duration-300 ease-out hover:bg-forest-700 hover:text-pitch ${
                  menuAberto ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/meus-pedidos"
              onClick={() => setMenuAberto(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-chalk/80 transition-colors duration-200 hover:bg-forest-700 hover:text-pitch"
            >
              Meus pedidos
            </Link>
          </nav>
        </div>
      </div>

      <div className="h-[3px] bg-hash-lines bg-forest-700" />
    </header>
  );
}
