import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Pagination } from "@/components/pagination";
import { ShowcaseCard, VehicleCard } from "@/components/vehicles/vehicle-card";
import { VehicleCarousel } from "@/components/vehicles/vehicle-carousel";
import { getStoreSettings } from "@/features/store/repository";
import { getCatalog, getFeaturedVehicles } from "@/features/vehicles/public";
import { catalogFilterSchema, fuels, serializeJsonLd, transmissions } from "@/features/vehicles/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSettings();
  const title = store.tagline ? `${store.name} — ${store.tagline}` : store.name;
  const description = store.tagline || `Estoque de veículos publicados por ${store.name}.`;
  const image = store.heroPhoto ? `/api/store/${store.heroPhoto}` : store.logoPhoto ? `/api/store/${store.logoPhoto}` : undefined;
  const icon = store.logoPhoto ? `/api/store/${store.logoPhoto}` : undefined;
  return {
    title,
    description,
    icons: icon ? { icon, shortcut: icon, apple: icon } : undefined,
    openGraph: { title, description, type: "website", images: image ? [image] : undefined },
  };
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const raw = await searchParams;
  const parsed = catalogFilterSchema.parse({
    q: typeof raw.q === "string" ? raw.q : "",
    cambio: typeof raw.cambio === "string" ? raw.cambio : undefined,
    combustivel: typeof raw.combustivel === "string" ? raw.combustivel : undefined,
    precoMax: typeof raw.precoMax === "string" ? raw.precoMax : undefined,
    anoMin: typeof raw.anoMin === "string" ? raw.anoMin : undefined,
    ordem: typeof raw.ordem === "string" ? raw.ordem : "recentes",
    pagina: typeof raw.pagina === "string" ? raw.pagina : "1",
  });
  const [{ vehicles, hasNext }, featuredList, store] = await Promise.all([
    getCatalog(parsed.q, parsed.pagina, {
      transmission: parsed.cambio,
      fuel: parsed.combustivel,
      maxPriceCents: parsed.precoMax,
      minYear: parsed.anoMin,
      sort: parsed.ordem,
    }),
    getFeaturedVehicles(),
    getStoreSettings(),
  ]);
  const hasFilters = Boolean(parsed.q || parsed.cambio || parsed.combustivel || parsed.precoMax || parsed.anoMin || parsed.ordem !== "recentes");
  const dealerLd = serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: store.name,
    description: store.tagline || undefined,
    telephone: store.phone || store.whatsapp || undefined,
    email: store.email || undefined,
    address: store.address || undefined,
    openingHours: store.openingHours || undefined,
  });
  const precoMaxValue = parsed.precoMax ? String(Math.floor(parsed.precoMax / 100)) : "";
  const anoMinValue = parsed.anoMin ? String(parsed.anoMin) : "";
  const featured = !hasFilters && parsed.pagina === 1 ? featuredList : [];

  return (
    <>
      <SiteHeader store={store} />
      <main id="conteudo" className="catalog-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: dealerLd }} />
        {featured.length > 0 && (
          <VehicleCarousel
            id="destaques"
            title="Anúncios em destaque"
            size="feature"
            autoPlayMs={4000}
          >
            {featured.map((vehicle) => <ShowcaseCard key={vehicle.id} vehicle={vehicle} />)}
          </VehicleCarousel>
        )}
        <section id="estoque" className="stock-section" aria-labelledby="stock-title">
          <div className="section-top">
            <h1 id="stock-title">Veículos à venda</h1>
          </div>
          <form className="search-form catalog-search" action="/#estoque" role="search">
            <div className="search-bar-top">
              <div className="search-field">
                <SearchIcon />
                <input
                  id="search"
                  name="q"
                  type="search"
                  aria-label="Qual carro você procura?"
                  placeholder="Busque por marca, modelo ou versão..."
                  defaultValue={parsed.q}
                  maxLength={100}
                />
              </div>
              <div className="search-bar-actions">
                <button className="button primary search-submit" type="submit">Buscar</button>
                {hasFilters && <Link className="button secondary search-clear" href="/#estoque">Limpar filtros</Link>}
              </div>
            </div>
            <div className="search-filters-grid">
              <label className="filter-chip">
                <span>Câmbio</span>
                <select name="cambio" aria-label="Câmbio" defaultValue={parsed.cambio ?? ""}>
                  <option value="">Todos os câmbios</option>
                  {transmissions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="filter-chip">
                <span>Combustível</span>
                <select name="combustivel" aria-label="Combustível" defaultValue={parsed.combustivel ?? ""}>
                  <option value="">Todos os combustíveis</option>
                  {fuels.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="filter-chip">
                <span>Preço máximo</span>
                <select name="precoMax" aria-label="Preço máximo" defaultValue={precoMaxValue}>
                  <option value="">Qualquer preço</option>
                  <option value="50000">Até R$ 50 mil</option>
                  <option value="80000">Até R$ 80 mil</option>
                  <option value="120000">Até R$ 120 mil</option>
                  <option value="200000">Até R$ 200 mil</option>
                </select>
              </label>
              <label className="filter-chip">
                <span>Ano mínimo</span>
                <select name="anoMin" aria-label="Ano mínimo" defaultValue={anoMinValue}>
                  <option value="">Qualquer ano</option>
                  <option value="2018">A partir de 2018</option>
                  <option value="2020">A partir de 2020</option>
                  <option value="2022">A partir de 2022</option>
                  <option value="2024">A partir de 2024</option>
                </select>
              </label>
              <label className="filter-chip">
                <span>Ordenar por</span>
                <select name="ordem" aria-label="Ordenar por" defaultValue={parsed.ordem}>
                  <option value="recentes">Mais recentes</option>
                  <option value="menor-preco">Menor preço</option>
                  <option value="menor-km">Menor quilometragem</option>
                </select>
              </label>
            </div>
          </form>
          {vehicles.length ? (
            <div className="vehicle-grid">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
          ) : (
            <div className="empty-stock">
              <h3>{hasFilters ? "Nenhum veículo encontrado" : "Novos caminhos em breve."}</h3>
              <p>{hasFilters ? "Tente buscar por outra marca, modelo ou filtro." : "Ainda não há veículos publicados no catálogo. Volte em breve para conhecer o estoque."}</p>
              {hasFilters && <Link href="/#estoque" className="text-link">Limpar busca</Link>}
            </div>
          )}
          <Pagination
            page={parsed.pagina}
            hasNext={hasNext}
            path="/"
            query={parsed.q}
            params={{
              cambio: parsed.cambio,
              combustivel: parsed.combustivel,
              precoMax: precoMaxValue || undefined,
              anoMin: anoMinValue || undefined,
              ordem: parsed.ordem !== "recentes" ? parsed.ordem : undefined,
            }}
            anchor="#estoque"
          />
        </section>
      </main>
      <SiteFooter store={store} />
    </>
  );
}
