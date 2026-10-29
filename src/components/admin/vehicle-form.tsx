"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Vehicle } from "@/db/schema/vehicles";
import { TrashIcon } from "@/components/icons";
import { fuels, priceToInput, statusLabels, transmissions } from "@/features/vehicles/schema";
import { saveVehicleAction } from "@/features/vehicles/actions";

type PendingPhoto = {
  id: string;
  file: File;
  url: string;
};

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const [state, action, pending] = useActionState(saveVehicleAction, {});
  const [keptPhotos, setKeptPhotos] = useState<string[]>(() => vehicle?.photos ?? []);
  const [coverPhoto, setCoverPhoto] = useState<string>(() => vehicle?.photos[0] ?? "");
  const [newPhotos, setNewPhotos] = useState<PendingPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      newPhotos.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [newPhotos]);

  function removeExistingPhoto(photo: string) {
    setKeptPhotos((prev) => {
      const next = prev.filter((item) => item !== photo);
      if (coverPhoto === photo) {
        setCoverPhoto(next[0] ?? "");
      }
      return next;
    });
  }

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setNewPhotos((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return selected.map((file, idx) => ({
        id: `${file.name}-${file.size}-${idx}`,
        file,
        url: URL.createObjectURL(file),
      }));
    });
  }

  function removeNewPhoto(idToRemove: string) {
    setNewPhotos((prev) => {
      const removed = prev.find((item) => item.id === idToRemove);
      if (removed) URL.revokeObjectURL(removed.url);
      const next = prev.filter((item) => item.id !== idToRemove);
      if (fileInputRef.current && typeof DataTransfer !== "undefined") {
        const dt = new DataTransfer();
        next.forEach((item) => dt.items.add(item.file));
        fileInputRef.current.files = dt.files;
      }
      return next;
    });
  }

  const field = (
    name: string,
    label: string,
    type = "text",
    value: string | number = "",
    required = true,
    extra: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {!required && <span> (opcional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        aria-invalid={!!state.fields?.[name]}
        aria-describedby={state.fields?.[name] ? `${name}-error` : undefined}
        {...extra}
      />
      {state.fields?.[name] && (
        <p id={`${name}-error`} className="field-error">
          {state.fields[name]?.[0]}
        </p>
      )}
    </div>
  );

  return (
    <form action={action} className="vehicle-form" onReset={(event) => event.preventDefault()}>
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <fieldset disabled={pending}>
        <legend>Dados do veículo</legend>
        <div className="form-grid">
          {field("brand", "Marca", "text", vehicle?.brand, true, { maxLength: 80, placeholder: "Ex.: Volkswagen" })}
          {field("model", "Modelo", "text", vehicle?.model, true, { maxLength: 80, placeholder: "Ex.: Polo" })}
          {field("version", "Versão", "text", vehicle?.version, false, { maxLength: 120, placeholder: "Ex.: Comfortline 1.0 TSI" })}
          {field("color", "Cor", "text", vehicle?.color, true, { maxLength: 40 })}
          {field("manufactureYear", "Ano de fabricação", "number", vehicle?.manufactureYear, true, { min: 1886, max: new Date().getFullYear() + 1 })}
          {field("modelYear", "Ano-modelo", "number", vehicle?.modelYear, true, { min: 1886, max: new Date().getFullYear() + 1 })}
          {field("mileage", "Quilometragem (km)", "number", vehicle?.mileage ?? 0, true, { min: 0, max: 9999999, step: 1 })}
          {field("price", "Preço (R$)", "text", vehicle ? priceToInput(vehicle.priceCents) : "", true, { inputMode: "decimal", placeholder: "Ex.: 75900,00", maxLength: 12 })}
          <div className="field">
            <label htmlFor="fuel">Combustível</label>
            <select
              id="fuel"
              name="fuel"
              defaultValue={vehicle?.fuel ?? ""}
              required
              aria-invalid={!!state.fields?.fuel}
              aria-describedby={state.fields?.fuel ? "fuel-error" : undefined}
            >
              <option value="" disabled>Selecione</option>
              {fuels.map((fuel) => <option key={fuel}>{fuel}</option>)}
            </select>
            {state.fields?.fuel && <p id="fuel-error" className="field-error">{state.fields.fuel[0]}</p>}
          </div>
          <div className="field">
            <label htmlFor="transmission">Câmbio</label>
            <select
              id="transmission"
              name="transmission"
              defaultValue={vehicle?.transmission ?? ""}
              required
              aria-invalid={!!state.fields?.transmission}
              aria-describedby={state.fields?.transmission ? "transmission-error" : undefined}
            >
              <option value="" disabled>Selecione</option>
              {transmissions.map((type) => <option key={type}>{type}</option>)}
            </select>
            {state.fields?.transmission && <p id="transmission-error" className="field-error">{state.fields.transmission[0]}</p>}
          </div>
        </div>
        <div className="field full-field">
          <label htmlFor="description">Descrição (opcional)</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={5000}
            defaultValue={vehicle?.description}
            aria-invalid={!!state.fields?.description}
            aria-describedby={state.fields?.description ? "description-error" : undefined}
            placeholder="Conte mais sobre o veículo, os equipamentos e o estado de conservação."
          />
          {state.fields?.description && <p id="description-error" className="field-error">{state.fields.description[0]}</p>}
        </div>
      </fieldset>

      <fieldset disabled={pending}>
        <legend>Fotos do anúncio</legend>
        <p>Até 12 fotos JPEG, PNG ou WebP. Máximo de 8 MB por foto e 20 MB por envio. A primeira foto é a capa.</p>

        {vehicle && keptPhotos.length > 0 && (
          <div className="photo-editor">
            {keptPhotos.map((photo, index) => (
              <div key={photo} className="photo-editor-item">
                <input type="hidden" name="keepPhotos" value={photo} />
                <div className="edit-photo">
                  <Image
                    className="edit-photo-img"
                    src={`/api/photos/${vehicle.id}/${photo}`}
                    alt={`Foto ${index + 1} do veículo`}
                    width={280}
                    height={210}
                    unoptimized
                  />
                  <button
                    type="button"
                    className="photo-trash-btn"
                    onClick={() => removeExistingPhoto(photo)}
                    aria-label={`Apagar foto ${index + 1}`}
                    title="Apagar foto"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <label className="checkbox-label">
                  <input
                    type="radio"
                    name="cover"
                    value={photo}
                    checked={coverPhoto === photo}
                    onChange={() => setCoverPhoto(photo)}
                  />
                  Usar como capa
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="field">
          <label htmlFor="photos">Adicionar fotos (opcional)</label>
          <input
            ref={fileInputRef}
            id="photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFilesChange}
          />
        </div>

        {newPhotos.length > 0 && (
          <div className="new-photos-section">
            <p className="field-help">Novas fotos selecionadas ({newPhotos.length}):</p>
            <div className="photo-editor">
              {newPhotos.map((item, index) => (
                <div key={item.id} className="photo-editor-item">
                  <div className="edit-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="edit-photo-img"
                      src={item.url}
                      alt={`Nova foto ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="photo-trash-btn"
                      onClick={() => removeNewPhoto(item.id)}
                      aria-label={`Apagar nova foto ${index + 1}`}
                      title="Apagar foto"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <fieldset disabled={pending}>
        <legend>Publicação</legend>
        <div className="field">
          <label htmlFor="status">Situação do anúncio</label>
          <select id="status" name="status" defaultValue={vehicle?.status ?? "draft"}>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <p className="field-help">Somente anúncios publicados aparecem no catálogo. Rascunhos e vendidos ficam no painel.</p>
        </div>
      </fieldset>

      {state.error && (
        <div className="form-error" role="alert" tabIndex={-1}>
          {state.error}
        </div>
      )}

      <div className="form-actions">
        <Link className="button secondary" href="/admin/veiculos">Cancelar</Link>
        <button className="button primary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar veículo"}
        </button>
      </div>
    </form>
  );
}
