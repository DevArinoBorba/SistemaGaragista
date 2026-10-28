<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Garagista

## Produto e comandos

Leia `PRODUCT.md` para o escopo, `docs/architecture.md` para estrutura e `docs/setup.md` para evidências. Stack: Next.js 16.4.2, React 19.3, TypeScript strict, Tailwind 4, Drizzle/PostgreSQL, Node 24 e pnpm 12.

Comandos: `pnpm install --frozen-lockfile`, `pnpm db:local`, `pnpm admin:create`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm lint:rules`, `pnpm test`, `pnpm build`, `pnpm check`. `pnpm test:integration` exige build atualizado, PostgreSQL local deste projeto e Chrome; cria e limpa banco/servidor de teste próprios. `pnpm db:generate` gera SQL; `pnpm db:migrate` exige destino autorizado e revisão do SQL.

## Regra global de portas — Maestri

Antes de iniciar servidores, containers, bancos, previews, proxies ou testes com serviços locais, leia `C:/Users/arino/.maestri/PORT_POLICY.md` e execute `C:/Users/arino/.maestri/Find-FreePort.ps1` para cada porta necessária. Confira a disponibilidade antes do startup; se ocupada, escolha automaticamente uma porta livre e atualize as URLs, Origin/CORS, proxy, Compose, testes e portal do próprio projeto. Preserve segredos e dados. Nunca encerre processos de outros projetos para liberar portas. Aplique em todos os projetos desta máquina. `dev` e `start` integram o verificador, com bind em `127.0.0.1`.

## Acordos

- Preserve arquivos e alterações locais. Complete o escopo autorizado; pergunte apenas por informação indispensável ou ação fora dele.
- Não invente funcionalidades, credenciais ou resultados de integrações. Catálogo e painel para uma única loja estão implementados; não adicione múltiplas lojas sem novo escopo. Credenciais iniciais são geradas localmente e ficam em `.local/first-access.json`, nunca nos logs.
- Banco, ambiente e logger são exclusivos do servidor. Apresentação chama módulos de funcionalidade, sem importar banco diretamente.
- Use Zod nas fronteiras, Pino sem segredos, consultas parametrizadas, DTOs explícitos e listagens limitadas.
- Pool limitado e lazy. Não conecte ou migre no build/import/request; gere e revise SQL antes de aplicar em destino autorizado.
- Autentique e autorize escritas no servidor. Esta versão tem uma única loja. Preserve Better Auth, isAdmin verificado no servidor, cadastro público desativado e as proteções de Origin/CSRF. Não trate proteção apenas no layout como suficiente.
- Componentes servidor por padrão; HTML acessível, teclado, foco, estados de erro e espera. Não crie abstrações antecipadas.
- Atualize o documento responsável junto da mudança. Execute checks pertinentes e registre limites; testes do pool usam mock.
- Não publique, contrate serviços ou envie mensagens sem autorização. Não adicione hooks Git, proteção de main ou exigência de branch/worktree.
- Preserve cliente, modelo e autenticação. Sem API paga ou proxy implícito. Delegação somente quando solicitada ou exigida por instrução aplicável.

## Ferramentas

Ponytail full orienta a menor solução completa; Caveman, conversa concisa em português; Superpowers, processo proporcional ao escopo. Esses acordos não comprovam instalação dos plugins, ausentes na descoberta inicial. Não altere preferências globais para simulá-los.

Context7 configurado localmente; consulte documentação atual sem segredos e confira descoberta antes de depender dele. Na indisponibilidade, use fontes oficiais e registre o limite. RTK ausente no PATH inicial; não instale binários globais automaticamente. Graphify 0.9.91 disponível em `.local/graphify/Scripts/graphify.exe`; comandos de recriação/extração em `docs/setup.md`. Use `.graphifyignore`; não ative hooks, refresh automático ou extração por LLM externo.

Skills locais em `.agents/skills/`: `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `writing-guidelines`, `vercel-react-view-transitions`, `vercel-optimize`, `deploy-to-vercel`, `vercel-cli-with-tokens`. Cópias locais com `skills-lock.json`; `find-skills` reutilizada do escopo global para evitar duplicação. Instalação não executa deploy ou animações.

Após implementação ou correção, sugira 3 a 8 ciclos posteriores de revisão conforme risco, com focos e checks; isso não autoriza executar as rodadas. Proposta atual: 3 ciclos em `docs/quality.md`.
