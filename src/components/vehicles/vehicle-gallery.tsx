"use client";

import Image from "next/image";
import { useState, type KeyboardEvent, type TouchEvent } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

type VehicleGalleryProps = {
  vehicleId: string;
  title: string;
  photos: string[];
};

export function VehicleGallery({ vehicleId, title, photos }: VehicleGalleryProps) {
  const [active, setActive] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!photos.length) {
    return (
      <div className="gallery">
        <div className="no-photo detail-placeholder">Fotos ainda não adicionadas</div>
      </div>
    );
  }

  function goTo(index: number) {
    setActive((index + photos.length) % photos.length);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX === null || photos.length <= 1) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    if (Math.abs(deltaX) > 36) {
      goTo(deltaX < 0 ? active + 1 : active - 1);
    }
    setTouchStartX(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (photos.length <= 1) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    }
  }

  return (
    <div className="gallery" onKeyDown={handleKeyDown}>
      <div className="gallery-stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="gallery-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {photos.map((photo, index) => (
            <figure
              key={photo}
              id={`foto-${index + 1}`}
              className="gallery-photo"
              tabIndex={0}
              aria-label={`${title}, foto ${index + 1} de ${photos.length}`}
            >
              <Image
                src={`/api/photos/${vehicleId}/${photo}`}
                alt={`${title}, foto ${index + 1}`}
                fill
                sizes="(max-width: 800px) 100vw, 60vw"
                priority={index === 0}
                unoptimized
              />
            </figure>
          ))}
        </div>
        {photos.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-arrow gallery-arrow-prev"
              onClick={() => goTo(active - 1)}
              aria-label="Foto anterior"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="gallery-arrow gallery-arrow-next"
              onClick={() => goTo(active + 1)}
              aria-label="Próxima foto"
            >
              <ChevronRightIcon />
            </button>
            <span className="gallery-counter" aria-live="polite">
              {active + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbs" role="group" aria-label="Miniaturas das fotos">
          {photos.map((photo, index) => (
            <button
              key={photo}
              type="button"
              className="gallery-thumb"
              aria-label={`Ver foto ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => goTo(index)}
            >
              <Image
                src={`/api/photos/${vehicleId}/${photo}`}
                alt=""
                fill
                sizes="140px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
