"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TAMANHOS_MASCULINO, TAMANHOS_FEMININO } from "@/lib/constants";
import { ImageUploadField } from "@/components/ImageUploadField";

export type ProdutoFormData = {
  id?: number;
  nome: string;
  descricao: string;
  precoCents: number;
  imagemUrl: string;
  categoria: string;
  tamanhos: string[];
  cores: string[];
  permitePersonalizacao: boolean;
  ativo: boolean;
  pesoGramas: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
};

const VAZIO: ProdutoFormData = {
  nome: "",
  descricao: "",
  precoCents: 0,
  imagemUrl: "",
  categoria: "",
  tamanhos: [],
  cores: [],
  permitePersonalizacao: false,
  ativo: true,
  pesoGramas: 300,
  alturaCm: 3,
  larguraCm: 25,
  comprimentoCm: 32,
};

export function ProdutoAdminForm({
  produtoInicial,
}: {
  produtoInicial?: ProdutoFormData;
}) {
  const router = useRouter();
  const editando = Boolean(produtoInicial?.id);

  const [form, setForm] = useState<ProdutoFormData>(produtoInicial ?? VAZIO);
  const [precoTexto, setPrecoTexto] = useState(
    produtoInicial ? (produtoInicial.precoCents / 100).toFixed(2).replace(".", ",") : ""
  );
  const [coresTexto, setCoresTexto] = useState((produtoInicial?.cores ?? []).join(", "));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function toggleTamanho(t: string) {
    setForm((f) => ({
      ...f,
      tamanhos: f.tamanhos.includes(t)
        ? f.tamanhos.filter((x) => x !== t)
        : [...f.tamanhos, t],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    const precoCents = Math.round(
      parseFloat(precoTexto.replace(".", "").replace(",", ".")) * 100
    );
    if (!precoTexto || isNaN(precoCents) || precoCents < 0) {
      setErro("Preço inválido.");
      return;
    }
    if (!form.imagemUrl) {
      setErro("Envie uma imagem do produto.");
      return;
    }

    const payload = {
      ...form,
      precoCents,
      cores: coresTexto
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    };

    setEnviando(true);
    try {
      const res = await fetch(
        editando ? `/api/admin/produtos/${produtoInicial!.id}` : "/api/admin/produtos",
        {
          method: editando ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível salvar o produto.");
        setEnviando(false);
        return;
      }
      router.push("/admin/produtos");
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Nome</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Categoria</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={form.categoria}
            onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
            placeholder="Ex: jersey"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descrição</label>
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
          rows={3}
          value={form.descricao}
          onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Preço (R$)</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={precoTexto}
            onChange={(e) => setPrecoTexto(e.target.value)}
            placeholder="155,00"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Cores (separadas por vírgula)</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={coresTexto}
            onChange={(e) => setCoresTexto(e.target.value)}
            placeholder="Branca, Verde"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Tamanhos disponíveis · Masculino</label>
        <div className="flex flex-wrap gap-2">
          {TAMANHOS_MASCULINO.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => toggleTamanho(t)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                form.tamanhos.includes(t)
                  ? "border-forest-700 bg-forest-700 text-white"
                  : "border-slate-300 hover:border-forest-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Tamanhos disponíveis · Feminino</label>
        <div className="flex flex-wrap gap-2">
          {TAMANHOS_FEMININO.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => toggleTamanho(t)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                form.tamanhos.includes(t)
                  ? "border-forest-700 bg-forest-700 text-white"
                  : "border-slate-300 hover:border-forest-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Peso (g)</label>
          <input
            type="number"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={form.pesoGramas}
            onChange={(e) => setForm((f) => ({ ...f, pesoGramas: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Altura (cm)</label>
          <input
            type="number"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={form.alturaCm}
            onChange={(e) => setForm((f) => ({ ...f, alturaCm: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Largura (cm)</label>
          <input
            type="number"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={form.larguraCm}
            onChange={(e) => setForm((f) => ({ ...f, larguraCm: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Comprimento (cm)</label>
          <input
            type="number"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            value={form.comprimentoCm}
            onChange={(e) => setForm((f) => ({ ...f, comprimentoCm: Number(e.target.value) }))}
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        Peso e dimensões da unidade embalada, usados pro cálculo automático de frete.
      </p>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.permitePersonalizacao}
            onChange={(e) =>
              setForm((f) => ({ ...f, permitePersonalizacao: e.target.checked }))
            }
          />
          Permite nome e número personalizados
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
          />
          Ativo (visível na loja)
        </label>
      </div>

      <ImageUploadField
        label="Imagem"
        value={form.imagemUrl}
        onChange={(url) => setForm((f) => ({ ...f, imagemUrl: url }))}
        required
      />

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-forest-700 px-5 py-2.5 font-heading font-bold uppercase tracking-wide text-white transition hover:bg-forest-800 disabled:opacity-50"
      >
        {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Criar produto"}
      </button>
    </form>
  );
}
