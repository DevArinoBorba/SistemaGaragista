"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

type VehicleCarouselProps = {
  id: string;
  title: string;
  description?: string;
  size?: "feature" | "compact";
  autoPlayMs?: number;
  children: ReactNode;
};

const pad = (value: number) => String(value).padStart(2, "0");

export function VehicleCarousel({ id, title, description, size = "feature", autoPlayMs, children }: VehicleCarouselProps) {
  const slides = Children.toArray(children);
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: slides.length <= 1 });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const origin = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).scrollPaddingLeft || "0");
    let nearest = 0;
    let distance = Infinity;
    items.forEach((item, index) => {
      const gap = Math.abs(item.getBoundingClientRect().left - origin);
      if (gap < distance) {
        distance = gap;
        nearest = index;
      }
    });
    const start = track.scrollLeft <= 4;
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    setActive(nearest);
    setEdges((current) => (current.start === start && current.end === end ? current : { start, end }));
  }, []);
  const frame = useRef(0);
  const onScroll = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(measure);
  }, [measure]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(frame.current);
    };
  }, [measure]);

  const goToSlide = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track || !slides.length) return;
    const clamped = Math.min(Math.max(index, 0), slides.length - 1);
    const target = track.children[clamped] as HTMLElement | undefined;
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offset = target.getBoundingClientRect().left - track.getBoundingClientRect().left - parseFloat(getComputedStyle(track).scrollPaddingLeft || "0");
    track.scrollBy({ left: offset, behavior: reduce ? "auto" : "smooth" });
  }, [slides.length]);

  useEffect(() => {
    if (!autoPlayMs || slides.length <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (atEnd || active >= slides.length - 1) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        goToSlide(active + 1);
      }
    }, autoPlayMs);
    return () => window.clearInterval(timer);
  }, [active, autoPlayMs, goToSlide, paused, slides.length]);

  function go(direction: -1 | 1) {
    goToSlide(active + direction);
  }

  const titleId = `${id}-title`;
  return (
    <section
      className={`carousel carousel-${size}`}
      aria-labelledby={titleId}
      aria-roledescription="carrossel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="carousel-head">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {slides.length > 1 && (
          <div className="carousel-controls">
            <span className="carousel-counter" aria-hidden="true">
              {pad(active + 1)} <span>/ {pad(slides.length)}</span>
            </span>
            <button type="button" className="round-button" onClick={() => go(-1)} disabled={edges.start} aria-label="Veículo anterior" aria-controls={`${id}-track`}>
              <ChevronLeftIcon />
            </button>
            <button type="button" className="round-button" onClick={() => go(1)} disabled={edges.end} aria-label="Próximo veículo" aria-controls={`${id}-track`}>
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
      <ul id={`${id}-track`} ref={trackRef} className="carousel-track" onScroll={onScroll} tabIndex={0} aria-label={`${title}: use as setas do teclado para navegar`}>
        {slides.map((slide, index) => (
          <li
            key={index}
            className="carousel-slide"
            data-active={index === active ? "true" : undefined}
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${slides.length}`}
          >
            {slide}
          </li>
        ))}
      </ul>
      {slides.length > 1 && (
        <div className="carousel-progress" aria-hidden="true">
          <span style={{ width: `${((active + 1) / slides.length) * 100}%` }} />
        </div>
      )}
    </section>
  );
}
