import { AdminSidebar } from "@/components/AdminSidebar";
import { PageTransition } from "@/components/PageTransition";

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AdminSidebar />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
