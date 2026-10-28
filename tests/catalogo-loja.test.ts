import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { expect as browserExpect } from "@playwright/test";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { storeSettings, vehicles } from "../src/db/schema";
import { removePhoto } from "../src/features/uploads/storage";
import { Integration } from "./helpers/integration";

vi.mock("server-only", () => ({}));
const app = new Integration();
let id = "";
let photo = "";
let secondPhoto = "";
let actionHeaders: Record<string, string> = {};
const { encodeReply } = createRequire(import.meta.url)("next/dist/compiled/react-server-dom-turbopack/client.browser") as { encodeReply: (args: unknown[]) => Promise<FormData | string> };
const draftId = randomUUID();
const soldId = randomUUID();
beforeAll(() => app.start());
afterAll(() => app.stop());

it("@spec:AC-003 catálogo vazio é honesto e responsivo", async () => {
  await app.page.goto(app.base);
  await browserExpect(app.page.getByRole("heading", { name: "Novos caminhos em breve." })).toBeVisible();
  await browserExpect(app.page.locator(".vehicle-card")).toHaveCount(0);
  for (const width of [1440, 768, 390]) {
    await app.page.setViewportSize({ width, height: 1000 });
    expect(await app.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await app.page.screenshot({ path: `.local/qa/catalog-empty-${width}.png`, fullPage: true });
  }
  await app.page.setViewportSize({ width: 1440, height: 1000 });
});

it("@spec:AC-004 login rejeita credenciais inválidas e logout revoga a sessão", async () => {
  await app.page.goto(`${app.base}/admin/login`);
  await app.page.getByLabel("E-mail", { exact: true }).fill(app.email);
  await app.page.getByLabel("Senha", { exact: true }).fill("incorrect-password-for-test");
  await app.page.getByRole("button", { name: "Entrar no painel" }).click();
  await browserExpect(app.page.locator(".form-error[role=alert]")).toContainText("Confira seu e-mail e sua senha");
  await app.login();
  await browserExpect(app.page.getByRole("heading", { name: "Seu estoque" })).toBeVisible();
  await app.page.screenshot({ path: ".local/qa/admin-empty.png", fullPage: true });
  const cookies = await app.context.cookies();
  await app.page.getByRole("button", { name: "Sair", exact: true }).click();
  await browserExpect(app.page).toHaveURL(/\/admin\/login$/);
  const session = await fetch(`${app.base}/api/auth/get-session`, { headers: { Cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; ") } });
  expect(await session.json()).toBeNull();
});

it("@spec:AC-006 cadastro publicado persiste e aparece no catálogo com fotos", async () => {
  await app.login();
  await app.page.getByRole("link", { name: "Adicionar veículo" }).click();
  await app.fillVehicle();
  for (const width of [1440, 390]) {
    await app.page.setViewportSize({ width, height: 1000 });
    expect(await app.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await app.page.screenshot({ path: `.local/qa/vehicle-form-${width}.png`, fullPage: true });
  }
  await app.page.setViewportSize({ width: 1440, height: 1000 });
  const image = await sharp({ create: { width: 960, height: 640, channels: 3, background: "#365b49" } }).jpeg().toBuffer();
  await app.page.getByLabel("Adicionar fotos (opcional)", { exact: true }).setInputFiles([
    { name: "photo-1.jpg", mimeType: "image/jpeg", buffer: image },
    { name: "photo-2.jpg", mimeType: "image/jpeg", buffer: image },
  ]);
  await app.page.getByLabel("Situação do anúncio").selectOption("published");
  const pendingRequest = app.page.waitForRequest((request) => request.method() === "POST" && request.url().includes("/admin/veiculos/novo"));
  await app.page.getByRole("button", { name: "Salvar veículo" }).click();
  const request = await pendingRequest;
  actionHeaders = await request.allHeaders();
  await browserExpect(app.page.getByRole("status")).toContainText("salvo com sucesso");
  const [vehicle] = await app.db.select().from(vehicles).where(eq(vehicles.model, "Polo teste"));
  expect(vehicle.priceCents).toBe(7590029);
  expect(vehicle.photos).toHaveLength(2);
  id = vehicle.id; [photo, secondPhoto] = vehicle.photos;
  await app.page.goto(app.base);
  await browserExpect(app.page.getByRole("heading", { name: "Volkswagen Polo teste" })).toBeVisible();
  await browserExpect(app.page.locator(".vehicle-badge").first()).toHaveText("Novo no estoque");
  await app.page.getByRole("button", { name: "Próxima foto de Volkswagen Polo teste" }).click();
  await browserExpect(app.page.locator(".vehicle-card .gallery-counter").first()).toHaveText("2 / 2");
  await browserExpect(app.page.getByText("R$ 75.900,29", { exact: true })).toBeVisible();
  expect((await fetch(`${app.base}/api/photos/${id}/${photo}`)).status).toBe(200);
});

it("@spec:AC-001 visitantes não veem rascunhos nem veículos vendidos", async () => {
  const base = { brand: "Fixture", manufactureYear: 2022, modelYear: 2023, mileage: 100, priceCents: 100, fuel: "Flex", transmission: "Manual", color: "Prata" };
  await app.db.insert(vehicles).values([{ ...base, id: draftId, model: "Privado rascunho", status: "draft" }, { ...base, id: soldId, model: "Privado vendido", status: "sold" }]);
  await app.page.goto(app.base);
  await browserExpect(app.page.locator(".vehicle-card")).toHaveCount(1);
  await browserExpect(app.page.getByText("Privado rascunho")).toHaveCount(0);
  await browserExpect(app.page.getByText("Privado vendido")).toHaveCount(0);
  await app.page.getByRole("searchbox").fill("marca inexistente");
  await app.page.getByRole("button", { name: "Buscar" }).click();
  await browserExpect(app.page.getByRole("heading", { name: "Nenhum veículo encontrado" })).toBeVisible();
});

it("@spec:AC-002 detalhe e imagens obedecem à publicação", async () => {
  const page = await app.browser.newPage();
  await page.goto(`${app.base}/veiculos/${id}`);
  await browserExpect(page.getByRole("heading", { name: "Volkswagen Polo teste" })).toBeVisible();
  await browserExpect(page.getByText("25.000 km", { exact: true })).toBeVisible();
  await browserExpect(page.getByRole("button", { name: "Próxima foto" })).toBeVisible();
  await page.getByRole("button", { name: "Próxima foto" }).click();
  await browserExpect(page.getByText("2 / 2")).toBeVisible();
  await page.screenshot({ path: ".local/qa/vehicle-detail.png", fullPage: true });
  await page.close();
  for (const hiddenId of [draftId, soldId, randomUUID(), "invalid-id"]) {
    const response = await fetch(`${app.base}/veiculos/${hiddenId}`);
    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("Privado rascunho");
  }
});

it("@spec:AC-005 chamadas diretas sem sessão e origem externa não alteram o estoque", async () => {
  const before = (await app.db.select().from(vehicles)).length;
  const admin = await fetch(`${app.base}/admin/veiculos`, { redirect: "manual" });
  expect(admin.headers.get("location")).toBe("/admin/login");
  expect((await fetch(`${app.base}/api/auth/sign-up/email`, { method: "POST", headers: { "Content-Type": "application/json", Origin: app.base }, body: JSON.stringify({ name: "Attacker", email: "attacker@example.invalid", password: "attacker-test-password" }) })).status).toBe(404);
  const input = new FormData();
  for (const [key, value] of Object.entries({ brand: "Direct request", model: "Unauthorized attempt", manufactureYear: "2022", modelYear: "2023", mileage: "1", price: "1,00", fuel: "Flex", transmission: "Manual", color: "Prata", status: "published" })) input.set(key, value);
  input.set("photos", new File([await sharp({ create: { width: 10, height: 10, channels: 3, background: "#365b49" } }).png().toBuffer()], "direct.png", { type: "image/png" }));
  const body = await encodeReply([{}, input]);
  const anonymousWrite = await fetch(`${app.base}/admin/veiculos/novo`, { method: "POST", headers: { "Next-Action": actionHeaders["next-action"], Origin: app.base }, body });
  expect(await anonymousWrite.text()).toContain("Acesso administrativo necessário");
  const crossOrigin = await fetch(`${app.base}/admin/veiculos/novo`, { method: "POST", headers: { "Next-Action": actionHeaders["next-action"], Cookie: actionHeaders.cookie, Origin: "https://attacker.invalid" }, body });
  expect(crossOrigin.status).toBeGreaterThanOrEqual(400);
  expect((await app.db.select().from(vehicles)).length).toBe(before);
});

it("@spec:AC-007 formulário mantém os valores e mostra erro sem gravar dados inválidos", async () => {
  const before = (await app.db.select().from(vehicles)).length;
  await app.page.goto(`${app.base}/admin/veiculos/novo`);
  await app.fillVehicle("Inválido teste");
  await app.page.getByLabel("Preço (R$)", { exact: true }).fill("-12");
  await app.page.locator("form.vehicle-form").evaluate((form: HTMLFormElement) => { form.noValidate = true; });
  await app.page.getByRole("button", { name: "Salvar veículo" }).click();
  await browserExpect(app.page.locator(".form-error[role=alert]")).toContainText("Confira os campos");
  await browserExpect(app.page.getByLabel("Preço (R$)", { exact: true })).toHaveValue("-12");
  await browserExpect(app.page.getByLabel("Modelo", { exact: true })).toHaveValue("Inválido teste");
  expect((await app.db.select().from(vehicles)).length).toBe(before);
});

it("@spec:AC-010 fotos inválidas são rejeitadas e a capa segue a seleção", async () => {
  await app.page.goto(`${app.base}/admin/veiculos/${id}/editar`);
  await app.page.getByLabel("Adicionar fotos (opcional)", { exact: true }).setInputFiles({ name: "not-a-photo.png", mimeType: "image/png", buffer: Buffer.from("<script>not an image</script>") });
  await app.page.getByRole("button", { name: "Salvar veículo" }).click();
  await browserExpect(app.page.locator(".form-error[role=alert]")).toContainText("imagem");
  expect((await app.db.select().from(vehicles).where(eq(vehicles.id, id)))[0].photos).toEqual([photo, secondPhoto]);
  await app.page.getByLabel("Adicionar fotos (opcional)", { exact: true }).setInputFiles([]);
  await app.page.getByLabel("Usar como capa").nth(1).check();
  await app.page.getByRole("button", { name: "Salvar veículo" }).click();
  await browserExpect(app.page.getByRole("status")).toContainText("salvo com sucesso");
  expect((await app.db.select().from(vehicles).where(eq(vehicles.id, id)))[0].photos).toEqual([secondPhoto, photo]);
  expect((await fetch(`${app.base}/api/photos/${id}/..%2Fsecret.webp`)).status).toBe(404);
});

it("@spec:AC-008 edição e mudanças de situação atualizam catálogo e fotos", async () => {
  for (const status of ["sold", "draft", "published"]) {
    await app.page.goto(`${app.base}/admin/veiculos/${id}/editar`);
    await app.page.getByLabel("Preço (R$)", { exact: true }).fill("74900,00");
    await app.page.getByLabel("Situação do anúncio").selectOption(status);
    await app.page.getByRole("button", { name: "Salvar veículo" }).click();
    await browserExpect(app.page.getByRole("status")).toContainText("salvo com sucesso");
    expect((await fetch(`${app.base}/veiculos/${id}`)).status).toBe(status === "published" ? 200 : 404);
    expect((await fetch(`${app.base}/api/photos/${id}/${photo}`)).status).toBe(status === "published" ? 200 : 404);
  }
  const response = await fetch(`${app.base}/veiculos/${id}`);
  expect(await response.text()).toContain("74.900,00");
});

it("@spec:AC-009 cancelar preserva o anúncio e confirmar remove anúncio e fotos", async () => {
  await app.page.goto(`${app.base}/admin/veiculos`);
  const row = app.page.locator(".stock-row").filter({ hasText: "Polo teste" });
  await row.getByRole("button", { name: "Remover", exact: true }).click();
  await app.page.keyboard.press("Escape");
  expect((await app.db.select().from(vehicles).where(eq(vehicles.id, id)))).toHaveLength(1);
  await row.getByRole("button", { name: "Remover", exact: true }).click();
  await app.page.getByRole("button", { name: "Cancelar", exact: true }).click();
  expect((await app.db.select().from(vehicles).where(eq(vehicles.id, id)))).toHaveLength(1);
  await row.getByRole("button", { name: "Remover", exact: true }).click();
  await app.page.getByRole("button", { name: "Confirmar remoção", exact: true }).click();
  await browserExpect(app.page.getByRole("status")).toContainText("removido do estoque");
  expect((await app.db.select().from(vehicles).where(eq(vehicles.id, id)))).toHaveLength(0);
  expect((await fetch(`${app.base}/veiculos/${id}`)).status).toBe(404);
  expect((await fetch(`${app.base}/api/photos/${id}/${photo}`)).status).toBe(404);
});

it("paginação mantém a busca e filtros combinados alcançando veículos além da primeira página", async () => {
  await app.db.insert(vehicles).values(Array.from({ length: 13 }, (_, index) => ({ brand: "Pagination", model: `Modelo ${index}`, manufactureYear: 2022, modelYear: 2023, mileage: index * 1000, priceCents: (20 - index) * 1000, fuel: "Flex", transmission: "Manual", color: "Prata", status: "published" as const })));
  await app.page.goto(`${app.base}/?q=Pagination&cambio=Manual&ordem=menor-preco`);
  await browserExpect(app.page.getByRole("link", { name: "Limpar filtros" })).toBeVisible();
  await browserExpect(app.page.locator(".vehicle-card")).toHaveCount(12);
  await browserExpect(app.page.locator(".vehicle-card h3").first()).toContainText("Pagination Modelo 12");
  await app.page.getByRole("link", { name: "Próxima" }).click();
  await browserExpect(app.page.locator(".vehicle-card")).toHaveCount(1);
  await browserExpect(app.page.getByRole("searchbox")).toHaveValue("Pagination");
  await app.page.getByRole("link", { name: "Anterior" }).click();
  await browserExpect(app.page.locator(".vehicle-card")).toHaveCount(12);
});

it("@spec:AC-014 catálogo e anúncio mantêm identidade padrão sem contatos fictícios", async () => {
  const response = await fetch(app.base);
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  expect(response.headers.get("x-frame-options")).toBe("DENY");
  expect(response.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
  expect(response.headers.get("x-powered-by")).toBeNull();
  const catalogHtml = await response.text();
  expect(catalogHtml).toContain("Garagista");
  expect(catalogHtml).toContain('"@type":"AutoDealer"');
  expect(catalogHtml).not.toContain("wa.me/");
  expect(catalogHtml).not.toContain("CNPJ:");
  const [published] = await app.db.select().from(vehicles).where(eq(vehicles.status, "published")).limit(1);
  const detailHtml = await (await fetch(`${app.base}/veiculos/${published.id}`)).text();
  expect(detailHtml).toContain("Garagista");
  expect(detailHtml).toContain('"@type":"Car"');
  expect(detailHtml).not.toContain("wa.me/");
  expect(detailHtml).not.toContain("CNPJ:");
  expect((await fetch(`${app.base}/api/store/${randomUUID()}.webp`)).status).toBe(404);
  const sitemapXml = await (await fetch(`${app.base}/sitemap.xml`)).text();
  expect(sitemapXml).toContain(`/veiculos/${published.id}`);
  const robotsTxt = await (await fetch(`${app.base}/robots.txt`)).text();
  expect(robotsTxt).toContain("Disallow: /admin/");
});

it("@spec:AC-013 painel da loja rejeita dados inválidos e chamadas sem sessão", async () => {
  const anon = await fetch(`${app.base}/admin/loja`, { redirect: "manual" });
  expect(anon.headers.get("location")).toBe("/admin/login");
  expect((await fetch(`${app.base}/api/admin/estoque.csv`)).status).toBe(401);
  expect((await fetch(`${app.base}/api/admin/backup.json`)).status).toBe(401);
  const csvResponse = await fetch(`${app.base}/api/admin/estoque.csv`, { headers: { Cookie: actionHeaders.cookie } });
  expect(csvResponse.status).toBe(200);
  expect(csvResponse.headers.get("content-type")).toContain("text/csv");
  expect(await csvResponse.text()).toContain("Pagination");
  const jsonResponse = await fetch(`${app.base}/api/admin/backup.json`, { headers: { Cookie: actionHeaders.cookie } });
  expect(jsonResponse.status).toBe(200);
  expect(jsonResponse.headers.get("content-type")).toContain("application/json");
  expect((await jsonResponse.json()).vehicles.length).toBeGreaterThan(0);
  await app.page.goto(`${app.base}/admin/veiculos?combustivel=Flex&cambio=Manual`);
  await browserExpect(app.page.getByRole("link", { name: "Limpar filtros" })).toBeVisible();
  await app.page.goto(`${app.base}/admin/loja`);
  await app.page.getByLabel("Nome comercial", { exact: true }).fill("Garagista Inválida");
  await app.page.getByLabel("CNPJ").fill("11.111.111/1111-11");
  await app.page.getByRole("button", { name: "Salvar dados da loja" }).click();
  await browserExpect(app.page.locator(".form-error[role=alert]")).toContainText("Confira os campos");
  await browserExpect(app.page.locator("#cnpj-error")).toContainText("CNPJ válido");
  expect(await app.db.select().from(storeSettings)).toHaveLength(0);
});

it("@spec:AC-011 @spec:AC-012 painel salva identidade, CNPJ, imagens e contatos da loja e exibe WhatsApp no anúncio", async () => {
  const image = await sharp({ create: { width: 640, height: 320, channels: 3, background: "#176243" } }).jpeg().toBuffer();
  await app.page.goto(`${app.base}/admin/loja`);
  await app.page.getByLabel("Nome comercial", { exact: true }).fill("Garagista Prime");
  await app.page.getByLabel("Slogan ou apresentação").fill("Seminovos selecionados com procedência.");
  await app.page.getByLabel("CNPJ").fill("12.345.678/0001-95");
  await app.page.getByLabel("WhatsApp").fill("(11) 99876-5432");
  await app.page.getByLabel("Telefone").fill("(11) 3456-7890");
  await app.page.getByLabel("E-mail de contato").fill("contato@garagistaprime.com.br");
  await app.page.getByLabel("Endereço").fill("Av. Paulista, 1000 - São Paulo/SP");
  await app.page.getByLabel("Horário de atendimento").fill("Seg a Sáb, 9h às 18h");
  await app.page.getByLabel("Logotipo da loja (opcional)", { exact: true }).setInputFiles({ name: "logo.jpg", mimeType: "image/jpeg", buffer: image });
  await app.page.getByLabel("Imagem de capa da loja (opcional)", { exact: true }).setInputFiles({ name: "hero.jpg", mimeType: "image/jpeg", buffer: image });
  await app.page.getByRole("button", { name: "Salvar dados da loja" }).click();
  await browserExpect(app.page.getByRole("status")).toContainText("salvos com sucesso");
  const [saved] = await app.db.select().from(storeSettings);
  expect(saved.name).toBe("Garagista Prime");
  expect(saved.cnpj).toBe("12345678000195");
  expect((await fetch(`${app.base}/api/store/${saved.logoPhoto}`)).status).toBe(200);
  expect((await fetch(`${app.base}/api/store/${saved.heroPhoto}`)).status).toBe(200);
  await app.page.goto(app.base);
  await browserExpect(app.page.locator(".wordmark-name")).toHaveText("Garagista Prime");
  await browserExpect(app.page.getByText("Seminovos selecionados com procedência.").first()).toBeVisible();
  await browserExpect(app.page.getByText("CNPJ: 12.345.678/0001-95")).toBeVisible();
  await browserExpect(app.page.locator(".store-logo")).toBeVisible();
  const [published] = await app.db.select().from(vehicles).where(eq(vehicles.status, "published")).limit(1);
  await app.page.goto(`${app.base}/veiculos/${published.id}`);
  await browserExpect(app.page.locator(".wordmark .store-logo")).toBeVisible();
  await browserExpect(app.page.locator(".wordmark")).toHaveAttribute("aria-label", "Garagista Prime, início");
  const waLink = app.page.getByRole("link", { name: /Solicitar Atendimento exclusivo/ });
  await browserExpect(waLink).toBeVisible();
  const href = await waLink.getAttribute("href");
  expect(href).toContain("https://wa.me/5511998765432?text=");
  expect(decodeURIComponent(href ?? "")).toContain(`${published.brand} ${published.model} ${published.manufactureYear}/${published.modelYear}`);
  for (const url of [app.base, `${app.base}/veiculos/${published.id}`, `${app.base}/admin/loja`]) {
    await app.page.goto(url);
    for (const width of [1440, 768, 390]) {
      await app.page.setViewportSize({ width, height: 900 });
      expect(await app.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
  await app.page.setViewportSize({ width: 1440, height: 1000 });
  await Promise.all([removePhoto(saved.logoPhoto), removePhoto(saved.heroPhoto)]);
});


