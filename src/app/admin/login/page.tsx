import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/features/auth/session";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin/veiculos");
  return <main id="conteudo" className="login-page"><Link href="/" className="wordmark">Garagista<span>.</span></Link><section className="login-panel"><h1>Bem-vindo à loja.</h1><p>Entre para cuidar do seu estoque.</p><LoginForm /><Link className="text-link" href="/">← Voltar ao catálogo</Link></section><p className="login-note">Acesso exclusivo para a administração da loja.</p></main>;
}
