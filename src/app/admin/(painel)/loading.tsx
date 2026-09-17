export default function CarregandoAdmin() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-48 rounded bg-slate-200" />
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
