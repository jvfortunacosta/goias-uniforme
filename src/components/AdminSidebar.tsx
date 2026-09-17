"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";

const LINKS = [
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/producao", label: "Resumo de produção" },
  { href: "/admin/config", label: "Configuração da loja" },
  { divisor: true },
  { href: "/admin/seletiva", label: "Seletiva" },
  { href: "/admin/noticias", label: "Notícias" },
  { href: "/admin/videos", label: "Vídeos" },
  { href: "/admin/agenda", label: "Agenda" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="flex items-center gap-3 bg-forest-800 px-4 py-3">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          className="relative h-9 w-9 shrink-0 rounded-md border border-forest-500 text-chalk transition-colors duration-200 hover:border-pitch"
        >
          <span
            className={`absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 bg-current transition-all duration-300 ease-out ${
              aberto ? "-translate-y-1/2 rotate-45" : "-translate-y-[5px] rotate-0"
            }`}
          />
          <span
            className={`absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 bg-current transition-all duration-300 ease-out ${
              aberto ? "opacity-0" : "-translate-y-1/2 opacity-100"
            }`}
          />
          <span
            className={`absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 bg-current transition-all duration-300 ease-out ${
              aberto ? "-translate-y-1/2 -rotate-45" : "translate-y-[4px] rotate-0"
            }`}
          />
        </button>
        <Link href="/admin/pedidos" className="flex items-center gap-2">
          <Image
            src="/marca/logo-branca.png"
            alt="Escudo Goiás F.A."
            width={28}
            height={31}
            className="h-7 w-auto"
          />
          <span className="font-heading text-xs font-bold uppercase tracking-widest text-chalk">
            Admin
          </span>
        </Link>
      </div>

      <div
        onClick={() => setAberto(false)}
        className={`fixed inset-0 z-30 bg-ink/50 transition-opacity duration-300 ${
          aberto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-forest-800 transition-transform duration-300 ease-in-out ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-4">
          <Image
            src="/marca/logo-branca.png"
            alt="Escudo Goiás F.A."
            width={28}
            height={31}
            className="h-7 w-auto"
          />
          <span className="font-heading text-xs font-bold uppercase tracking-widest text-chalk">
            Admin
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          {LINKS.map((link, i) =>
            "divisor" in link ? (
              <div key={i} className="my-2 h-px bg-forest-600" />
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  pathname.startsWith(link.href)
                    ? "bg-forest-700 text-pitch"
                    : "text-chalk/70 hover:bg-forest-700 hover:text-pitch"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="border-t border-forest-700 px-3 py-4">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
