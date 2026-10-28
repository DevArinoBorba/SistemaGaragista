# Tasks: Catálogo e administração de uma loja

> feature: catalogo-loja

## T-001 — Dados e validação de veículos [concluida]
- Refs: US-003, AC-006, AC-007, AC-008, AC-009
- Arquivos: src/db/index.ts, src/db/index.test.ts, src/db/schema/index.ts, src/db/schema/vehicles.ts, src/features/vehicles/schema.ts, src/features/vehicles/validation.test.ts, src/features/vehicles/repository.ts, src/lib/env-schema.ts, src/lib/env.ts, src/lib/env.test.ts, src/lib/logger.ts, src/lib/logger.test.ts, src/lib/utils.ts, drizzle/0000_glamorous_jocasta.sql, drizzle/0002_last_hemingway.sql, docs/architecture.md
- Notas: Campos e estados confirmados. SQL gerado e revisado em drizzle/0000_glamorous_jocasta.sql; aplicado apenas ao PostgreSQL local isolado do projeto.

## T-002 — Acesso administrativo e autorização [concluida]
- Refs: US-002, AC-004, AC-005
- Arquivos: src/db/schema/auth.ts, src/features/auth/auth.ts, src/features/auth/session.ts, src/app/admin/page.tsx, src/app/admin/login/page.tsx, src/app/api/auth/[...all]/route.ts, src/components/admin/login-form.tsx, src/components/admin/logout-button.tsx, scripts/create-admin.ts, .env.example, package.json, pnpm-lock.yaml, docs/architecture.md
- Notas: Better Auth 1.7.10 integrado ao Drizzle/PostgreSQL, sem cadastro público, rate limit no banco e script explícito de primeiro administrador.

## T-003 — Catálogo público e detalhe do anúncio [concluida]
- Refs: US-001, AC-001, AC-002, AC-003
- Arquivos: src/app/page.tsx, src/app/veiculos/[id]/page.tsx, src/app/layout.tsx, src/app/globals.css, src/app/error.tsx, src/app/not-found.tsx, src/app/favicon.ico, src/features/vehicles/public.ts, src/components/vehicles/vehicle-card.tsx, src/components/vehicles/vehicle-gallery.tsx, src/components/vehicles/vehicle-carousel.tsx, src/components/pagination.tsx, src/components/site-header.tsx, docs/design.md, docs/architecture.md
- Notas: Catálogo público paginado com busca, selo discreto de veículos recentes, detalhe com galeria horizontal apenas para publicados, estados vazios honestos e direção visual validada em três larguras.

## T-004 — Painel de estoque, formulários e fotos [concluida]
- Refs: US-003, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010
- Arquivos: src/app/admin/(protected)/layout.tsx, src/app/admin/(protected)/veiculos/page.tsx, src/app/admin/(protected)/veiculos/loading.tsx, src/app/admin/(protected)/veiculos/novo/page.tsx, src/app/admin/(protected)/veiculos/[id]/editar/page.tsx, src/components/admin/vehicle-form.tsx, src/components/admin/delete-vehicle.tsx, src/features/vehicles/actions.ts, src/features/vehicles/actions.test.ts, src/features/uploads/storage.ts, src/features/uploads/storage.test.ts, src/app/api/photos/[vehicleId]/[name]/route.ts, src/app/api/admin/estoque.csv/route.ts, src/app/api/admin/backup.json/route.ts, docs/design.md, docs/architecture.md
- Notas: Painel protegido, indicadores resumidos, filtros por situação/combustível/câmbio, exportações CSV e JSON protegidas, Server Actions autenticadas no servidor, upload e conversão WebP com Sharp e rota de fotos com validação de vínculo e publicação.

## T-005 — Integração, navegador e documentação [concluida]
- Refs: US-001, US-002, US-003, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010
- Arquivos: tests/catalogo-loja.test.ts, tests/helpers/integration.ts, scripts/local-db.mjs, scripts/start-local.ps1, package.json, pnpm-lock.yaml, vitest.config.mts, vitest.integration.config.mts, onpspec.config.json, PRODUCT.md, README.md, docs/architecture.md, docs/onboarding.md, docs/quality.md, docs/setup.md
- Notas: Executar checks, provas anotadas por critério no PostgreSQL local isolado e Chrome, atualizar documentação e fechar auditoria mecânica.
