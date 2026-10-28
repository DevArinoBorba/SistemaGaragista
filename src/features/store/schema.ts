import { z } from "zod";
import type { StoreSettings } from "@/db/schema/store";

export const defaultStoreSettings: StoreSettings = {
  id: "default",
  name: "Garagista",
  tagline: "",
  cnpj: "",
  whatsapp: "",
  phone: "",
  email: "",
  address: "",
  openingHours: "",
  logoPhoto: "",
  heroPhoto: "",
  updatedAt: new Date(0),
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function isValidCnpj(value: string) {
  const digits = digitsOnly(value);
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const calcDigit = (length: number) => {
    let sum = 0;
    let weight = length - 7;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * weight--;
      if (weight < 2) weight = 9;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return calcDigit(12) === Number(digits[12]) && calcDigit(13) === Number(digits[13]);
}

export const storeInputSchema = z.object({
  name: z.string().trim().min(1, "Nome comercial é obrigatório.").max(80, "Use até 80 caracteres."),
  tagline: z.string().trim().max(160, "Use até 160 caracteres.").default(""),
  cnpj: z.string().trim().default("").transform(digitsOnly).refine((digits) => digits === "" || isValidCnpj(digits), "Informe um CNPJ válido com 14 dígitos."),
  whatsapp: z.string().trim().default("").transform(digitsOnly).refine((digits) => digits === "" || (digits.length >= 10 && digits.length <= 15), "Informe um WhatsApp válido com DDD."),
  phone: z.string().trim().default("").transform(digitsOnly).refine((digits) => digits === "" || (digits.length >= 10 && digits.length <= 15), "Informe um telefone válido com DDD."),
  email: z.string().trim().max(254, "Use até 254 caracteres.").default("").refine((val) => val === "" || z.email().safeParse(val).success, "Informe um e-mail válido."),
  address: z.string().trim().max(240, "Use até 240 caracteres.").default(""),
  openingHours: z.string().trim().max(160, "Use até 160 caracteres.").default(""),
});

export type StoreInput = z.infer<typeof storeInputSchema>;
export type StoreFormState = { error?: string; saved?: boolean; fields?: Record<string, string[]> };

export function formatCnpj(value: string) {
  const digits = digitsOnly(value);
  if (digits.length !== 14) return value;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function formatPhone(value: string) {
  const raw = digitsOnly(value);
  const digits = raw.length >= 12 && raw.startsWith("55") ? raw.slice(2) : raw;
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value;
}

export function buildWhatsAppUrl(whatsapp: string, vehicleSummary?: string) {
  const digits = digitsOnly(whatsapp);
  if (!digits) return "";
  const full = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
  const text = vehicleSummary
    ? `Olá! Vi o anúncio do ${vehicleSummary} no site e gostaria de mais informações.`
    : "Olá! Gostaria de atendimento sobre o estoque da loja.";
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

export function buildMapUrl(address: string) {
  const trimmed = address.trim();
  if (!trimmed) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}
