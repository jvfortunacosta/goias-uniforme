import { SeletivaForm } from "@/components/SeletivaForm";

export const metadata = { title: "Seletiva 2026 - Goiás F.A." };

export default function SeletivaPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-forest-800">
        <div className="absolute inset-0 bg-hash-lines opacity-60" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-pitch">
            Inscrições abertas
          </p>
          <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-chalk sm:text-6xl">
            Seletiva Goiás F.A.
          </h1>
          <p className="mt-4 max-w-xl text-chalk/70">
            Futebol Americano a partir de 16 anos e Flag Football a partir de 13
            anos. Sem experiência prévia necessária.
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-4 text-chalk sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-widest text-chalk/50">Data</dt>
              <dd className="font-medium">21/10/2026, às 20:30</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-chalk/50">Local</dt>
              <dd className="font-medium">Clube Oásis (C-197 - St. Bueno)</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-chalk/50">
                Inscrição + camiseta
              </dt>
              <dd className="font-medium">R$ 50</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-chalk/50">Formato</dt>
              <dd className="font-medium">Exercícios de força e agilidade</dd>
            </div>
          </dl>

          <p className="mt-6 max-w-xl text-sm text-chalk/60">
            Necessário uso de chuteira society ou tênis. Proibido chuteira de cravo e
            roupas vermelhas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-10">
        <h2 className="mb-6 font-heading text-xl font-bold uppercase tracking-wide text-forest-800">
          Inscreva-se
        </h2>
        <SeletivaForm />
      </section>
    </div>
  );
}
