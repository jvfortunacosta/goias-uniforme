"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "@/components/ImageUploadField";

export type NoticiaFormData = {
  id?: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  imagemUrl: string | null;
  ativo: boolean;
  publicadoEm: string;
};

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

const VAZIO: NoticiaFormData = {
  titulo: "",
  resumo: "",
  conteudo: "",
  imagemUrl: "",
  ativo: false,
  publicadoEm: hojeISO(),
};

export function NoticiaAdminForm({ noticiaInicial }: { noticiaInicial?: NoticiaFormData }) {
  const router = useRouter();
  const editando = Boolean(noticiaInicial?.id);

  const [form, setForm] = useState<NoticiaFormData>(
    noticiaInicial
      ? { ...noticiaInicial, publicadoEm: noticiaInicial.publicadoEm.slice(0, 10) }
      : VAZIO
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!form.titulo.trim() || !form.resumo.trim() || !form.conteudo.trim()) {
      setErro("Preencha título, resumo e conteúdo.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(
        editando ? `/api/admin/noticias/${noticiaInicial!.id}` : "/api/admin/noticias",
        {
          method: editando ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível salvar a notícia.");
        setEnviando(false);
        return;
      }
      router.push("/admin/noticias");
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Título</label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          value={form.titulo}
          onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Resumo</label>
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          rows={2}
          value={form.resumo}
          onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Conteúdo</label>
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          rows={8}
          value={form.conteudo}
          onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Data de publicação</label>
        <input
          type="date"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          value={form.publicadoEm}
          onChange={(e) => setForm((f) => ({ ...f, publicadoEm: e.target.value }))}
        />
      </div>

      <ImageUploadField
        label="Imagem (opcional)"
        value={form.imagemUrl}
        onChange={(url) => setForm((f) => ({ ...f, imagemUrl: url }))}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.ativo}
          onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
        />
        Publicada (visível no site)
      </label>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-forest-700 px-5 py-2.5 font-heading text-sm font-bold uppercase tracking-wide text-white transition hover:bg-forest-800 disabled:opacity-50"
      >
        {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Criar notícia"}
      </button>
    </form>
  );
}
