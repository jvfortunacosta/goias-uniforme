import { VideoAdminForm } from "@/components/VideoAdminForm";

export default function NovoVideoPage() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-forest-800">
        Novo vídeo
      </h1>
      <VideoAdminForm />
    </div>
  );
}
