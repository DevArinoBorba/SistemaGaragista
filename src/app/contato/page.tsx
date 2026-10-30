import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  ShieldIcon,
  TiktokIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getStoreSettings } from "@/features/store/repository";
import {
  buildMapEmbedUrl,
  buildMapUrl,
  buildWhatsAppUrl,
  formatCnpj,
  formatPhone,
} from "@/features/store/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSettings();
  return {
    title: `Contato e Localização | ${store.name}`,
    description: `Canais de atendimento, endereço, horário de funcionamento e localização da ${store.name}.`,
  };
}

export default async function ContactPage() {
  const store = await getStoreSettings();
  const whatsappUrl = buildWhatsAppUrl(store.whatsapp);
  const mapUrl = buildMapUrl(store.address);
  const mapEmbedUrl = buildMapEmbedUrl(store.address);

  const socials = [
    { key: "instagram", label: "Instagram", href: store.instagramUrl, icon: <InstagramIcon /> },
    { key: "youtube", label: "YouTube", href: store.youtubeUrl, icon: <YoutubeIcon /> },
    { key: "tiktok", label: "TikTok", href: store.tiktokUrl, icon: <TiktokIcon /> },
    { key: "facebook", label: "Facebook", href: store.facebookUrl, icon: <FacebookIcon /> },
  ].filter((item) => Boolean(item.href?.trim()));

  return (
    <>
      <SiteHeader store={store} />
      <main id="conteudo" className="contact-page">
        <section className="contact-hero" aria-labelledby="contact-title">
          <div className="financing-shell">
            <span className="financing-eyebrow">Contato e Localização</span>
            <h1 id="contact-title">Fale com a {store.name}</h1>
            <p className="financing-lead">
              {store.tagline || "Visite nosso showroom ou fale diretamente com nossa equipe pelos canais oficiais."}
            </p>
          </div>
        </section>

        <section className="contact-main-section" aria-label="Dados de contato e mapa">
          <div className="financing-shell">
            <div className="contact-page-grid">
              <div className="contact-channels-col">
                <div className="financing-card">
                  <h2>Canais de Atendimento</h2>
                  <p className="contact-card-lead">
                    Escolha o canal de sua preferência para tirar dúvidas, agendar uma visita ou negociar seu próximo veículo.
                  </p>

                  <div className="contact-cards-list">
                    {store.whatsapp && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-channel-item contact-channel-highlight"
                      >
                        <span className="contact-channel-icon">
                          <WhatsAppIcon />
                        </span>
                        <div className="contact-channel-body">
                          <span>WhatsApp</span>
                          <strong>{formatPhone(store.whatsapp)}</strong>
                        </div>
                        <ArrowUpRightIcon className="contact-channel-arrow" />
                      </a>
                    )}

                    {store.phone && (
                      <a href={`tel:${store.phone}`} className="contact-channel-item">
                        <span className="contact-channel-icon">
                          <PhoneIcon />
                        </span>
                        <div className="contact-channel-body">
                          <span>Telefone</span>
                          <strong>{formatPhone(store.phone)}</strong>
                        </div>
                        <ArrowUpRightIcon className="contact-channel-arrow" />
                      </a>
                    )}

                    {store.email && (
                      <a href={`mailto:${store.email}`} className="contact-channel-item">
                        <span className="contact-channel-icon">
                          <MailIcon />
                        </span>
                        <div className="contact-channel-body">
                          <span>E-mail</span>
                          <strong>{store.email}</strong>
                        </div>
                        <ArrowUpRightIcon className="contact-channel-arrow" />
                      </a>
                    )}

                    {store.openingHours && (
                      <div className="contact-channel-item">
                        <span className="contact-channel-icon">
                          <ClockIcon />
                        </span>
                        <div className="contact-channel-body">
                          <span>Horário de Atendimento</span>
                          <strong>{store.openingHours}</strong>
                        </div>
                      </div>
                    )}

                    {store.cnpj && (
                      <div className="contact-channel-item">
                        <span className="contact-channel-icon">
                          <ShieldIcon />
                        </span>
                        <div className="contact-channel-body">
                          <span>CNPJ</span>
                          <strong>{formatCnpj(store.cnpj)}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {socials.length > 0 && (
                    <div className="contact-socials-block">
                      <p className="footer-socials-title">Redes sociais</p>
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
              </div>

              <div className="contact-location-col">
                <div className="financing-card contact-location-card">
                  <div className="contact-location-head">
                    <div>
                      <span className="contact-location-badge">
                        <PinIcon /> Endereço da Loja
                      </span>
                      <h2>Nossa Localização</h2>
                      <p className="contact-address-text">
                        {store.address || "Endereço em atualização — entre em contato pelo WhatsApp para receber a localização exata."}
                      </p>
                    </div>
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button secondary contact-map-btn"
                      >
                        Abrir no Google Maps <ArrowUpRightIcon />
                      </a>
                    )}
                  </div>

                  {mapEmbedUrl ? (
                    <div className="contact-map-wrap">
                      <iframe
                        src={mapEmbedUrl}
                        title={`Mapa de localização de ${store.name}`}
                        className="contact-map-iframe"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="contact-map-empty">
                      <PinIcon />
                      <p>Cadastre o endereço da loja em Dados da loja no painel administrativo para exibir o mapa interativo aqui.</p>
                    </div>
                  )}

                  <div className="contact-bottom-actions">
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button primary"
                      >
                        <WhatsAppIcon /> Agendar Visita pelo WhatsApp
                      </a>
                    )}
                    <Link href="/" className="button secondary">
                      Ver Veículos Disponíveis
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter store={store} />
    </>
  );
}
