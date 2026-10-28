# Tasks: Identidade comercial e canais de contato da loja

> feature: identidade-loja

## T-006 — Schema, migration e repositório de configuração da loja [concluida]
- Refs: US-004, AC-011, AC-013, AC-014
- Arquivos: src/db/schema/store.ts, src/db/schema/index.ts, src/features/store/schema.ts, src/features/store/validation.test.ts, src/features/store/repository.ts, drizzle/0001_wild_maximus.sql
- Notas: Tabela `store_settings` (chave `'default'`) com `name`, `tagline`, `cnpj`, `whatsapp`, `phone`, `email`, `address`, `openingHours`, `logoPhoto`, `heroPhoto` e `updatedAt`; validação Zod de CNPJ, contatos e links `wa.me`/`tel:`; migration SQL gerada e revisada.

## T-007 — Server Action protegida, upload de imagens da loja e painel `/admin/loja` [concluida]
- Refs: US-004, AC-011, AC-013
- Arquivos: src/features/store/actions.ts, src/features/store/actions.test.ts, src/components/admin/store-form.tsx, src/app/admin/(protected)/loja/page.tsx, src/app/admin/(protected)/layout.tsx, src/app/api/store/[name]/route.ts
- Notas: Server Action `saveStoreSettingsAction` protegida por `requireAdmin()`, upload/substituição/remoção de logotipo e imagem de capa da loja via Sharp WebP (`storePhoto`/`removePhoto`), rota `/api/store/[name]` verificando vínculo em `store_settings`, e formulário acessível em `/admin/loja`.

## T-008 — Identidade pública, CNPJ, imagens e canais no catálogo, rodapé e anúncio [concluida]
- Refs: US-005, AC-011, AC-012, AC-014
- Arquivos: src/components/site-header.tsx, src/components/site-footer.tsx, src/components/icons.tsx, src/app/page.tsx, src/app/veiculos/[id]/page.tsx, src/app/sitemap.ts, src/app/robots.ts, src/app/globals.css, tests/catalogo-loja.test.ts, PRODUCT.md, docs/architecture.md, docs/setup.md, docs/quality.md
- Notas: Exibir nome comercial, logotipo, imagem de capa, slogan, CNPJ formatado, metadados Open Graph / JSON-LD (`AutoDealer` e `Car`), `sitemap.xml` / `robots.txt` e canais de atendimento no cabeçalho, hero, rodapé e ficha do veículo (`/veiculos/[id]`), mantendo estado padrão honesto quando vazios, e testar `AC-011` a `AC-014` na suíte integrada.
