import { NoticiaAdminForm } from "@/components/NoticiaAdminForm";

export default function NovaNoticiaPage() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Nova notícia
      </h1>
      <NoticiaAdminForm />
    </div>
  );
}
