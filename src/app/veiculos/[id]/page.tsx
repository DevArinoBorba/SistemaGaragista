import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon, ShieldIcon, WhatsAppIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PriceComparisonCard } from "@/components/vehicles/price-comparison-card";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { VehicleCarousel } from "@/components/vehicles/vehicle-carousel";
import { VehicleGallery } from "@/components/vehicles/vehicle-gallery";
import { getStoreSettings } from "@/features/store/repository";
import { buildMapUrl, buildWhatsAppUrl, formatCnpj, formatPhone } from "@/features/store/schema";
import { getPublicVehicle, getRelatedVehicles } from "@/features/vehicles/public";
import { formatMileage, formatPrice, serializeJsonLd } from "@/features/vehicles/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/veiculos/[id]">): Promise<Metadata> {
  const [vehicle, store] = await Promise.all([getPublicVehicle((await params).id), getStoreSettings()]);
  if (!vehicle) return { title: "Veículo não encontrado" };
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.manufactureYear}/${vehicle.modelYear} — ${store.name}`;
  const description = `${vehicle.brand} ${vehicle.model} ${vehicle.version ? `${vehicle.version} ` : ""}(${vehicle.manufactureYear}/${vehicle.modelYear}), ${formatMileage(vehicle.mileage)}, ${formatPrice(vehicle.priceCents)}.`;
  const cover = vehicle.photos[0] ? `/api/photos/${vehicle.id}/${vehicle.photos[0]}` : undefined;
  return {
    title,
    description,
    openGraph: { title, description, type: "article", images: cover ? [cover] : undefined },
  };
}

export default async function VehiclePage({ params }: PageProps<"/veiculos/[id]">) {
  const id = (await params).id;
  const [vehicle, store, related] = await Promise.all([getPublicVehicle(id), getStoreSettings(), getRelatedVehicles(id)]);
  if (!vehicle) notFound();
  const facts = [["Ano", `${vehicle.manufactureYear}/${vehicle.modelYear}`], ["Quilometragem", formatMileage(vehicle.mileage)], ["Combustível", vehicle.fuel], ["Câmbio", vehicle.transmission], ["Cor", vehicle.color]];
  const hasContact = Boolean(store.whatsapp || store.phone || store.email || store.address || store.openingHours);
  const hasContactList = Boolean(store.phone || store.email || store.address || store.openingHours || store.cnpj);
  const vehicleLd = serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${vehicle.brand} ${vehicle.model}`,
    brand: { "@type": "Brand", name: vehicle.brand },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.modelYear),
    productionDate: String(vehicle.manufactureYear),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "KMT" },
    fuelType: vehicle.fuel,
    vehicleTransmission: vehicle.transmission,
    color: vehicle.color,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (vehicle.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: store.name },
    },
  });
  const whatsappSummary = `${vehicle.brand} ${vehicle.model} ${vehicle.manufactureYear}/${vehicle.modelYear}${vehicle.version ? ` (${vehicle.version})` : ""} — ${formatMileage(vehicle.mileage)} — ${formatPrice(vehicle.priceCents)}`;
  const title = `${vehicle.brand} ${vehicle.model}`;
  return (
    <>
      <SiteHeader store={store} />
      <main id="conteudo" className="detail-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: vehicleLd }} />
        <div className="detail-shell">
          <Link href="/#estoque" className="back-link"><ArrowLeftIcon /> Voltar ao estoque</Link>
          <div className="detail-heading">
            <div>
              <h1>{title}</h1>
              {vehicle.version && <p>{vehicle.version}</p>}
            </div>
          </div>
          <div className="detail-layout">
            <div className="detail-main">
              <VehicleGallery vehicleId={vehicle.id} title={title} photos={vehicle.photos} />
              <section className="detail-about" aria-labelledby="about-title">
                <h2 id="about-title">Sobre o veículo</h2>
                <p className="description">{vehicle.description || "Nenhuma informação adicional foi adicionada."}</p>
              </section>
              <PriceComparisonCard vehicle={vehicle} />
            </div>
            <aside className="spec-sheet" aria-labelledby="spec-title">
              <strong className="detail-price">{formatPrice(vehicle.priceCents)}</strong>
              <h2 id="spec-title">Em detalhes</h2>
              <dl className="spec-list">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              {hasContact && (
                <section className="store-contact" aria-label={`Atendimento da loja ${store.name}`}>
                  {store.whatsapp && (
                    <a
                      className="whatsapp-button"
                      href={buildWhatsAppUrl(store.whatsapp, whatsappSummary)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon className="whatsapp-icon" />
                      <span className="whatsapp-button-label">
                        <strong className="whatsapp-button-main">Solicitar Atendimento exclusivo</strong>
                        <span className="whatsapp-button-sub">Tire dúvidas, faça proposta ou agende visita</span>
                      </span>
                    </a>
                  )}
                  {hasContactList && (
                    <dl className="contact-list">
                      {store.openingHours && (
                        <div>
                          <dt><ClockIcon className="contact-field-icon" /> Horário</dt>
                          <dd>{store.openingHours}</dd>
                        </div>
                      )}
                      {store.phone && (
                        <div>
                          <dt><PhoneIcon className="contact-field-icon" /> Telefone</dt>
                          <dd><a className="text-link" href={`tel:${store.phone}`}>{formatPhone(store.phone)}</a></dd>
                        </div>
                      )}
                      {store.email && (
                        <div>
                          <dt><MailIcon className="contact-field-icon" /> E-mail</dt>
                          <dd><a className="text-link" href={`mailto:${store.email}`}>{store.email}</a></dd>
                        </div>
                      )}
                      {store.address && (
                        <div>
                          <dt><PinIcon className="contact-field-icon" /> Endereço</dt>
                          <dd><a className="text-link" href={buildMapUrl(store.address)} target="_blank" rel="noopener noreferrer">{store.address}</a></dd>
                        </div>
                      )}
                      {store.cnpj && (
                        <div>
                          <dt><ShieldIcon className="contact-field-icon" /> CNPJ</dt>
                          <dd>{formatCnpj(store.cnpj)}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                  {store.logoPhoto && (
                    <div className="store-contact-header">
                      <Image className="store-contact-logo" src={`/api/store/${store.logoPhoto}`} alt={`Logotipo ${store.name}`} width={40} height={40} unoptimized />
                      <span>Anunciado por {store.name}</span>
                    </div>
                  )}
                </section>
              )}
            </aside>
          </div>
        </div>
        {related.length > 0 && (
          <VehicleCarousel id="relacionados" title="Outros veículos no estoque" size="compact">
            {related.map((item) => <VehicleCard key={item.id} vehicle={item} />)}
          </VehicleCarousel>
        )}
      </main>
      <SiteFooter store={store} />
    </>
  );
}
