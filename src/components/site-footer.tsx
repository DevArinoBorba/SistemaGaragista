import Image from "next/image";
import Link from "next/link";
import type { StoreSettings } from "@/db/schema/store";
import { buildMapUrl, buildWhatsAppUrl, defaultStoreSettings, formatCnpj, formatPhone } from "@/features/store/schema";
import {
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  TiktokIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "@/components/icons";

export function SiteFooter({ store = defaultStoreSettings }: { store?: StoreSettings }) {
  const hasContacts = Boolean(
    store.whatsapp || store.phone || store.email || store.address || store.openingHours,
  );
  const socials = [
    { key: "instagram", label: "Instagram", href: store.instagramUrl, icon: <InstagramIcon /> },
    { key: "youtube", label: "YouTube", href: store.youtubeUrl, icon: <YoutubeIcon /> },
    { key: "tiktok", label: "TikTok", href: store.tiktokUrl, icon: <TiktokIcon /> },
    { key: "facebook", label: "Facebook", href: store.facebookUrl, icon: <FacebookIcon /> },
  ].filter((item) => Boolean(item.href?.trim()));
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contato" role="contentinfo" aria-label="Rodapé do site">
      <div className="footer-inner">
        <div className="footer-brand">
          {store.logoPhoto ? (
            <Image
              className="footer-logo"
              src={`/api/store/${store.logoPhoto}`}
              alt={store.name}
              width={112}
              height={112}
              unoptimized
            />
          ) : (
            <p className="footer-name">{store.name}</p>
          )}
          <p className="footer-tagline">
            {store.tagline || "Especialistas em veículos selecionados com procedência e garantia. Seu próximo carro está aqui."}
          </p>
          {store.cnpj && <small className="store-cnpj">CNPJ: {formatCnpj(store.cnpj)}</small>}
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Navegação</h4>
          <ul className="footer-nav-list">
            <li><Link href="/">Início</Link></li>
            <li><Link href="/">Estoque</Link></li>
            <li><Link href="/venda-seu-veiculo">Venda seu Veículo</Link></li>
            <li><Link href="/financiamento">Financiamento</Link></li>
            <li><Link href="/contato">Contato</Link></li>
          </ul>
        </div>

        {hasContacts && (
          <div className="footer-col">
            <h4 className="footer-col-title">Contato</h4>
            <ul className="footer-contact-list">
              {store.phone && (
                <li>
                  <PhoneIcon />
                  <a href={`tel:${store.phone}`}>{formatPhone(store.phone)}</a>
                </li>
              )}
              {store.whatsapp && (
                <li>
                  <WhatsAppIcon />
                  <a href={buildWhatsAppUrl(store.whatsapp)} target="_blank" rel="noopener noreferrer">
                    {formatPhone(store.whatsapp)}
                  </a>
                </li>
              )}
              {store.email && (
                <li>
                  <MailIcon />
                  <a href={`mailto:${store.email}`}>{store.email}</a>
                </li>
              )}
              {store.address && (
                <li>
                  <PinIcon />
                  <a href={buildMapUrl(store.address)} target="_blank" rel="noopener noreferrer">
                    {store.address}
                  </a>
                </li>
              )}
              {store.openingHours && (
                <li>
                  <ClockIcon />
                  <span>{store.openingHours}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {socials.length > 0 && (
          <div className="footer-col">
            <h4 className="footer-col-title">Redes sociais</h4>
            <div className="footer-socials-list">
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  className="social-circle"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="footer-base">
        <small>© {year} {store.name}. Todos os direitos reservados.</small>
        <div className="footer-legal-links">
          <Link href="/privacidade">Política de Privacidade</Link>
          <span aria-hidden="true">|</span>
          <Link href="/termos">Termos de Uso</Link>
          <span aria-hidden="true">|</span>
          <Link href="/contato">Contato</Link>
        </div>
      </div>
    </footer>
  );
}
