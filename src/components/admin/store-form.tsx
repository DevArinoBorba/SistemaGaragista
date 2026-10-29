"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import type { StoreSettings } from "@/db/schema/store";
import { saveStoreSettingsAction } from "@/features/store/actions";
import { formatCnpj, formatPhone } from "@/features/store/schema";

export function StoreForm({ store }: { store: StoreSettings }) {
  const [state, action, pending] = useActionState(saveStoreSettingsAction, {});
  const field = (
    name: string,
    label: string,
    type = "text",
    value: string = "",
    required = false,
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
      <fieldset disabled={pending}>
        <legend>Identidade comercial</legend>
        <div className="form-grid">
          {field("name", "Nome comercial", "text", store.name, true, {
            maxLength: 80,
            placeholder: "Ex.: Garagista Motors",
          })}
          {field("tagline", "Slogan ou apresentação", "text", store.tagline, false, {
            maxLength: 160,
            placeholder: "Ex.: Seminovos revisados com procedência",
          })}
          {field("cnpj", "CNPJ", "text", store.cnpj ? formatCnpj(store.cnpj) : "", false, {
            maxLength: 18,
            inputMode: "numeric",
            placeholder: "00.000.000/0001-00",
          })}
          {field("openingHours", "Horário de atendimento", "text", store.openingHours, false, {
            maxLength: 160,
            placeholder: "Ex.: Seg a sex, 9h às 18h · Sáb, 9h às 13h",
          })}
        </div>
      </fieldset>

      <fieldset disabled={pending}>
        <legend>Canais de atendimento e localização</legend>
        <div className="form-grid">
          {field("whatsapp", "WhatsApp", "text", store.whatsapp ? formatPhone(store.whatsapp) : "", false, {
            maxLength: 20,
            inputMode: "tel",
            placeholder: "(11) 99999-9999",
          })}
          {field("phone", "Telefone", "text", store.phone ? formatPhone(store.phone) : "", false, {
            maxLength: 20,
            inputMode: "tel",
            placeholder: "(11) 3333-4444",
          })}
          {field("email", "E-mail de contato", "email", store.email, false, {
            maxLength: 254,
            placeholder: "contato@loja.com.br",
          })}
          {field("address", "Endereço", "text", store.address, false, {
            maxLength: 240,
            placeholder: "Ex.: Av. Brasil, 1500 - Centro, São Paulo - SP",
          })}
        </div>
      </fieldset>

      <fieldset disabled={pending}>
        <legend>Redes sociais</legend>
        <p>Preencha apenas as redes que deseja exibir no rodapé do site.</p>
        <div className="form-grid">
          {field("instagramUrl", "Instagram", "url", store.instagramUrl, false, {
            maxLength: 255,
            placeholder: "https://instagram.com/sualoja",
          })}
          {field("youtubeUrl", "YouTube", "url", store.youtubeUrl, false, {
            maxLength: 255,
            placeholder: "https://youtube.com/@sualoja",
          })}
          {field("tiktokUrl", "TikTok", "url", store.tiktokUrl, false, {
            maxLength: 255,
            placeholder: "https://tiktok.com/@sualoja",
          })}
          {field("facebookUrl", "Facebook", "url", store.facebookUrl, false, {
            maxLength: 255,
            placeholder: "https://facebook.com/sualoja",
          })}
        </div>
      </fieldset>

      <fieldset disabled={pending}>
        <legend>Imagens da loja</legend>
        <p>Envie imagens JPEG, PNG ou WebP de até 8 MB cada.</p>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="logo">Logotipo da loja (opcional)</label>
            <input id="logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp" />
            {store.logoPhoto && (
              <div className="photo-editor">
                <div>
                  <div className="edit-photo">
                    <Image
                      src={`/api/store/${store.logoPhoto}`}
                      alt="Logotipo atual da loja"
                      fill
                      sizes="160px"
                      unoptimized
                    />
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" name="keepLogo" value="yes" defaultChecked />
                    Manter logotipo atual
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="hero">Imagem de capa da loja (opcional)</label>
            <input id="hero" name="hero" type="file" accept="image/jpeg,image/png,image/webp" />
            {store.heroPhoto && (
              <div className="photo-editor">
                <div>
                  <div className="edit-photo">
                    <Image
                      src={`/api/store/${store.heroPhoto}`}
                      alt="Imagem de capa atual da loja"
                      fill
                      sizes="160px"
                      unoptimized
                    />
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" name="keepHero" value="yes" defaultChecked />
                    Manter imagem de capa atual
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </fieldset>

      {state.error && (
        <div className="form-error" role="alert" tabIndex={-1}>
          {state.error}
        </div>
      )}

      <div className="form-actions">
        <Link className="button secondary" href="/admin/veiculos">
          Voltar ao estoque
        </Link>
        <button className="button primary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar dados da loja"}
        </button>
      </div>
    </form>
  );
}
