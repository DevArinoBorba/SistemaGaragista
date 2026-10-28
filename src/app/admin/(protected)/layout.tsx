import Link from "next/link";
import { requireAdminPage } from "@/features/auth/session";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <div data-ui className="admin-shell"><header className="admin-header"><Link href="/admin/veiculos" className="wordmark">Garagista<span>.</span></Link><nav aria-label="Navegação administrativa"><Link href="/admin/loja">Dados da loja</Link><Link href="/admin/veiculos">Estoque</Link><Link href="/" target="_blank" rel="noopener noreferrer">Ver catálogo ↗</Link><LogoutButton /></nav></header><main id="conteudo" className="admin-main">{children}</main></div>;
}
