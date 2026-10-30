import type { Vehicle } from "@/db/schema/vehicles";
import { formatComparisonPrice, resolveComparisonPrices } from "@/features/vehicles/schema";

function WebmotorsBadge() {
  return (
    <span className="price-compare-wm-badge" aria-label="Webmotors">
      <svg className="price-compare-wm-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#f3123c" />
        <path
          d="M7.5 7.2v9.6M12 7.2v9.6M16.5 7.2v9.6M7.5 12h9"
          stroke="#ffffff"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <circle cx="7.5" cy="7.2" r="1.35" fill="#ffffff" />
        <circle cx="12" cy="7.2" r="1.35" fill="#ffffff" />
        <circle cx="16.5" cy="7.2" r="1.35" fill="#ffffff" />
        <circle cx="7.5" cy="16.8" r="1.35" fill="#ffffff" />
        <circle cx="12" cy="16.8" r="1.35" fill="#ffffff" />
        <circle cx="16.5" cy="16.8" r="1.35" fill="#ffffff" />
      </svg>
      <span className="price-compare-wm-text">webmotors</span>
    </span>
  );
}

export function PriceComparisonCard({
  vehicle,
}: {
  vehicle: Pick<Vehicle, "brand" | "model" | "priceCents" | "marketPriceCents" | "fipePriceCents">;
}) {
  const { announcedPriceCents, marketPriceCents, fipePriceCents } = resolveComparisonPrices(vehicle);
  const modelLabel = `${vehicle.brand.toUpperCase()} ${vehicle.model.toUpperCase()}`;

  return (
    <section className="price-compare-card" aria-labelledby="price-compare-title">
      <h2 id="price-compare-title" className="price-compare-title">
        Compare os preços
      </h2>
      <div className="price-compare-grid">
        <div className="price-compare-col">
          <div className="price-compare-header">
            <span className="price-compare-label">Valor anunciado</span>
          </div>
          <strong className="price-compare-value">{formatComparisonPrice(announcedPriceCents)}</strong>
        </div>

        <div className="price-compare-col">
          <div className="price-compare-header">
            <WebmotorsBadge />
          </div>
          <strong className="price-compare-value">{formatComparisonPrice(marketPriceCents)}</strong>
          <p className="price-compare-sub">
            Valor médio de carros iguais a este
            <br />
            anunciado na Webmotors
          </p>
        </div>

        <div className="price-compare-col">
          <div className="price-compare-header">
            <span className="price-compare-fipe">fipe</span>
          </div>
          <strong className="price-compare-value">{formatComparisonPrice(fipePriceCents)}</strong>
          <p className="price-compare-sub">
            Valor deste carro
            <br />
            na Tabela Fipe
          </p>
        </div>
      </div>
      <p className="price-compare-footer">
        Consulte aqui <strong>{modelLabel} na tabela FIPE Webmotors</strong> do seu estado.
      </p>
    </section>
  );
}
