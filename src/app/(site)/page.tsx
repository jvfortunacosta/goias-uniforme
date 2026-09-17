import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { YoutubeEmbed } from "@/components/YoutubeEmbed";
import { formatDataHora } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const agora = new Date();

  const [noticias, videos, proximosJogos] = await Promise.all([
    prisma.noticia.findMany({
      where: { ativo: true },
      orderBy: { publicadoEm: "desc" },
      take: 3,
    }),
    prisma.video.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
      take: 4,
    }),
    prisma.jogo.findMany({
      where: { ativo: true, dataHora: { gte: agora } },
      orderBy: { dataHora: "asc" },
      take: 3,
    }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-forest-800">
        <div className="absolute inset-0 bg-hash-lines opacity-60" />
        <Image
          src="/marca/logo-verde.png"
          alt=""
          width={640}
          height={708}
          className="pointer-events-none absolute -right-24 -top-16 h-[420px] w-auto opacity-[0.08] sm:h-[520px]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <h1 className="max-w-2xl font-display text-5xl uppercase leading-[0.95] text-chalk sm:text-7xl">
            Goiás Futebol Americano
          </h1>
          <p className="mt-4 max-w-lg text-lg text-chalk/70">
            Paixão, Força e Determinação.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/loja"
              className="rounded-md bg-pitch px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-forest-900 transition hover:bg-pitch-400"
            >
              Compre Agora
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-forest-700">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-pitch">
                Inscrições abertas
              </p>
              <h2 className="mt-2 font-display text-3xl uppercase text-chalk sm:text-4xl">
                Seletiva Goiás FA 2026
              </h2>
              <p className="mt-3 max-w-xl text-sm text-chalk/70">
                Futebol Americano a partir de 16 anos e Flag Football a partir de 13
                anos. Sem experiência prévia necessária.
              </p>
            </div>
            <Link
              href="/seletiva"
              className="shrink-0 rounded-md bg-pitch px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-forest-900 transition hover:bg-pitch-400"
            >
              Inscreva-se Agora
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-forest-700">
          Notícias em destaque
        </h2>
        {noticias.length === 0 ? (
          <p className="mt-4 text-slate-500">Novidades em breve.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {noticias.map((noticia) => (
              <article
                key={noticia.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                {noticia.imagemUrl && (
                  <div className="h-64 w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={noticia.imagemUrl}
                      alt={noticia.titulo}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-slate-400">
                    {formatDataHora(noticia.publicadoEm)}
                  </p>
                  <h3 className="mt-1 font-heading font-bold uppercase tracking-wide text-forest-800">
                    {noticia.titulo}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{noticia.resumo}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-forest-700">
            Vídeos em destaque
          </h2>
          {videos.length === 0 ? (
            <p className="mt-4 text-slate-500">Vídeos em breve.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {videos.map((video) => (
                <div key={video.id}>
                  <YoutubeEmbed youtubeId={video.youtubeId} titulo={video.titulo} />
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {video.titulo}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-forest-700">
          Próximos jogos
        </h2>
        {proximosJogos.length === 0 ? (
          <p className="mt-4 text-slate-500">Nenhum jogo agendado no momento.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {proximosJogos.map((jogo) => (
              <div
                key={jogo.id}
                className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-heading font-bold uppercase tracking-wide text-forest-800">
                    Goiás F.A. {jogo.mandante ? "x" : "@"} {jogo.adversario}
                  </p>
                  <p className="text-sm text-slate-500">{jogo.local}</p>
                </div>
                <p className="text-sm font-medium text-slate-600">
                  {formatDataHora(jogo.dataHora)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-forest-800">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <h2 className="font-display text-3xl uppercase text-chalk">
            Vista as cores do Goiás F.A.
          </h2>
          <p className="mt-2 text-chalk/70">
            Confira os uniformes oficiais na nossa loja.
          </p>
          <Link
            href="/loja"
            className="mt-6 inline-block rounded-md bg-pitch px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-forest-900 transition hover:bg-pitch-400"
          >
            Ir para a loja
          </Link>
        </div>
      </section>
    </div>
  );
}
