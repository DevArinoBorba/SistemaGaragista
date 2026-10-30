"use client";

import { useState, type FormEvent } from "react";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { formatPhone } from "@/features/store/schema";
import { fuels, transmissions } from "@/features/vehicles/schema";

type SellVehicleFormProps = {
  storeName: string;
  whatsapp: string;
  phone: string;
};

const modalities = [
  { id: "Venda à vista", label: "Venda à vista", desc: "Pagamento rápido" },
  { id: "Dar na troca", label: "Dar na troca", desc: "Usar como entrada" },
  { id: "Consignação", label: "Consignação", desc: "Valorização máxima" },
] as const;

function buildSellWhatsApp(whatsapp: string, text: string) {
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return "";
  const full = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

export function SellVehicleForm({ storeName, whatsapp, phone }: SellVehicleFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [modality, setModality] = useState<string>(modalities[0].id);

  const directWhatsappUrl = buildSellWhatsApp(
    whatsapp,
    `Olá! Gostaria de avaliar meu veículo para negociação na ${storeName}.`,
  );
  const displayPhone = phone || whatsapp;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const tel = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const vehicleModel = String(form.get("vehicleModel") ?? "").trim();
    const version = String(form.get("version") ?? "").trim();
    const year = String(form.get("year") ?? "").trim();
    const mileage = String(form.get("mileage") ?? "").trim();
    const fuel = String(form.get("fuel") ?? "").trim();
    const transmission = String(form.get("transmission") ?? "").trim();
    const color = String(form.get("color") ?? "").trim();
    const expectedPrice = String(form.get("expectedPrice") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    if (!name || !tel || !vehicleModel || !year || !mileage) return;

    const summary = [
      `Olá! Quero solicitar a avaliação do meu veículo na ${storeName}.`,
      "",
      `*Modalidade:* ${modality}`,
      `*Veículo:* ${vehicleModel}${version ? ` (${version})` : ""}`,
      `*Ano:* ${year} | *KM:* ${mileage} km`,
      `*Câmbio:* ${transmission} | *Combustível:* ${fuel}`,
      color ? `*Cor:* ${color}` : "",
      expectedPrice ? `*Valor pretendido:* R$ ${expectedPrice}` : "",
      notes ? `*Observações:* ${notes}` : "",
      "",
      `*Cliente:* ${name}`,
      `*WhatsApp:* ${tel}`,
      email ? `*E-mail:* ${email}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitted(true);
    const targetUrl = buildSellWhatsApp(whatsapp, summary);
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="financing-card financing-form-card">
      <h3>Dados para Avaliação</h3>
      <form className="financing-form" onSubmit={handleSubmit}>
        <div className="field">
          <span className="sell-section-label">Qual o seu objetivo? *</span>
          <div className="sell-modality-grid" role="radiogroup" aria-label="Modalidade de negociação">
            {modalities.map((item) => {
              const active = modality === item.id;
              return (
                <label
                  key={item.id}
                  className={`sell-modality-option${active ? " is-active" : ""}`}
                >
                  <input
                    type="radio"
                    name="modality"
                    value={item.id}
                    checked={active}
                    onChange={() => setModality(item.id)}
                  />
                  <strong>{item.label}</strong>
                  <span>{item.desc}</span>
                </label>
              );
            })}
          </div>
        </div>

        <h4 className="sell-subhead">Sobre o Veículo</h4>
        <div className="sell-fields-grid">
          <div className="field">
            <label htmlFor="sell-vehicle">Marca e Modelo *</label>
            <input
              id="sell-vehicle"
              name="vehicleModel"
              type="text"
              required
              maxLength={100}
              placeholder="Ex.: Toyota Hilux SW4"
            />
          </div>
          <div className="field">
            <label htmlFor="sell-version">
              Versão <span>(opcional)</span>
            </label>
            <input
              id="sell-version"
              name="version"
              type="text"
              maxLength={120}
              placeholder="Ex.: SRX 2.8 Turbo Diesel 4x4"
            />
          </div>
          <div className="field">
            <label htmlFor="sell-year">Ano (Fab./Mod.) *</label>
            <input
              id="sell-year"
              name="year"
              type="text"
              required
              maxLength={15}
              placeholder="Ex.: 2023/2024"
            />
          </div>
          <div className="field">
            <label htmlFor="sell-mileage">Quilometragem (km) *</label>
            <input
              id="sell-mileage"
              name="mileage"
              type="text"
              inputMode="numeric"
              required
              maxLength={15}
              placeholder="Ex.: 28.000"
            />
          </div>
          <div className="field">
            <label htmlFor="sell-fuel">Combustível *</label>
            <select id="sell-fuel" name="fuel" defaultValue="Flex" required>
              {fuels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sell-transmission">Câmbio *</label>
            <select id="sell-transmission" name="transmission" defaultValue="Automático" required>
              {transmissions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sell-color">Cor *</label>
            <input
              id="sell-color"
              name="color"
              type="text"
              required
              maxLength={40}
              placeholder="Ex.: Branco Pérola"
            />
          </div>
          <div className="field">
            <label htmlFor="sell-price">
              Valor pretendido (R$) <span>(opcional)</span>
            </label>
            <input
              id="sell-price"
              name="expectedPrice"
              type="text"
              inputMode="decimal"
              maxLength={20}
              placeholder="Ex.: 245.000,00"
            />
          </div>
        </div>

        <h4 className="sell-subhead">Seus Dados de Contato</h4>
        <div className="sell-fields-grid">
          <div className="field">
            <label htmlFor="sell-name">Nome Completo *</label>
            <input
              id="sell-name"
              name="name"
              type="text"
              required
              maxLength={120}
              placeholder="Seu nome completo"
            />
          </div>
          <div className="field">
            <label htmlFor="sell-phone">Telefone / WhatsApp *</label>
            <input
              id="sell-phone"
              name="phone"
              type="tel"
              required
              maxLength={24}
              placeholder="(67) 99999-9999"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="sell-email">
            E-mail <span>(opcional)</span>
          </label>
          <input
            id="sell-email"
            name="email"
            type="email"
            maxLength={254}
            placeholder="seu@email.com"
          />
        </div>

        <div className="field">
          <label htmlFor="sell-notes">
            Diferenciais e Estado do Veículo <span>(opcional)</span>
          </label>
          <textarea
            id="sell-notes"
            name="notes"
            rows={3}
            maxLength={600}
            placeholder="Conte se é único dono, revisões na concessionária, pneus novos, blindado ou qual carro do estoque tem interesse na troca..."
          />
        </div>

        {submitted && (
          <p className="financing-feedback" role="status">
            {directWhatsappUrl
              ? "Dados do veículo preparados! Finalize o envio pelo WhatsApp que abrimos para você."
              : "Solicitação de avaliação registrada! Utilize os canais da loja abaixo para concluir."}
          </p>
        )}

        <button type="submit" className="button primary financing-submit">
          Solicitar Avaliação Gratuita
        </button>

        {(directWhatsappUrl || displayPhone) && (
          <div className="financing-quick-actions">
            {directWhatsappUrl && (
              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button secondary financing-alt-btn"
              >
                <WhatsAppIcon /> Avaliar via WhatsApp
              </a>
            )}
            {displayPhone && (
              <a href={`tel:${displayPhone}`} className="button secondary financing-alt-btn">
                <PhoneIcon /> {formatPhone(displayPhone)}
              </a>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
