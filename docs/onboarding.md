# Preparação local

Use Node 24, pnpm 12.8.1 e Windows PowerShell. Leia o [README](../README.md) para a sequência completa: instalação, `pnpm db:local`, migrations, primeira conta e `pnpm dev`.

## Portas e dados

Os launchers leem a política Maestri e executam Find-FreePort antes de iniciar PostgreSQL ou Next. Usam IPv4 loopback e imprimem a porta retornada. Não encerre processos de outros projetos. Não inicie outro launcher para o mesmo diretório de dados enquanto o banco estiver ativo.

O PostgreSQL nativo foi escolhido porque Docker Desktop não iniciou nesta máquina. Os binários são locais às dependências de desenvolvimento. O wrapper npm embedded-postgres 18.4.0-beta.17 tem canal beta, mas distribui PostgreSQL estável 18.4; foi avaliado com inicialização, autenticação, migration e integração reais. Não foi usado prerelease do framework ou serviço cloud.

`.local/postgres-config.json` guarda o acesso ao cluster; `.local/postgres-data` guarda os dados; `.env.local` fornece DATABASE_URL e BETTER_AUTH_SECRET. Esses arquivos não são versionados. O launcher recusa sobrescrever uma DATABASE_URL que não reconheça como sua. Não remova `.local` para resolver problemas de startup.

## Primeiro administrador

`pnpm admin:create` cria a primeira conta com senha aleatória e grava `.local/first-access.json`. Para definir seus próprios valores, use `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` no ambiente do terminal antes do comando. O comando padrão não redefine uma conta existente; para trocar credenciais e revogar sessões ativas, use `pnpm admin:rotate` (opcionalmente com `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`). Não exponha `.local/first-access.json` em servidor web ou Git.

## Origem da autenticação

`pnpm dev` alinha BETTER_AUTH_URL à porta escolhida. `pnpm start` exige build e preserva BETTER_AUTH_URL existente; sem valor, usa sua URL local. Produção deve definir explicitamente uma origem HTTPS e segredo privado estável. Nenhum domínio foi configurado nesta entrega.

## Testes

`pnpm check` não aplica migrations. `pnpm test:integration` exige build atualizado, banco local ativo e Chrome. O teste confirma a identidade da conexão local antes de criar banco temporário; ele recusa destinos externos. Não use banco de produção para esses testes. Evidências locais em `.local/qa`, ignoradas pelo Git.

## Reiniciar

Encerre o servidor e o launcher de banco nos terminais correspondentes. Ao retomar, execute `pnpm db:local` e `pnpm dev`. Dados persistem. Use `pnpm db:migrate` explicitamente quando houver novas migrations revisadas.

Consulte [AGENTS](../AGENTS.md), [qualidade](quality.md) e [setup](setup.md). Não copie credenciais de outro projeto.
