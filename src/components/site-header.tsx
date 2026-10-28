import Image from "next/image";
import Link from "next/link";
import type { StoreSettings } from "@/db/schema/store";
import { buildWhatsAppUrl, defaultStoreSettings } from "@/features/store/schema";
import { WhatsAppIcon } from "@/components/icons";

export function SiteHeader({ store = defaultStoreSettings }: { store?: StoreSettings }) {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label={`${store.name}, início`}>
        {store.logoPhoto ? (
          <Image className="store-logo" src={`/api/store/${store.logoPhoto}`} alt={`Logotipo ${store.name}`} width={84} height={84} unoptimized />
        ) : (
          <span className="wordmark-name">{store.name}</span>
        )}
      </Link>
      <nav aria-label="Navegação principal">
        <Link className="nav-link" href="/#estoque">Estoque</Link>
        <Link className="nav-link" href="#contato">Contato</Link>
        {store.whatsapp && (
          <a className="nav-whatsapp" href={buildWhatsAppUrl(store.whatsapp)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </a>
        )}
      </nav>
    </header>
  );
}
