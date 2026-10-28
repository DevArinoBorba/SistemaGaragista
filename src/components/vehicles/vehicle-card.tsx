"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type TouchEvent } from "react";
import type { Vehicle } from "@/db/schema/vehicles";
import { formatMileage, formatPrice, isRecentVehicle } from "@/features/vehicles/schema";
import { ArrowUpRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const photoUrl = (vehicle: Vehicle, photo: string) => `/api/photos/${vehicle.id}/${photo}`;

function CardPhotoStage({
  vehicle,
  title,
  className,
  sizes,
  showBadge = false,
}: {
  vehicle: Vehicle;
  title: string;
  className: string;
  sizes: string;
  showBadge?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const total = vehicle.photos.length;

  function goTo(index: number) {
    if (!total) return;
    setActive((index + total) % total);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX === null || total <= 1) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    if (Math.abs(deltaX) > 36) {
      goTo(deltaX < 0 ? active + 1 : active - 1);
    }
    setTouchStartX(null);
  }

  return (
    <div className={className} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {showBadge && isRecentVehicle(vehicle.createdAt) && <span className="vehicle-badge">Novo no estoque</span>}
      {total > 0 ? (
        <>
          <div className="card-track" style={{ transform: `translateX(-${active * 100}%)` }}>
            {vehicle.photos.map((photo, index) => (
              <Link
                key={photo}
                href={`/veiculos/${vehicle.id}`}
                className="card-slide"
                tabIndex={index === active ? undefined : -1}
                aria-label={`${title}, foto ${index + 1} de ${total}`}
              >
                <Image
                  className="vehicle-photo"
                  src={photoUrl(vehicle, photo)}
                  alt={index === 0 ? title : `${title}, foto ${index + 1}`}
                  fill
                  sizes={sizes}
                  unoptimized
                />
              </Link>
            ))}
          </div>
          {total > 1 && (
            <>
              <button
                type="button"
                className="gallery-arrow gallery-arrow-prev card-arrow"
                onClick={() => goTo(active - 1)}
                aria-label={`Foto anterior de ${title}`}
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                className="gallery-arrow gallery-arrow-next card-arrow"
                onClick={() => goTo(active + 1)}
                aria-label={`Próxima foto de ${title}`}
              >
                <ChevronRightIcon />
              </button>
              <span className="gallery-counter">{active + 1} / {total}</span>
            </>
          )}
        </>
      ) : (
        <Link href={`/veiculos/${vehicle.id}`} className="card-slide">
          <span className="no-photo">Foto não adicionada</span>
        </Link>
      )}
    </div>
  );
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const title = `${vehicle.brand} ${vehicle.model}`;
  return (
    <article className="vehicle-card">
      <CardPhotoStage
        vehicle={vehicle}
        title={title}
        className="vehicle-picture"
        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
        showBadge
      />
      <Link href={`/veiculos/${vehicle.id}`} className="vehicle-link">
        <div className="vehicle-copy">
          <h3 title={title}>{title}</h3>
          <p className="vehicle-version" title={vehicle.version || vehicle.fuel}>{vehicle.version || vehicle.fuel}</p>
          <ul className="vehicle-specs" aria-label="Características">
            <li>{vehicle.manufactureYear}/{vehicle.modelYear}</li>
            <li>{formatMileage(vehicle.mileage)}</li>
            <li>{vehicle.transmission}</li>
          </ul>
          <div className="price-line">
            <strong>{formatPrice(vehicle.priceCents)}</strong>
            <span className="price-arrow"><ArrowUpRightIcon /></span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ShowcaseCard({ vehicle }: { vehicle: Vehicle }) {
  const title = `${vehicle.brand} ${vehicle.model}`;
  return (
    <article className="showcase-card">
      <CardPhotoStage
        vehicle={vehicle}
        title={title}
        className="showcase-picture"
        sizes="(max-width: 700px) 90vw, 48vw"
      />
      <Link href={`/veiculos/${vehicle.id}`} className="showcase-overlay">
        <span className="showcase-title">{title}</span>
        <strong className="showcase-price">{formatPrice(vehicle.priceCents)}</strong>
      </Link>
    </article>
  );
}
