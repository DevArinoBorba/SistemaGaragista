# LIÇÕES — mantido pelo motor (`onp-spec licoes`)

> Não edite à mão: qualquer escrita do motor sobrescreve este arquivo.
> Estado canônico em `.spec/licoes.json`; mutação só via `onp-spec licoes`.

## Confirmadas — carregue no Especificar/Projetar

Corroboradas em múltiplas features. Aplique como guia.

_nenhuma_

## Candidatas — em observação, NÃO aplicar ainda

Vistas em uma feature só. Registradas, não confiadas.

### L-001 — Alinhar o nome real do arquivo de migration gerado pelo drizzle-kit na lista de arquivos da tarefa em tasks.md antes do gate final.
- sinal: `ARQUIVO_INEXISTENTE` · recorrência: 1 feature(s) · penalidades: 0
- features: identidade-loja
- última evidência: T-006 (identidade-loja, 2026-10-26T15:11:18.104Z)

### L-002 — Anotar cada novo critério de aceite com @spec:AC-xxx tanto em testes unitários de fronteira quanto no fluxo integrado E2E.
- sinal: `AC_SEM_TESTE` · recorrência: 1 feature(s) · penalidades: 0
- features: identidade-loja
- última evidência: AC-011 (identidade-loja, 2026-10-26T15:11:18.236Z)

### L-003 — Sempre que um ciclo de revisao ou melhoria adicionar um novo arquivo em src/ (como sitemap.ts ou robots.ts), mapeie-o imediatamente na tarefa correspondente em .spec/features/*/tasks.md antes de rodar onp-spec audit --ci.
- sinal: `ARQUIVO_ORFAO` · recorrência: 1 feature(s) · penalidades: 0
- features: identidade-loja
- última evidência: src/app/sitemap.ts (identidade-loja, 2026-10-26T18:31:31.594Z)

## Quarentena — aplicadas e falharam, ignorar

A falha recorreu mesmo com a lição aplicada. Revisão é do usuário.

_nenhuma_
