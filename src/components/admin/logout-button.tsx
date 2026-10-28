"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  return <div><button className="text-button" disabled={pending} onClick={async () => {
    setPending(true); setError(false);
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error("Sign out failed");
      router.replace("/admin/login"); router.refresh();
    } catch { setError(true); setPending(false); }
  }}>{pending ? "Saindo…" : "Sair"}</button>{error && <p role="alert">Não foi possível sair. Tente novamente.</p>}</div>;
}
