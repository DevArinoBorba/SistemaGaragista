# Plano de execução — identidade-loja

> gerado por `onp-spec plano` em 2026-10-26 14:50 — NÃO edite à mão;
> mudou tasks.md ou a config? Regenere: `onp-spec plano identidade-loja`

## Resumo — o que vai acontecer

- **3 tarefa(s) pendente(s)**: 3 em 3 faixa(s) paralela(s) + 0 sequencial(is)
- **1 faixa = 1 worktree + 1 branch + 1 janela de contexto limpa** — faixas não compartilham nenhum arquivo entre si
- prefere outra seleção ou uma após a outra? Regenere com `onp-spec plano identidade-loja --paralelizar T-xxx,T-yyy` ou `--sequencial`
- tudo acontece na branch de trabalho `spec/identidade-loja`; levar para a main é decisão sua

## Faixas e ondas

### Onda 1 — faixa-1 ∥ faixa-2 ∥ faixa-3

#### faixa-1 — branch `spec/identidade-loja-faixa-1` — worktree `../onp-worktrees/SistemaGaragista-identidade-loja-faixa-1`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-006 | Schema, migration e repositório de configuração da loja | `claude-sonnet-5` | medium | `src/db/schema/store.ts`, `src/db/schema/index.ts`, `src/features/store/schema.ts`, `src/features/store/validation.test.ts`, `src/features/store/repository.ts`, `drizzle/0001_store_settings.sql` |

#### faixa-2 — branch `spec/identidade-loja-faixa-2` — worktree `../onp-worktrees/SistemaGaragista-identidade-loja-faixa-2`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-007 | Server Action protegida, upload de imagens da loja e painel `/admin/loja` | `claude-sonnet-5` | medium | `src/features/store/actions.ts`, `src/features/store/actions.test.ts`, `src/components/admin/store-form.tsx`, `src/app/admin/(protected)/loja/page.tsx`, `src/app/admin/(protected)/layout.tsx`, `src/app/api/store/[name]/route.ts` |

#### faixa-3 — branch `spec/identidade-loja-faixa-3` — worktree `../onp-worktrees/SistemaGaragista-identidade-loja-faixa-3`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-008 | Identidade pública, CNPJ, imagens e canais no catálogo, rodapé e anúncio | `claude-sonnet-5` | medium | `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/app/page.tsx`, `src/app/veiculos/[id]/page.tsx`, `src/app/globals.css`, `tests/catalogo-loja.test.ts`, `PRODUCT.md`, `docs/architecture.md`, `docs/setup.md`, `docs/quality.md` |

## Gestão de branches e commits

1. branch de trabalho `spec/identidade-loja` criada do ponto atual (se ainda não existir)
2. cada faixa nasce dela como branch própria e roda no seu worktree — **1 tarefa = 1 commit** (`T-xxx feature: título`)
3. terminou a onda → merge `--no-ff` de cada faixa de volta, na ordem; conflito interrompe a faixa e pede resolução humana
4. faixa mesclada → worktree removido, branch apagada, tarefa marcada `[concluida]` no tasks.md
5. gate final na branch de trabalho: `onp-spec verify identidade-loja` + `onp-spec audit --ci` — **exit 0 ou não está pronto**

## Como executar

### ▶ Paralelo nativo no Antigravity (janelas limpas, sem Claude CLI)

1. **Prepare a branch de trabalho e os worktrees** (terminal, na raiz do repositório):

```bash
git checkout -b spec/identidade-loja   # ou: git checkout spec/identidade-loja
git worktree add ../onp-worktrees/SistemaGaragista-identidade-loja-faixa-1 -b spec/identidade-loja-faixa-1
git worktree add ../onp-worktrees/SistemaGaragista-identidade-loja-faixa-2 -b spec/identidade-loja-faixa-2
git worktree add ../onp-worktrees/SistemaGaragista-identidade-loja-faixa-3 -b spec/identidade-loja-faixa-3
```

2. **Abra um agente NOVO por faixa** (janela limpa) e cole o prompt da faixa:

#### Prompt — faixa-1

```
Você executa as tarefas da faixa-1 da feature "identidade-loja" (fluxo onp-spec, spec-anchored).
Trabalhe SOMENTE dentro do worktree ../onp-worktrees/SistemaGaragista-identidade-loja-faixa-1 (branch spec/identidade-loja-faixa-1) — já preparado.
Leia primeiro: .spec/features/identidade-loja/spec.md, .spec/features/identidade-loja/tasks.md e .spec/constituicao.md.

Execute NESTA ORDEM (1 tarefa = 1 commit):
T-006 — "Schema, migration e repositório de configuração da loja"
  critérios/refs: AC-011 (Painel salva identidade, CNPJ, imagens e contatos da loja), AC-013 (Alteração da loja exige autorização e validação no servidor), AC-014 (Catálogo e anúncio permanecem honestos sem contatos ou imagens fictícias por padrão)
  arquivos permitidos (e seus testes): src/db/schema/store.ts, src/db/schema/index.ts, src/features/store/schema.ts, src/features/store/validation.test.ts, src/features/store/repository.ts, drizzle/0001_store_settings.sql
  mensagem de commit: "T-006 identidade-loja: Schema, migration e repositório de configuração da loja"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes localmente com `pnpm exec vitest run --config vitest.integration.config.mts --reporter=json --outputFile=.local/qa/vitest-report.json` até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.
Quando a última tarefa estiver commitada, PARE e informe o resultado — a mesclagem é do orquestrador.
```

#### Prompt — faixa-2

```
Você executa as tarefas da faixa-2 da feature "identidade-loja" (fluxo onp-spec, spec-anchored).
Trabalhe SOMENTE dentro do worktree ../onp-worktrees/SistemaGaragista-identidade-loja-faixa-2 (branch spec/identidade-loja-faixa-2) — já preparado.
Leia primeiro: .spec/features/identidade-loja/spec.md, .spec/features/identidade-loja/tasks.md e .spec/constituicao.md.

Execute NESTA ORDEM (1 tarefa = 1 commit):
T-007 — "Server Action protegida, upload de imagens da loja e painel `/admin/loja`"
  critérios/refs: AC-011 (Painel salva identidade, CNPJ, imagens e contatos da loja), AC-013 (Alteração da loja exige autorização e validação no servidor)
  arquivos permitidos (e seus testes): src/features/store/actions.ts, src/features/store/actions.test.ts, src/components/admin/store-form.tsx, src/app/admin/(protected)/loja/page.tsx, src/app/admin/(protected)/layout.tsx, src/app/api/store/[name]/route.ts
  mensagem de commit: "T-007 identidade-loja: Server Action protegida, upload de imagens da loja e painel `/admin/loja`"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes localmente com `pnpm exec vitest run --config vitest.integration.config.mts --reporter=json --outputFile=.local/qa/vitest-report.json` até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.
Quando a última tarefa estiver commitada, PARE e informe o resultado — a mesclagem é do orquestrador.
```

#### Prompt — faixa-3

```
Você executa as tarefas da faixa-3 da feature "identidade-loja" (fluxo onp-spec, spec-anchored).
Trabalhe SOMENTE dentro do worktree ../onp-worktrees/SistemaGaragista-identidade-loja-faixa-3 (branch spec/identidade-loja-faixa-3) — já preparado.
Leia primeiro: .spec/features/identidade-loja/spec.md, .spec/features/identidade-loja/tasks.md e .spec/constituicao.md.

Execute NESTA ORDEM (1 tarefa = 1 commit):
T-008 — "Identidade pública, CNPJ, imagens e canais no catálogo, rodapé e anúncio"
  critérios/refs: AC-011 (Painel salva identidade, CNPJ, imagens e contatos da loja), AC-012 (Anúncio publicado exibe canais da loja e WhatsApp com dados do veículo), AC-014 (Catálogo e anúncio permanecem honestos sem contatos ou imagens fictícias por padrão)
  arquivos permitidos (e seus testes): src/components/site-header.tsx, src/components/site-footer.tsx, src/app/page.tsx, src/app/veiculos/[id]/page.tsx, src/app/globals.css, tests/catalogo-loja.test.ts, PRODUCT.md, docs/architecture.md, docs/setup.md, docs/quality.md
  mensagem de commit: "T-008 identidade-loja: Identidade pública, CNPJ, imagens e canais no catálogo, rodapé e anúncio"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes localmente com `pnpm exec vitest run --config vitest.integration.config.mts --reporter=json --outputFile=.local/qa/vitest-report.json` até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.
Quando a última tarefa estiver commitada, PARE e informe o resultado — a mesclagem é do orquestrador.
```

3. **Todas terminaram? Mescle na ordem e marque as tarefas** (na árvore principal):

```bash
git merge --no-ff spec/identidade-loja-faixa-1 -m "merge faixa-1 (identidade-loja)"
git worktree remove ../onp-worktrees/SistemaGaragista-identidade-loja-faixa-1 && git branch -d spec/identidade-loja-faixa-1
node C:\Users\arino\.gemini\skills\onp-spec-driven\scripts\onp-spec.mjs tarefa identidade-loja T-006 concluida
git merge --no-ff spec/identidade-loja-faixa-2 -m "merge faixa-2 (identidade-loja)"
git worktree remove ../onp-worktrees/SistemaGaragista-identidade-loja-faixa-2 && git branch -d spec/identidade-loja-faixa-2
node C:\Users\arino\.gemini\skills\onp-spec-driven\scripts\onp-spec.mjs tarefa identidade-loja T-007 concluida
git merge --no-ff spec/identidade-loja-faixa-3 -m "merge faixa-3 (identidade-loja)"
git worktree remove ../onp-worktrees/SistemaGaragista-identidade-loja-faixa-3 && git branch -d spec/identidade-loja-faixa-3
node C:\Users\arino\.gemini\skills\onp-spec-driven\scripts\onp-spec.mjs tarefa identidade-loja T-008 concluida
```

5. **Gate final** (exit 0 ou não está pronto):

```bash
node C:\Users\arino\.gemini\skills\onp-spec-driven\scripts\onp-spec.mjs verify identidade-loja
node C:\Users\arino\.gemini\skills\onp-spec-driven\scripts\onp-spec.mjs audit --ci
```

6. **Acompanhamento (a cada ~1 min, enquanto os agentes trabalham)**: avise ANTES
   de despachar os agentes que o trabalho roda em background e que o resumo
   completo vem ao final. Marque cada tarefa no ledger quando um agente começa
   e quando termina (é disso que a tabela é feita):

```bash
node C:\Users\arino\.gemini\skills\onp-spec-driven\scripts\onp-spec.mjs evento --run SistemaGaragista-identidade-loja-mvpdi7bm --tipo tarefa --tarefa <T-xxx> --faixa <faixa-N> --estado executando
node C:\Users\arino\.gemini\skills\onp-spec-driven\scripts\onp-spec.mjs evento --run SistemaGaragista-identidade-loja-mvpdi7bm --tipo tarefa --tarefa <T-xxx> --faixa <faixa-N> --estado concluida
```

   E a cada ~1 min poste no chat a TABELA de andamento + um parágrafo curto,
   registrando o texto no ledger:

```bash
node C:\Users\arino\.gemini\skills\onp-spec-driven\scripts\onp-spec.mjs resumo identidade-loja --tabela   # a tabela — cole no chat
node C:\Users\arino\.gemini\skills\onp-spec-driven\scripts\onp-spec.mjs resumo identidade-loja --gravar --origem ia --texto "<2 a 4 frases do que está rolando>"
```

