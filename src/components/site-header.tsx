"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { StoreSettings } from "@/db/schema/store";
import { buildWhatsAppUrl, defaultStoreSettings } from "@/features/store/schema";
import { WhatsAppIcon } from "@/components/icons";

let splashPlayedInSession = false;

export function SiteHeader({ store = defaultStoreSettings }: { store?: StoreSettings }) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(() => !splashPlayedInSession);

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  useEffect(() => {
    if (splashPlayedInSession) return;
    splashPlayedInSession = true;
    const timer = window.setTimeout(() => setShowSplash(false), 2050);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && (
        <div className="splash-screen" aria-hidden="true">
          {store.logoPhoto ? (
            <Image
              className="splash-logo"
              src={`/api/store/${store.logoPhoto}`}
              alt=""
              width={176}
              height={176}
              priority
              unoptimized
            />
          ) : (
            <span className="splash-wordmark">{store.name}</span>
          )}
          <div className="splash-bar-container">
            <div className="splash-bar" />
          </div>
          <div className="splash-text">{store.tagline || store.name}</div>
        </div>
      )}
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label={`${store.name}, início`}>
          {store.logoPhoto ? (
            <Image className="store-logo" src={`/api/store/${store.logoPhoto}`} alt={`Logotipo ${store.name}`} width={84} height={84} unoptimized />
          ) : (
            <span className="wordmark-name">{store.name}</span>
          )}
        </Link>
        <nav aria-label="Navegação principal">
          <Link
            className="nav-link"
            href="/"
            onClick={() => {
              if (pathname === "/") window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            }}
          >
            Estoque
          </Link>
          <Link className="nav-link" href="/venda-seu-veiculo">Venda seu Veículo</Link>
          <Link className="nav-link" href="/financiamento">Financiamento</Link>
          <Link className="nav-link" href="/contato">Contato</Link>
          {store.whatsapp && (
            <a className="nav-whatsapp" href={buildWhatsAppUrl(store.whatsapp)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </a>
          )}
        </nav>
      </header>
    </>
  );
}
