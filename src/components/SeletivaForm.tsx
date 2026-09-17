"use client";

import { useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { formatCents } from "@/lib/format";

let mpInicializado = false;
function garantirMercadoPagoInicializado() {
  if (mpInicializado) return;
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
  if (!publicKey) return;
  initMercadoPago(publicKey, { locale: "pt-BR" });
  mpInicializado = true;
}

type FormState = {
  nomeCompleto: string;
  dataNascimento: string;
  alturaCm: string;
  pesoKg: string;
  cidade: string;
  email: string;
  telefone: string;
  conheceFutebolAmericano: "" | "sim" | "nao";
  praticaEsporte: "" | "sim" | "nao";
  qualEsporte: string;
  tempoPratica: string;
  indicadoPorAtleta: "" | "sim" | "nao";
  nomeIndicacao: string;
};

const FORM_VAZIO: FormState = {
  nomeCompleto: "",
  dataNascimento: "",
  alturaCm: "",
  pesoKg: "",
  cidade: "",
  email: "",
  telefone: "",
  conheceFutebolAmericano: "",
  praticaEsporte: "",
  qualEsporte: "",
  tempoPratica: "",
  indicadoPorAtleta: "",
  nomeIndicacao: "",
};

type Etapa =
  | { tipo: "formulario" }
  | { tipo: "pagamento"; inscricaoId: string; valorCents: number; email: string }
  | { tipo: "pix"; qrCode: string; qrCodeBase64: string }
  | { tipo: "sucesso" };

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-colors duration-150 placeholder:text-slate-400 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/15";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const cardClass = "space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const legendClass = "px-1 font-heading text-xs font-bold uppercase tracking-wide text-forest-700";

function ToggleSimNao({
  value,
  onChange,
}: {
  value: "" | "sim" | "nao";
  onChange: (valor: "sim" | "nao") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-1">
      {(["sim", "nao"] as const).map((opcao) => (
        <button
          key={opcao}
          type="button"
          onClick={() => onChange(opcao)}
          className={`rounded-md px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
            value === opcao
              ? "bg-forest-700 text-white shadow-sm"
              : "text-slate-500 hover:text-forest-700"
          }`}
        >
          {opcao === "sim" ? "Sim" : "Não"}
        </button>
      ))}
    </div>
  );
}

export function SeletivaForm() {
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "formulario" });

  function campo<K extends keyof FormState>(chave: K, valor: FormState[K]) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  function validar(): string | null {
    if (!form.nomeCompleto.trim()) return "Informe seu nome completo.";
    if (!form.dataNascimento) return "Informe sua data de nascimento.";
    if (!form.alturaCm || Number(form.alturaCm) <= 0) return "Informe sua altura (cm).";
    if (!form.pesoKg || Number(form.pesoKg) <= 0) return "Informe seu peso (kg).";
    if (!form.cidade.trim()) return "Informe a cidade onde reside.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "E-mail inválido.";
    if (form.telefone.replace(/\D/g, "").length < 10) return "Telefone inválido.";
    if (!form.conheceFutebolAmericano)
      return "Informe se já conhece o futebol americano e/ou flag football.";
    if (!form.praticaEsporte) return "Informe se pratica algum esporte.";
    if (form.praticaEsporte === "sim" && !form.qualEsporte.trim())
      return "Informe qual esporte você pratica.";
    if (!form.indicadoPorAtleta)
      return "Informe se foi indicado por algum atleta da seletiva.";
    if (form.indicadoPorAtleta === "sim" && !form.nomeIndicacao.trim())
      return "Informe o nome de quem te indicou.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const erroValidacao = validar();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/seletiva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto: form.nomeCompleto,
          dataNascimento: form.dataNascimento,
          alturaCm: Number(form.alturaCm),
          pesoKg: Number(form.pesoKg),
          cidade: form.cidade,
          email: form.email,
          telefone: form.telefone,
          conheceFutebolAmericano: form.conheceFutebolAmericano === "sim",
          praticaEsporte: form.praticaEsporte === "sim",
          qualEsporte: form.qualEsporte || null,
          tempoPratica: form.tempoPratica || null,
          indicadoPorAtleta: form.indicadoPorAtleta === "sim",
          nomeIndicacao: form.nomeIndicacao || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível registrar sua inscrição.");
        setEnviando(false);
        return;
      }
      garantirMercadoPagoInicializado();
      setEtapa({
        tipo: "pagamento",
        inscricaoId: data.inscricaoId,
        valorCents: data.valorCents,
        email: form.email,
      });
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (etapa.tipo === "sucesso") {
    return (
      <div className="rounded-lg border border-forest-200 bg-forest-50 p-6 text-forest-800">
        <p className="font-heading text-lg font-bold uppercase tracking-wide">
          Inscrição confirmada!
        </p>
        <p className="mt-2 text-sm">
          Seu pagamento foi aprovado e sua vaga na Seletiva Goiás F.A. 2026 está
          garantida. Te enviamos um e-mail com os detalhes.
        </p>
      </div>
    );
  }

  if (etapa.tipo === "pix") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="font-heading text-lg font-bold uppercase tracking-wide text-forest-800">
          Pague com Pix para confirmar
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Escaneie o QR Code abaixo ou copie o código Pix. Assim que o pagamento for
          aprovado, você receberá um e-mail de confirmação.
        </p>
        {etapa.qrCodeBase64 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${etapa.qrCodeBase64}`}
            alt="QR Code Pix"
            className="mx-auto mt-4 h-56 w-56"
          />
        )}
        <textarea
          readOnly
          className="mt-4 w-full rounded-md border border-slate-300 bg-slate-50 p-2 text-xs text-slate-600"
          rows={3}
          value={etapa.qrCode}
          onClick={(e) => e.currentTarget.select()}
        />
      </div>
    );
  }

  if (etapa.tipo === "pagamento") {
    return (
      <div>
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Inscrição + camiseta</p>
          <p className="font-display text-2xl text-forest-700">
            {formatCents(etapa.valorCents)}
          </p>
        </div>
        <Payment
          initialization={{ amount: etapa.valorCents / 100, payer: { email: etapa.email } }}
          customization={{
            paymentMethods: { creditCard: "all", bankTransfer: "all" },
          }}
          onSubmit={async ({ formData }) => {
            const res = await fetch("/api/seletiva/pagamento", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ inscricaoId: etapa.inscricaoId, formData }),
            });
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.error ?? "Pagamento recusado.");
            }
            if (data.status === "approved") {
              setEtapa({ tipo: "sucesso" });
            } else if (data.point_of_interaction?.transaction_data?.qr_code) {
              setEtapa({
                tipo: "pix",
                qrCode: data.point_of_interaction.transaction_data.qr_code,
                qrCodeBase64: data.point_of_interaction.transaction_data.qr_code_base64,
              });
            } else if (data.status === "rejected") {
              throw new Error("Pagamento recusado. Tente outro cartão.");
            }
          }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset className={cardClass}>
        <legend className={legendClass}>Seus dados</legend>

        <div>
          <label className={labelClass}>Nome completo</label>
          <input
            className={inputClass}
            value={form.nomeCompleto}
            onChange={(e) => campo("nomeCompleto", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Data de nascimento</label>
            <input
              type="date"
              className={inputClass}
              value={form.dataNascimento}
              onChange={(e) => campo("dataNascimento", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Altura (cm)</label>
            <input
              type="number"
              className={inputClass}
              value={form.alturaCm}
              onChange={(e) => campo("alturaCm", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Peso (kg)</label>
            <input
              type="number"
              className={inputClass}
              value={form.pesoKg}
              onChange={(e) => campo("pesoKg", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Reside em qual cidade?</label>
          <input
            className={inputClass}
            value={form.cidade}
            onChange={(e) => campo("cidade", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className={cardClass}>
        <legend className={legendClass}>Contato</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>E-mail</label>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => campo("email", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input
              className={inputClass}
              value={form.telefone}
              onChange={(e) => campo("telefone", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={cardClass}>
        <legend className={legendClass}>Sua experiência</legend>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">
            Já conhece o futebol americano e/ou o flag football?
          </p>
          <ToggleSimNao
            value={form.conheceFutebolAmericano}
            onChange={(v) => campo("conheceFutebolAmericano", v)}
          />
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">Pratica algum esporte?</p>
          <ToggleSimNao
            value={form.praticaEsporte}
            onChange={(v) => campo("praticaEsporte", v)}
          />
        </div>

        {form.praticaEsporte === "sim" && (
          <div className="grid animate-fade-in grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Qual esporte?</label>
              <input
                className={inputClass}
                value={form.qualEsporte}
                onChange={(e) => campo("qualEsporte", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Há quanto tempo?</label>
              <input
                className={inputClass}
                value={form.tempoPratica}
                onChange={(e) => campo("tempoPratica", e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="h-px bg-slate-100" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">
            Foi indicado para a seletiva por algum atleta?
          </p>
          <ToggleSimNao
            value={form.indicadoPorAtleta}
            onChange={(v) => campo("indicadoPorAtleta", v)}
          />
        </div>

        {form.indicadoPorAtleta === "sim" && (
          <div className="animate-fade-in">
            <label className={labelClass}>Qual atleta?</label>
            <input
              className={inputClass}
              value={form.nomeIndicacao}
              onChange={(e) => campo("nomeIndicacao", e.target.value)}
            />
          </div>
        )}
      </fieldset>

      {erro && (
        <p className="animate-fade-in rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-forest-700 px-6 py-3.5 font-heading font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-glow-sm disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none sm:w-auto"
      >
        {enviando ? "Enviando..." : "Continuar para o pagamento"}
      </button>
    </form>
  );
}
