# Setup e evidências

## Origem e escopo

Executado em 2026-10-16 no diretório solicitado, inicialmente vazio, com Codex. Descrição do usuário consolidada em [PRODUCT.md](../PRODUCT.md). Revisão única do [Vibe Coding Toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit): `f13bb354363dafef8ce8d8f605856cc9e1cc52cc`. Cópia de trabalho do toolkit e scaffold mantidos fora da aplicação, no diretório temporário do sistema; apenas templates aplicáveis foram incorporados.

Preservados cliente, modelo e autenticação da sessão. Sem subagentes, troca de provedor, configuração global, deploy, remoto Git, push ou contratação de serviço. Git inicializado localmente; arquivos preparados para revisão, sem commit automático. Nenhum código de produto existente foi sobrescrito.

## Decisões e fontes consultadas

- Next estável 16.4.2 confirmado por registry e `create-next-app --help`. Scaffold temporário com App Router, TypeScript, Tailwind, ESLint, `src/`, alias `@/*`, pnpm, sem Git automático, React Compiler, Cache Components ou agent feedback. [Instalação oficial](https://nextjs.org/docs/app/getting-started/installation) e documentação distribuída em `node_modules/next/dist/docs/` consultadas antes de adaptar layout/metadados.
- Consulta real Context7 por MCP HTTP: `resolve-library-id` para Next.js, seguida de `query-docs` em `/vercel/next.js` sobre instalação App Router. Resposta inclui fontes canary; as flags e versões foram confrontadas com CLI estável e documentação instalada. Nenhum código privado ou segredo foi enviado.
- Drizzle/PostgreSQL adotado para a persistência de anúncios, configuração da loja (`store_settings`) e autenticação. [Guia Drizzle](https://orm.drizzle.team/docs/get-started-postgresql) consultado. Schemas de `vehicles`, `store_settings` e tabelas Better Auth 1.7.10 gerados em `drizzle/0000_glamorous_jocasta.sql` e `drizzle/0001_wild_maximus.sql` e aplicados ao PostgreSQL 18.4 local isolado (`scripts/local-db.mjs`). Pool lazy do template evita exigir credenciais no build.
- Better Auth 1.7.10 configurado com `@better-auth/drizzle-adapter`, rate limit persistido no PostgreSQL, sessão no banco sem cookie cache, `trustedOrigins` explícito, cookies `SameSite=Lax`/`HttpOnly` (`Secure` sob HTTPS) e cadastro público desativado. Criação explícita do primeiro administrador via `pnpm admin:create` (e rotação de credenciais com revogação de sessões via `pnpm admin:rotate`) com credenciais salvas apenas em `.local/first-access.json`.
- Processamento de imagens com Sharp 0.35.5: validação de formato (JPEG/PNG/WebP), limite de dimensões/pixels e recodificação em WebP sem metadados em `.local/uploads`.
- Node 24.19.0 existente; tipos Node 24.19.2 alinhados ao runtime e aos peers do [Vitest](https://vitest.dev/guide/). `@next/env` alinhado exatamente ao Next. Nenhum peer forçado.
- pnpm 12.8.1 existente, registrado em `packageManager`. Mantidas as políticas de supply chain. A CLI registrou exceções específicas de idade mínima para os pacotes Next 16.4.2 no workspace; não foi desativada a política global. Vitest resolvido para 5.0.4, estável compatível, embora o registry já anunciasse 5.0.5.
- ESLint 9.39.5 mantido do scaffold oficial, acrescido de `eslint-plugin-drizzle`. Registry aponta depreciação da linha 9; atualização para 10 deve conferir compatibilidade do conjunto de plugins, sem upgrade principal automático.
- Scripts de instalação autorizados apenas em `pnpm-workspace.yaml` para ferramentas e dependências nativas necessárias localmente (`esbuild`, `sharp`, `embedded-postgres`).
- `typecheck` executa `next typegen` antes de `tsc`, para suportar uma instalação limpa com `LayoutProps` gerado pelo Next.
- `dev`, `start`, `db:local` e `test:integration` consultam a política/verificador Maestri antes de iniciar serviços e usam a porta retornada em IPv4 loopback, alinhando `BETTER_AUTH_URL` e `DATABASE_URL` locais.

## Componentes e escopos

| Componente | Escopo | Estado |
| --- | --- | --- |
| Next 16.4.2 / React e React DOM 19.3.0 | Projeto | Instalados; rotas públicas, painel e handlers validados em build e integração |
| TypeScript 5.9.3 / Tailwind 4.3.3 | Projeto | Instalados; tipos strict e build validados |
| Drizzle ORM 0.45.4 / Kit 0.31.11 / pg 8.23.1 | Projeto | Instalados; migrations `0000_glamorous_jocasta.sql` e `0001_wild_maximus.sql` geradas, revisadas e aplicadas no banco local |
| Better Auth 1.7.10 / `@better-auth/drizzle-adapter` 1.7.10 | Projeto | Login, sessão, revogação, rate limit e bloqueio de cadastro público validados |
| Sharp 0.35.5 | Projeto | Conversão WebP, remoção de metadados e rejeição de arquivos inválidos validadas |
| Zod 4.6.7 / Pino 10.4.0 / server-only 0.0.1 | Projeto | Validação, redação de logs e fronteiras de servidor testadas |
| clsx 2.1.1 / tailwind-merge 3.7.0 | Projeto | Helper disponível |
| Vitest 5.0.4 / Playwright 1.64.1 / ESLint 9.39.5 | Projeto | 8 arquivos unitários (17 testes), 1 arquivo integrado (14 testes) e lint validados |
| embedded-postgres 18.4.0-beta.17 / tsx 4.23.15 | Projeto (dev) | PostgreSQL 18.4 local isolado e script `admin:create` validados |
| Oito skills web Vercel | Projeto | Cópias locais e hashes em `skills-lock.json`; listagem validada |
| find-skills | Global existente | Reutilizada sem duplicata local; descoberta já presente na sessão |
| Context7 | Projeto | `.codex/config.toml` configurado; endpoint consultado diretamente com sucesso |
| Ponytail full, Caveman, Superpowers | Cliente | Pendentes: não descobertos; acordos equivalentes em AGENTS, sem simular plugins |
| RTK | Máquina | Pendente: binário ausente no PATH, sem instalação global automática |
| Graphify 0.9.91 | Projeto | Instalado em venv isolado `.local/graphify`; extração e consulta validadas |

Skills Vercel verificadas no catálogo upstream e na CLI: `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `writing-guidelines`, `vercel-react-view-transitions`, `vercel-optimize`, `deploy-to-vercel`, `vercel-cli-with-tokens`. Instaladas com `--agent codex --yes --copy`, preservando atribuições; React Native/Expo omitido porque o produto é web. As oito aparecem em `skills list --agent codex`. A versão local homônima de find-skills foi retirada, preservando a global. A CLI de remoção apresentou uma assertion no encerramento; a conferência posterior removeu o arquivo residual e alinhou o lockfile. A listagem comprova presença, não carregamento em nova sessão.

`codex plugin add --help` não oferece escopo de projeto nesta instalação. Nenhum plugin foi instalado globalmente por efeito do bootstrap. Context7 não estava listado nas conexões ativas. A configuração local segue a [documentação oficial de MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli); `codex mcp get context7` ainda não o descobriu nesta sessão. Ativação via confiança/reabertura do host permanece pendente; a consulta HTTP direta não comprova carregamento pelo cliente.

## Documentação

Atualizados os nove documentos do manifesto: README, PRODUCT, AGENTS e CLAUDE na raiz; architecture, design, onboarding, quality e setup em `docs/`, além da especificação ancorada em `.spec/features/catalogo-loja/`. Preservado o bloco de instruções Next.js gerado. CLAUDE importa AGENTS em uma linha. `.env.example` preservado e liberado no gitignore. Segredos locais em `.env.local` e `.local/` permanecem fora do Git.

## Verificações

| Item | Estado | Evidência |
| --- | --- | --- |
| Instalação congelada | Validado | `pnpm install --frozen-lockfile`, exit 0 |
| Lint | Validado | `pnpm lint`, exit 0 |
| Tipos | Validado | `next typegen` e `tsc --noEmit`, exit 0 |
| Regras locais | Validado | `pnpm lint:rules`: max-lines, no-direct-console e no-direct-data-access OK |
| Testes unitários | Validado | `pnpm test`: 8 arquivos, 17 testes aprovados (ambiente, logger, pool, validação de veículos e loja, autorização, lote/concorrência e fotos) |
| Build | Validado | `pnpm build`, Next 16.4.2, rotas `/`, `/veiculos/[id]`, `/admin`, `/admin/login`, `/admin/loja`, `/admin/veiculos`, `/admin/veiculos/novo`, `/admin/veiculos/[id]/editar`, `/api/auth/[...all]`, `/api/photos/[vehicleId]/[name]` e `/api/store/[name]` |
| Check composto | Validado | `pnpm check`, exit 0 |
| Geração SQL e migration local | Validado | `drizzle/0000_glamorous_jocasta.sql` e `drizzle/0001_wild_maximus.sql` gerados e aplicados ao PostgreSQL 18.4 local isolado (`127.0.0.1:5432`) |
| Primeiro administrador | Validado | `pnpm admin:create` testado com credenciais privadas em `.local/first-access.json` e recusa de sobrescrita |
| Catálogo, painel, loja, login e fotos | Validado | `pnpm test:integration`: 9 arquivos, 31 testes (14 fluxos integrados em PostgreSQL real + Chrome cobrindo `AC-001` a `AC-014`, busca e paginação) |
| Revisão visual e responsiva | Validado | Capturas em 1440, 768 e 390 px em `.local/qa/` sem overflow horizontal; inspeção documentada em [design.md](design.md) |
| Gate mecânico da especificação | Validado | `onp-spec verify` (`catalogo-loja` e `identidade-loja`, 14/14 ACs com prova PASS) e `onp-spec audit --ci`, exit 0 |
| Grafo de código | Validado | Graphify 0.9.91, `extract . --code-only --no-cluster`: 52 arquivos de código analisados, 331 nós, 707 relações; sem LLM |

Os serviços temporários (servidor de integração e PostgreSQL local) foram encerrados após a bateria de verificação, com liberação de leases Maestri e atualização de estado inativo em `.local/service.json`, `.local/database-service.json` e `.local/qa/integration-service.json`. Outros projetos e listeners foram preservados.

Graphify instalado em ambiente Python 3.11 isolado, sem alterar pacotes globais. Para recriar: `python -m venv .local/graphify` e `.local/graphify/Scripts/python.exe -m pip install graphifyy==0.9.91`. A [CLI oficial](https://github.com/Graphify-Labs/graphify) confirma as flags. Execute em PowerShell:

```powershell
$env:GRAPHIFY_NO_AUTO_REFRESH = '1'
$env:PYTHONUTF8 = '1'
.local/graphify/Scripts/graphify.exe extract . --code-only --no-cluster
.local/graphify/Scripts/graphify.exe query 'getDb' --budget 400
```

O grafo fica em `graphify-out/graph.json`, ignorado pelo Git. Extração AST é local e não cobre a semântica de PRODUCT ou documentos. A ferramenta avisou sobre cinco arquivos de código sem símbolos reconhecidos e um arquivo `.sql` sem `tree_sitter_sql`; o resultado não é uma representação completa desses arquivos. Dependências, skills, venv e segredos estão excluídos. Não foram instalados integração automática, hooks, serviço remoto ou refresh. `extract --help` não funciona como ajuda de subcomando nessa CLI; use `graphify --help`.

## Auditoria de dependências

`pnpm audit --prod --json`: zero advisories reportados na consulta. `pnpm audit --dev --json`: dois, sem correção forçada. Isso é um retrato do registry, não uma garantia de segurança.

- Moderado: [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99), esbuild 0.18.20 pela cadeia drizzle-kit → @esbuild-kit/esm-loader → core-utils. Versão corrigida do pacote é >=0.25.0; substituir major transitivo exige validação do consumidor. A base não usa o servidor `serve` dessa versão; acompanhar atualização do Kit em vez de impor override não testado.
- Alto: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), braces 3.0.3 por eslint-config-next → plugin-next → fast-glob → micromatch. O registry não reportou patch publicado. Não fornecer padrões glob de origem não confiável à ferramenta; acompanhar correção upstream.

## Continuação

Para operar localmente, rode `pnpm db:local` em um terminal e `pnpm dev` em outro (detalhes em [onboarding.md](onboarding.md)). Antes de publicar em produção, definir identidade comercial definitiva da loja, banco PostgreSQL gerenciado, armazenamento durável de fotos e domínio HTTPS. Os 3 ciclos de revisão de qualidade foram executados e documentados em [quality.md](quality.md), onde constam também os próximos 3 ciclos sugeridos.
