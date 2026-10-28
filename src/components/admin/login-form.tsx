"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/sign-in/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), rememberMe: false }) });
      if (!response.ok) { setError(response.status === 429 ? "Muitas tentativas. Aguarde um minuto antes de tentar novamente." : "Não foi possível entrar. Confira seu e-mail e sua senha."); return; }
      router.replace("/admin/veiculos"); router.refresh();
    } catch { setError("Não foi possível conectar. Tente novamente."); }
    finally { setPending(false); }
  }
  return <form onSubmit={login} className="login-form">
    <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="username" maxLength={254} required /></div>
    <div className="field"><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" maxLength={128} required /></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button primary" disabled={pending}>{pending ? "Entrando…" : "Entrar no painel"}<span aria-hidden="true">↗</span></button>
  </form>;
}
