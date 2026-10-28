import Link from "next/link";
import { requireAdminPage } from "@/features/auth/session";
import { duplicateVehicleAction, toggleVehicleFeaturedAction, updateVehicleStatusAction } from "@/features/vehicles/actions";
import { getStockSummary, listVehicles } from "@/features/vehicles/repository";
import { type CatalogSort, catalogSortValues, formatMileage, formatPrice, fuels, pageNumber, statusLabels, transmissions, vehicleStatuses } from "@/features/vehicles/schema";
import { DeleteVehicle } from "@/components/admin/delete-vehicle";
import { Pagination } from "@/components/pagination";

export default async function StockPage({ searchParams }: PageProps<"/admin/veiculos">) {
  await requireAdminPage();
  const params = await searchParams;
  const page = pageNumber(params.pagina);
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const status = typeof params.status === "string" && (vehicleStatuses as readonly string[]).includes(params.status) ? (params.status as (typeof vehicleStatuses)[number]) : undefined;
  const fuel = typeof params.combustivel === "string" && (fuels as readonly string[]).includes(params.combustivel) ? (params.combustivel as (typeof fuels)[number]) : undefined;
  const transmission = typeof params.cambio === "string" && (transmissions as readonly string[]).includes(params.cambio) ? (params.cambio as (typeof transmissions)[number]) : undefined;
  const sort: CatalogSort = typeof params.ordem === "string" && (catalogSortValues as readonly string[]).includes(params.ordem) ? (params.ordem as CatalogSort) : "recentes";
  const [rows, summary] = await Promise.all([listVehicles(false, page, query, 24, { status, fuel, transmission, sort }), getStockSummary()]);
  const vehicles = rows.slice(0, 24);
  const hasNext = rows.length > 24;
  const hasFilters = Boolean(query || status || fuel || transmission || sort !== "recentes");
  return (
    <>
      <div className="admin-title"><div><h1>Seu estoque</h1><p>Cadastre, publique e mantenha seus anúncios em dia.</p></div><div className="row-actions"><a className="button secondary" href="/api/admin/estoque.csv">Exportar CSV</a><Link className="button primary" href="/admin/veiculos/novo">Adicionar veículo <span aria-hidden="true">+</span></Link></div></div>
      {params.salvo && <p className="success-message" role="status">Veículo salvo com sucesso.</p>}
      {params.removido && <p className="success-message" role="status">Veículo removido do estoque.</p>}
      <dl className="stock-summary" aria-label="Resumo do estoque">
        <div><dt>Total</dt><dd>{summary.total}</dd></div>
        <div><dt>Publicados</dt><dd>{summary.published}</dd></div>
        <div><dt>Rascunhos</dt><dd>{summary.draft}</dd></div>
        <div><dt>Vendidos</dt><dd>{summary.sold}</dd></div>
      </dl>
      <form className="search-form" action="/admin/veiculos" role="search">
        <label htmlFor="admin-search">Filtrar estoque</label>
        <div className="filter-row">
          <input id="admin-search" name="q" type="search" placeholder="Marca, modelo ou versão" defaultValue={query} maxLength={100} />
          <select name="status" aria-label="Situação" defaultValue={status ?? ""}>
            <option value="">Todas as situações</option>
            {vehicleStatuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
          </select>
          <select name="combustivel" aria-label="Combustível" defaultValue={fuel ?? ""}>
            <option value="">Todos os combustíveis</option>
            {fuels.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select name="cambio" aria-label="Câmbio" defaultValue={transmission ?? ""}>
            <option value="">Todos os câmbios</option>
            {transmissions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select name="ordem" aria-label="Ordenar por" defaultValue={sort}>
            <option value="recentes">Mais recentes</option>
            <option value="menor-preco">Menor preço</option>
            <option value="menor-km">Menor quilometragem</option>
          </select>
          <button className="button secondary" type="submit">Filtrar</button>
          {hasFilters && <Link className="text-link" href="/admin/veiculos">Limpar filtros</Link>}
        </div>
      </form>
      <p className="stock-count">{vehicles.length} {vehicles.length === 1 ? "veículo cadastrado" : "veículos cadastrados"}{hasNext || page > 1 ? " nesta página" : ""}</p>
      {vehicles.length ? (
        <div className="stock-list">
          {vehicles.map((vehicle) => (
            <article className="stock-row" key={vehicle.id}>
              <div><h2><Link href={`/admin/veiculos/${vehicle.id}/editar`}>{vehicle.brand} {vehicle.model}</Link></h2><p>{vehicle.modelYear} · {formatMileage(vehicle.mileage)} · {vehicle.version || vehicle.fuel}</p></div>
              <strong>{formatPrice(vehicle.priceCents)}</strong>
              <span className={`status status-${vehicle.status}`}>{statusLabels[vehicle.status]}</span>
              <div className="row-actions">
                <form action={toggleVehicleFeaturedAction}>
                  <input type="hidden" name="id" value={vehicle.id} />
                  <input type="hidden" name="featured" value={vehicle.featured ? "false" : "true"} />
                  <button type="submit" className={vehicle.featured ? "text-button featured-active" : "text-button"}>
                    {vehicle.featured ? "★ Em destaque" : "Adicionar em destaques"}
                  </button>
                </form>
                <form action={updateVehicleStatusAction}>
                  <input type="hidden" name="id" value={vehicle.id} />
                  <input type="hidden" name="status" value={vehicle.status === "published" ? "sold" : "published"} />
                  <button type="submit" className="text-button">{vehicle.status === "published" ? "Marcar vendido" : "Publicar"}</button>
                </form>
                <form action={duplicateVehicleAction}>
                  <input type="hidden" name="id" value={vehicle.id} />
                  <button type="submit" className="text-button">Duplicar</button>
                </form>
                <Link className="text-link" href={`/admin/veiculos/${vehicle.id}/editar`}>Editar</Link>
                <DeleteVehicle id={vehicle.id} title={`${vehicle.brand} ${vehicle.model}`} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="admin-empty"><h2>{hasFilters ? "Nenhum veículo encontrado para este filtro." : "Seu primeiro anúncio começa aqui."}</h2><p>{hasFilters ? "Altere os termos ou limpe o filtro para ver todo o estoque." : "Adicione um veículo e escolha quando publicá-lo no catálogo."}</p>{hasFilters ? <Link href="/admin/veiculos" className="text-link">Limpar filtros</Link> : <Link href="/admin/veiculos/novo" className="text-link">Cadastrar primeiro veículo ↗</Link>}</section>
      )}
      <Pagination page={page} hasNext={hasNext} path="/admin/veiculos" query={query} params={{ status, combustivel: fuel, cambio: transmission, ordem: sort !== "recentes" ? sort : undefined }} />
    </>
  );
}
