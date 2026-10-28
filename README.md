# Garagista

Catálogo público e painel de veículos para uma única loja. Visitantes consultam anúncios publicados; o administrador cadastra, edita, publica, marca como vendido e remove veículos.

## Rodar no Windows

Requer Node 24 e pnpm 12.8.1. O PostgreSQL local é isolado neste projeto e não depende do Docker.

```powershell
pnpm install --frozen-lockfile
pnpm db:local
```

Deixe esse terminal aberto. Na primeira execução, o launcher cria o banco e a configuração privada em `.env.local`. Ele consulta a política Maestri para escolher uma porta livre e preserva os dados em `.local/postgres-data`.

Em outro terminal, no primeiro setup de um banco novo:

```powershell
pnpm db:migrate
pnpm admin:create
pnpm dev
```

Leia as credenciais iniciais em `.local/first-access.json`, que fica fora do Git. O comando de criação não redefine contas existentes. Opcionalmente, defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` no ambiente do terminal antes de criar a primeira conta. Não passe senhas como argumentos ou envie-as no chat.

`pnpm dev` imprime a URL livre em 127.0.0.1 e alinha a origem da autenticação à porta. Catálogo em `/`; painel em `/admin/veiculos`; login em `/admin/login`. Use Ctrl+C nos terminais correspondentes para encerrar apenas os serviços deste projeto. O launcher de banco é destinado ao ambiente Windows desta máquina.

## Uso

No painel, adicione marca, modelo, versão, anos, km, preço, combustível, câmbio, cor, descrição e fotos. Preços são informados sem separador de milhar, por exemplo `75900,00`. Até 12 fotos JPEG, PNG ou WebP, com 8 MB por arquivo e 20 MB por envio. As fotos são convertidas para WebP; escolha a capa na edição.

Rascunhos e vendidos ficam apenas no painel. Somente anúncios publicados aparecem no catálogo e permitem acesso público às suas fotos. A remoção exige confirmação. O catálogo tem busca e paginação; o estoque começa sem anúncios de demonstração.

## Verificar

```powershell
pnpm check
pnpm test:integration
```

`check` executa lint, tipos, regras locais, testes unitários e build. Após o build, com o PostgreSQL local ativo, a integração cria um banco temporário separado, aplica migrations, inicia um servidor de teste em porta livre e usa o Chrome instalado. Ao final, remove apenas banco, fotos e servidor dos próprios testes. Não executa contra conexão externa.

## Limites desta entrega

Uma loja, acesso administrativo por e-mail/senha e fotos em disco local. Antes de publicar, escolher armazenamento durável de fotos, hospedagem, banco de produção e dados reais da loja. Não há múltiplas lojas, pagamentos, cadastro público de administradores ou serviço de recuperação de senha por e-mail.

## Documentação

- [Produto](PRODUCT.md) e [especificação](.spec/features/catalogo-loja/spec.md)
- [Instruções para agentes](AGENTS.md) e [ponte Claude](CLAUDE.md)
- [Arquitetura](docs/architecture.md), [design](docs/design.md) e [preparação](docs/onboarding.md)
- [Qualidade](docs/quality.md) e [setup com evidências](docs/setup.md)

Stack: Next.js App Router, TypeScript, Tailwind, Drizzle/PostgreSQL, Better Auth, Zod, Pino, Sharp e Vitest. Versões no lockfile. Base criada com create-next-app e o [Vibe Coding Toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit).
