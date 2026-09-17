"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type VideoFormData = {
  id?: string;
  titulo: string;
  youtubeUrl: string;
  ordem: number;
  ativo: boolean;
};

const VAZIO: VideoFormData = { titulo: "", youtubeUrl: "", ordem: 0, ativo: true };

export function VideoAdminForm({ videoInicial }: { videoInicial?: VideoFormData }) {
  const router = useRouter();
  const editando = Boolean(videoInicial?.id);

  const [form, setForm] = useState<VideoFormData>(videoInicial ?? VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!form.titulo.trim() || !form.youtubeUrl.trim()) {
      setErro("Preencha o título e o link do vídeo.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(
        editando ? `/api/admin/videos/${videoInicial!.id}` : "/api/admin/videos",
        {
          method: editando ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível salvar o vídeo.");
        setEnviando(false);
        return;
      }
      router.push("/admin/videos");
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Título</label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          value={form.titulo}
          onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Link ou ID do YouTube</label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          placeholder="https://www.youtube.com/watch?v=..."
          value={form.youtubeUrl}
          onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Ordem de exibição</label>
        <input
          type="number"
          className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          value={form.ordem}
          onChange={(e) => setForm((f) => ({ ...f, ordem: Number(e.target.value) }))}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.ativo}
          onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
        />
        Ativo (visível no site)
      </label>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-forest-700 px-5 py-2.5 font-heading text-sm font-bold uppercase tracking-wide text-white transition hover:bg-forest-800 disabled:opacity-50"
      >
        {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar vídeo"}
      </button>
    </form>
  );
}
