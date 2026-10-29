import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/features/auth/session";
import { getStoreSettings } from "@/features/store/repository";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin/veiculos");
  const store = await getStoreSettings();
  return (
    <main id="conteudo" className="login-page">
      <Link href="/" className="wordmark login-wordmark">
        {store.logoPhoto ? (
          <Image
            className="login-logo"
            src={`/api/store/${store.logoPhoto}`}
            alt={store.name}
            width={88}
            height={88}
            unoptimized
          />
        ) : (
          <span className="wordmark-name">{store.name}</span>
        )}
      </Link>
      <section className="login-panel">
        <span className="financing-eyebrow">Administração</span>
        <h1>Bem-vindo à loja.</h1>
        <p>Entre para gerenciar o estoque e as configurações da {store.name}.</p>
        <LoginForm />
        <Link className="text-link" href="/">← Voltar ao catálogo</Link>
      </section>
      <p className="login-note">Acesso exclusivo para a administração da loja.</p>
    </main>
  );
}
