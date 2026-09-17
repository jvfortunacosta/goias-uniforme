import { ProdutoAdminForm } from "@/components/ProdutoAdminForm";

export default function NovoProdutoPage() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Novo produto
      </h1>
      <ProdutoAdminForm />
    </div>
  );
}
