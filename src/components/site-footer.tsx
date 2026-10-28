import Link from "next/link";
import type { StoreSettings } from "@/db/schema/store";
import { buildMapUrl, buildWhatsAppUrl, defaultStoreSettings, formatCnpj, formatPhone } from "@/features/store/schema";
import { ArrowUpRightIcon } from "@/components/icons";

export function SiteFooter({ store = defaultStoreSettings }: { store?: StoreSettings }) {
  const hasContacts = Boolean(
    store.whatsapp || store.phone || store.email || store.address || store.openingHours,
  );
  return (
    <footer className="site-footer" id="contato">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-name">{store.name}</p>
          <span>{store.tagline || "O estoque da loja, sempre à mão."}</span>
        </div>
        {hasContacts && (
          <dl className="footer-contacts">
            {store.whatsapp && (
              <div>
                <dt>WhatsApp</dt>
                <dd><a href={buildWhatsAppUrl(store.whatsapp)} target="_blank" rel="noopener noreferrer">{formatPhone(store.whatsapp)}</a></dd>
              </div>
            )}
            {store.phone && (
              <div>
                <dt>Telefone</dt>
                <dd><a href={`tel:${store.phone}`}>{formatPhone(store.phone)}</a></dd>
              </div>
            )}
            {store.email && (
              <div>
                <dt>E-mail</dt>
                <dd><a href={`mailto:${store.email}`}>{store.email}</a></dd>
              </div>
            )}
            {store.address && (
              <div>
                <dt>Endereço</dt>
                <dd><a href={buildMapUrl(store.address)} target="_blank" rel="noopener noreferrer">{store.address}</a></dd>
              </div>
            )}
            {store.openingHours && (
              <div>
                <dt>Horário</dt>
                <dd>{store.openingHours}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
      <div className="footer-base">
        {store.cnpj ? <small className="store-cnpj">CNPJ: {formatCnpj(store.cnpj)}</small> : <small>{store.name}</small>}
        <Link href="/admin/veiculos">Acesso administrativo <ArrowUpRightIcon /></Link>
      </div>
    </footer>
  );
}
