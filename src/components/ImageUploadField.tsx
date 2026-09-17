"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function ImageUploadField({
  label = "Imagem",
  value,
  onChange,
  required,
}: {
  label?: string;
  value: string | null;
  onChange: (url: string) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [mostrarUrl, setMostrarUrl] = useState(false);

  async function enviarArquivo(file: File) {
    setEnviando(true);
    setErro(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível enviar a imagem.");
        return;
      }
      onChange(data.url);
    } catch {
      setErro("Falha de conexão ao enviar a imagem.");
    } finally {
      setEnviando(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setArrastando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) enviarArquivo(file);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={handleDrop}
        className={`group relative flex h-44 w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors duration-200 ${
          arrastando
            ? "border-forest-500 bg-forest-50"
            : "border-slate-300 bg-slate-50 hover:border-forest-400 hover:bg-slate-100"
        }`}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Prévia"
              fill
              className="object-cover"
              sizes="320px"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-200 group-hover:bg-ink/50 group-hover:opacity-100">
              <span className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-ink">
                Trocar imagem
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-4 text-center text-slate-400 transition-colors group-hover:text-forest-500">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                d="M4 16.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10.5M4 16.5 8.5 12a2 2 0 0 1 2.8 0L15 15.5M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M15 15.5 16.5 14a2 2 0 0 1 2.8 0L20 15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="9" r="1.5" />
            </svg>
            <p className="text-xs font-medium">Clique ou arraste uma imagem</p>
            <p className="text-[11px]">JPG, PNG ou WebP até 8MB</p>
          </div>
        )}

        {enviando && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/85">
            <span className="text-xs font-medium text-forest-700">Enviando...</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) enviarArquivo(file);
        }}
        className="hidden"
      />

      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}

      <button
        type="button"
        onClick={() => setMostrarUrl((v) => !v)}
        className="mt-2 text-xs text-slate-400 underline transition-colors hover:text-slate-600"
      >
        {mostrarUrl ? "Ocultar link manual" : "Ou colar o link da imagem"}
      </button>
      {mostrarUrl && (
        <input
          type="text"
          className="mt-2 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-500 focus:border-forest-500 focus:outline-none"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      )}
    </div>
  );
}
