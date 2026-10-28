import { describe, expect, it } from "vitest";
import { buildMapUrl, buildWhatsAppUrl, defaultStoreSettings, formatCnpj, formatPhone, isValidCnpj, storeInputSchema } from "./schema";

describe("Store identity and contact validation", () => {
  it("@spec:AC-013 rejeita nome vazio, CNPJ inválido ou com dígito verificador incorreto, telefone curto e e-mail malformado", () => {
    const valid = {
      name: "Garagista Motors",
      tagline: "Seminovos revisados com garantia.",
      cnpj: "12.345.678/0001-95",
      whatsapp: "(11) 99876-5432",
      phone: "(11) 3456-7890",
      email: "contato@garagistamotors.com.br",
      address: "Av. Brasil, 1500 - Centro, São Paulo/SP",
      openingHours: "Seg a Sex 9h às 18h · Sáb 9h às 13h",
    };
    expect(isValidCnpj("12345678000195")).toBe(true);
    expect(isValidCnpj("12345678000199")).toBe(false);
    expect(storeInputSchema.parse(valid)).toMatchObject({
      name: "Garagista Motors",
      cnpj: "12345678000195",
      whatsapp: "11998765432",
      phone: "1134567890",
    });
    for (const invalid of [
      { name: "   " },
      { cnpj: "123" },
      { cnpj: "00.000.000/0000-00" },
      { cnpj: "12.345.678/0001-99" },
      { whatsapp: "12345" },
      { phone: "999" },
      { email: "email-invalido" },
    ]) {
      expect(storeInputSchema.safeParse({ ...valid, ...invalid }).success).toBe(false);
    }
  });

  it("@spec:AC-012 @spec:AC-014 formata CNPJ, telefone e link de WhatsApp do veículo mantendo padrão honesto quando vazio", () => {
    expect(defaultStoreSettings.name).toBe("Garagista");
    expect(defaultStoreSettings.whatsapp).toBe("");
    expect(buildWhatsAppUrl("")).toBe("");
    expect(formatCnpj("12345678000195")).toBe("12.345.678/0001-95");
    expect(formatPhone("11998765432")).toBe("(11) 99876-5432");
    const url = buildWhatsAppUrl("(11) 99876-5432", "Volkswagen Polo 2022/2023");
    expect(url).toContain("https://wa.me/5511998765432?text=");
    expect(decodeURIComponent(url)).toContain("Volkswagen Polo 2022/2023");
    expect(buildMapUrl("")).toBe("");
    expect(buildMapUrl("Av. Paulista, 1000 - São Paulo/SP")).toContain("https://www.google.com/maps/search/?api=1&query=");
  });
});
