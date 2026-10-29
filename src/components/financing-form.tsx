"use client";

import { useState, type FormEvent } from "react";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { formatPhone } from "@/features/store/schema";

type FinancingFormProps = {
  storeName: string;
  whatsapp: string;
  phone: string;
};

function buildFinancingWhatsApp(whatsapp: string, text: string) {
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return "";
  const full = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

export function FinancingForm({ storeName, whatsapp, phone }: FinancingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const directWhatsappUrl = buildFinancingWhatsApp(
    whatsapp,
    `Olá! Gostaria de simular um financiamento com a ${storeName}.`,
  );
  const displayPhone = phone || whatsapp;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const tel = String(form.get("phone") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (!name || !email || !tel) return;

    const summary = [
      `Olá! Quero solicitar uma simulação de financiamento na ${storeName}.`,
      `Nome: ${name}`,
      `E-mail: ${email}`,
      `Telefone/WhatsApp: ${tel}`,
      message ? `Mensagem: ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitted(true);
    const targetUrl = buildFinancingWhatsApp(whatsapp, summary);
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="financing-card financing-form-card">
      <h3>Dados Pessoais</h3>
      <form className="financing-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="fin-name">Nome Completo *</label>
          <input
            id="fin-name"
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="Seu nome completo"
          />
        </div>
        <div className="field">
          <label htmlFor="fin-email">E-mail *</label>
          <input
            id="fin-email"
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder="seu@email.com"
          />
        </div>
        <div className="field">
          <label htmlFor="fin-phone">Telefone / WhatsApp *</label>
          <input
            id="fin-phone"
            name="phone"
            type="tel"
            required
            maxLength={24}
            placeholder="(11) 99999-9999"
          />
        </div>
        <div className="field">
          <label htmlFor="fin-message">
            Mensagem <span>(opcional)</span>
          </label>
          <textarea
            id="fin-message"
            name="message"
            rows={4}
            maxLength={600}
            placeholder="Conte-nos mais sobre o veículo ou sua necessidade de financiamento..."
          />
        </div>

        {submitted && (
          <p className="financing-feedback" role="status">
            {directWhatsappUrl
              ? "Dados preparados! Finalize o envio pelo WhatsApp que abrimos para você."
              : "Solicitação registrada! Utilize os canais de atendimento da loja abaixo para concluir."}
          </p>
        )}

        <button type="submit" className="button primary financing-submit">
          Solicitar Financiamento
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
                <WhatsAppIcon /> WhatsApp Financiamento
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
