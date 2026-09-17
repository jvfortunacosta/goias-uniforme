export default function CarregandoSite() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-14">
      <div className="h-8 w-64 rounded bg-slate-200" />
      <div className="mt-4 h-4 w-96 max-w-full rounded bg-slate-100" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
