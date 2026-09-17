import { JogoAdminForm } from "@/components/JogoAdminForm";

export default function NovoJogoPage() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Novo jogo
      </h1>
      <JogoAdminForm />
    </div>
  );
}
