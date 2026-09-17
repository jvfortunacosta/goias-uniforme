"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminDeleteButton({
  url,
  confirmMessage,
}: {
  url: string;
  confirmMessage: string;
}) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function handleClick() {
    if (!confirm(confirmMessage)) return;
    setExcluindo(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        alert("Não foi possível excluir.");
        setExcluindo(false);
        return;
      }
      router.refresh();
    } catch {
      alert("Falha de conexão.");
      setExcluindo(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={excluindo}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {excluindo ? "Excluindo..." : "Excluir"}
    </button>
  );
}
