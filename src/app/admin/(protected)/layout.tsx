import Image from "next/image";
import Link from "next/link";
import { requireAdminPage } from "@/features/auth/session";
import { getStoreSettings } from "@/features/store/repository";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [, store] = await Promise.all([requireAdminPage(), getStoreSettings()]);
  return (
    <div data-ui className="admin-shell">
      <header className="admin-header">
        <div className="admin-brand">
          <Link href="/admin/veiculos" className="wordmark">
            {store.logoPhoto ? (
              <Image
                className="admin-brand-logo"
                src={`/api/store/${store.logoPhoto}`}
                alt={store.name}
                width={52}
                height={52}
                unoptimized
              />
            ) : null}
            <span className="wordmark-name">{store.name}</span>
          </Link>
          <span className="admin-badge">Painel Admin</span>
        </div>
        <nav aria-label="Navegação administrativa">
          <Link href="/admin/veiculos">Estoque</Link>
          <Link href="/admin/loja">Dados da loja</Link>
          <Link href="/" target="_blank" rel="noopener noreferrer">Ver catálogo ↗</Link>
          <LogoutButton />
        </nav>
      </header>
      <main id="conteudo" className="admin-main">{children}</main>
    </div>
  );
}
