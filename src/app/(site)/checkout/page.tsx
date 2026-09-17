"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { CalculoFrete, type FreteInfo } from "@/components/CalculoFrete";
import { formatCents, isValidCpf } from "@/lib/format";

type Endereco = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const ENDERECO_VAZIO: Endereco = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { itens, totalCents, limpar } = useCart();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState<Endereco>(ENDERECO_VAZIO);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [frete, setFrete] = useState<FreteInfo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (itens.length === 0) router.replace("/carrinho");
  }, [itens.length, router]);

  async function buscarCep(cepDigitado: string) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");
    setEndereco((e) => ({ ...e, cep: cepDigitado }));
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEndereco((e) => ({
          ...e,
          logradouro: data.logradouro || e.logradouro,
          bairro: data.bairro || e.bairro,
          cidade: data.localidade || e.cidade,
          estado: data.uf || e.estado,
        }));
      }
    } catch {
      // busca de CEP é só conveniência; falha silenciosa, usuário preenche manualmente
    } finally {
      setBuscandoCep(false);
    }
  }

  function validarDadosCliente(): string | null {
    if (!nome.trim()) return "Informe seu nome completo.";
    if (!isValidCpf(cpf)) return "CPF inválido.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "E-mail inválido.";
    if (telefone.replace(/\D/g, "").length < 10) return "Telefone inválido.";
    if (!endereco.cep || endereco.cep.replace(/\D/g, "").length !== 8)
      return "CEP inválido.";
    if (!endereco.logradouro.trim()) return "Informe o logradouro.";
    if (!endereco.numero.trim()) return "Informe o número do endereço.";
    if (!endereco.bairro.trim()) return "Informe o bairro.";
    if (!endereco.cidade.trim()) return "Informe a cidade.";
    if (!endereco.estado.trim() || endereco.estado.length !== 2)
      return "Informe o estado (UF).";
    if (!frete) return "Aguarde o cálculo do frete antes de continuar.";
    return null;
  }

  async function handleContinuar(e: React.FormEvent) {
    e.preventDefault();
    const erroValidacao = validarDadosCliente();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: { nome, cpf, email, telefone },
          endereco: {
            cep: endereco.cep,
            logradouro: endereco.logradouro,
            numero: endereco.numero,
            complemento: endereco.complemento || null,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado.toUpperCase(),
          },
          itens: itens.map((i) => ({
            produtoId: i.produtoId,
            tamanho: i.tamanho,
            cor: i.cor,
            nomePersonalizado: i.nomePersonalizado,
            numeroPersonalizado: i.numeroPersonalizado,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Não foi possível processar seu pedido.");
        setEnviando(false);
        return;
      }

      limpar();
      window.location.href = data.linkPagamento;
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  if (itens.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide">
          Finalizar pedido
        </h1>

        <form onSubmit={handleContinuar} className="space-y-6">
          <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <legend className="px-1 font-heading text-sm font-bold uppercase tracking-wide text-forest-700">
              Seus dados
            </legend>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </fieldset>

          <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <legend className="px-1 font-heading text-sm font-bold uppercase tracking-wide text-forest-700">
              Endereço de entrega
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="CEP"
                value={endereco.cep}
                onChange={(e) => buscarCep(e.target.value)}
              />
              <p className="self-center text-xs text-slate-400">
                {buscandoCep && "Buscando endereço..."}
              </p>
            </div>
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="Logradouro"
                value={endereco.logradouro}
                onChange={(e) =>
                  setEndereco((v) => ({ ...v, logradouro: e.target.value }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="Número"
                value={endereco.numero}
                onChange={(e) =>
                  setEndereco((v) => ({ ...v, numero: e.target.value }))
                }
              />
            </div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
              placeholder="Complemento (opcional)"
              value={endereco.complemento}
              onChange={(e) =>
                setEndereco((v) => ({ ...v, complemento: e.target.value }))
              }
            />
            <div className="grid grid-cols-[1fr_1fr_80px] gap-3">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="Bairro"
                value={endereco.bairro}
                onChange={(e) =>
                  setEndereco((v) => ({ ...v, bairro: e.target.value }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="Cidade"
                value={endereco.cidade}
                onChange={(e) =>
                  setEndereco((v) => ({ ...v, cidade: e.target.value }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="UF"
                maxLength={2}
                value={endereco.estado}
                onChange={(e) =>
                  setEndereco((v) => ({
                    ...v,
                    estado: e.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
          </fieldset>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-forest-700 px-4 py-3 font-heading font-bold uppercase tracking-wide text-white transition hover:bg-forest-800 disabled:opacity-50"
          >
            {enviando ? "Gerando link de pagamento..." : "Ir para o pagamento"}
          </button>
        </form>
      </div>

      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-forest-700">
          Resumo
        </h2>
        <ul className="space-y-2 text-sm text-slate-600">
          {itens.map((item) => (
            <li key={item.itemId} className="flex justify-between gap-2">
              <span>
                {item.nomeProduto}
                {item.tamanho ? ` (${item.tamanho})` : ""}
              </span>
              <span>{formatCents(item.precoUnitarioCents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-slate-200 pt-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Produtos</span>
            <span>{formatCents(totalCents)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Frete (por conta do comprador)</span>
            <span>{frete ? formatCents(frete.valorCents) : "a calcular"}</span>
          </div>
          <div className="flex justify-between pt-1 font-display text-xl text-ink">
            <span className="font-heading text-sm font-bold uppercase tracking-wide">
              Total
            </span>
            <span>{formatCents(totalCents + (frete?.valorCents ?? 0))}</span>
          </div>
        </div>

        {endereco.cep.replace(/\D/g, "").length === 8 && (
          <div className="mt-3 border-t border-slate-200 pt-3">
            <CalculoFrete
              produtoIds={itens.map((i) => i.produtoId)}
              cepControlado={endereco.cep}
              onResult={setFrete}
            />
          </div>
        )}

        <Link href="/carrinho" className="mt-3 block text-xs text-slate-500 hover:underline">
          Editar carrinho
        </Link>
      </aside>
    </div>
  );
}
