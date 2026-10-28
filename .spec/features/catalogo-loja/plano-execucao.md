# Plano de execução — catalogo-loja

> gerado por `onp-spec plano` em 2026-10-16 14:39 — NÃO edite à mão;
> mudou tasks.md ou a config? Regenere: `onp-spec plano catalogo-loja --sequencial --modelo gpt-6.1-sol --esforco medium`

## Resumo — o que vai acontecer

- **modo SEQUENCIAL (escolha do usuário)**: 5 tarefa(s) pendente(s), UMA APÓS A OUTRA, na árvore principal
- sem worktrees e sem paralelismo — cada tarefa roda numa janela de contexto limpa, na ordem do tasks.md
- **custo travado pelo usuário**: modelo `gpt-6.1-sol` · esforço `medium` em TODAS as tarefas (vence tasks.md e config)
- tudo acontece na branch de trabalho `spec/catalogo-loja`; levar para a main é decisão sua

## Ordem de execução (uma tarefa após a outra)

| tarefa | título | modelo | esforço |
|---|---|---|---|
| T-001 | Dados e validação de veículos | `gpt-6.1-sol` | medium |
| T-002 | Acesso administrativo e autorização | `gpt-6.1-sol` | medium |
| T-003 | Catálogo público e detalhe do anúncio | `gpt-6.1-sol` | medium |
| T-004 | Painel de estoque, formulários e fotos | `gpt-6.1-sol` | medium |
| T-005 | Integração, navegador e documentação | `gpt-6.1-sol` | medium |

## Gestão de branches e commits

1. branch de trabalho `spec/catalogo-loja` criada do ponto atual (se ainda não existir)
2. as tarefas rodam nela mesma, na ordem — **1 tarefa = 1 commit** (`T-xxx feature: título`), marcada `[concluida]` só com trabalho feito
3. gate final na branch de trabalho: `onp-spec verify catalogo-loja` + `onp-spec audit --ci` — **exit 0 ou não está pronto**

## Como executar

### ▶ Execução — Codex headless (codex exec)

```bash
bash .spec/features/catalogo-loja/executar-tarefas.sh
```

Cada tarefa roda `codex exec` com **janela de contexto limpa**, na árvore principal,
uma após a outra, com `--model` e `model_reasoning_effort` já definidos por tarefa e sandbox `workspace-write`.
Os prompts exatos estão embutidos no script.
Logs: `../onp-worktrees/SistemaGaragista-catalogo-loja-logs/`.

**Confirmação de custos — antes de executar**: os modelos e esforços por
tarefa estão nas tabelas acima; o agente CONFIRMA com o usuário se estão
dentro da licença/cota dele (modelo forte + esforço alto torra tokens).
Para gastar menos: `onp-spec plano catalogo-loja --modelo gpt-5.6-luna --esforco baixo`
(tudo) ou por tarefa `onp-spec tarefa catalogo-loja T-xxx --modelo <m> --esforco <nível>` — e regenere o plano.

### 📣 Acompanhamento — tabela + resumo no chat (a cada 1 min)

O script roda em **background**: o agente AVISA o usuário antes de iniciar e,
enquanto roda, posta no chat a cada ~1 minuto a **tabela de andamento** (qual
tarefa está rodando, qual não está, o que concluiu/falhou) junto com o
**resumo geral de andamento** (escrito por IA; sem IA, o motor resume). Ao
final, o usuário recebe o resumo completo da execução. A qualquer momento:

```bash
onp-spec resumo catalogo-loja --tabela   # a tabela de andamento
onp-spec resumo catalogo-loja            # o resumo em texto
```

