# Garagista

## Problema e objetivo

Uma loja de veículos precisa divulgar seu negócio e os veículos à venda online. O Garagista oferecerá um catálogo público para clientes e um painel para manter os anúncios atualizados.

## Público e papéis

- Visitante: consulta o catálogo e os detalhes dos veículos de um garagista.
- Garagista administrador: controla os veículos cadastrados no seu site.

## Fluxos da versão inicial

1. O visitante acessa a página do garagista, consulta os veículos disponíveis, vê a identidade e canais da loja e abre um anúncio com contato direto via WhatsApp.
2. O administrador acessa o painel, cadastra um veículo e publica seus dados no catálogo.
3. O administrador edita ou remove um anúncio e acompanha a atualização no site.
4. O administrador configura no painel (`/admin/loja`) o nome comercial, slogan, CNPJ, logotipo, imagem de capa e canais de atendimento da loja.

## MVP entregue

Catálogo público paginado com busca; detalhe apenas para veículos publicados com contato direto da loja e link de WhatsApp pré-preenchido com os dados do veículo; acesso administrativo protegido por e-mail e senha (Better Auth 1.7.10, sem cadastro público); cadastro, edição, mudança de situação (`draft`, `published`, `sold`) e remoção confirmada de veículos; configuração administrativa da identidade comercial da loja (`/admin/loja`) incluindo nome, slogan, CNPJ, WhatsApp, telefone, e-mail, endereço, horário de atendimento, logotipo e imagem de capa; upload de fotos de veículos (até 12 por veículo) e imagens institucionais da loja com validação e conversão para WebP via Sharp.

## Fora de escopo desta entrega

Múltiplas lojas, cadastro público de administradores, recuperação de senha por e-mail, armazenamento de fotos em nuvem, pagamentos, financiamento, integrações externas, contratação de serviços ou publicação em produção.

## Requisitos

- O catálogo público apresenta apenas os veículos publicados da loja.
- Alterações administrativas e leituras privadas exigem autenticação e autorização (`isAdmin`) no servidor.
- Esta primeira versão atende uma única loja. Não há cadastro de lojas, seleção de organização ou separação por inquilino nesta etapa.
- Validar entradas no servidor, proteger segredos e não expor configuração interna em erros.
- Interface em português brasileiro e utilizável por teclado, celular, tablet e desktop.

## Restrições e decisões técnicas

Next.js 16.4.2 App Router, React 19.3, TypeScript strict, Tailwind CSS 4, pnpm 12.8.1 e runtime Node 24. Persistência com Drizzle ORM e PostgreSQL (cluster local isolado com PostgreSQL 18.4 no desenvolvimento), autenticação Better Auth 1.7.10 e processamento de imagens Sharp. Build e testes unitários independem de credenciais de produção. Não há migrations automáticas no build.

## Decisões confirmadas e pendências para produção

- Decisão confirmada em 2026-10-16: português brasileiro e catálogo sem login para visitantes.
- Decisão confirmada em 2026-10-16: uma única loja inicialmente. Expansão para vários garagistas será avaliada depois, como alteração própria.
- Decisão confirmada em 2026-10-16: login administrativo por e-mail/senha sem cadastro público; primeira conta criada localmente por `pnpm admin:create` com credenciais em `.local/first-access.json`.
- Decisão confirmada em 2026-10-16: campos (marca, modelo, versão opcional, ano fabricação/modelo, km, preço em centavos, combustível, câmbio, cor, descrição e até 12 fotos JPEG/PNG/WebP convertidas em WebP com capa), status (`draft`, `published`, `sold`) e exclusão confirmada.
- Decisão confirmada em 2026-10-26: identidade comercial da loja editável no painel (`/admin/loja`), abrangendo nome comercial, slogan, CNPJ, WhatsApp (link direto `wa.me` com mensagem pré-preenchida do veículo), telefone, e-mail, endereço, horário de atendimento, logotipo e imagem de capa convertidos em WebP (`/api/store/[name]`), mantendo estado padrão honesto sem contatos fictícios quando não preenchidos.
- Pendente antes de produção: provedor de banco gerenciado, armazenamento durável de fotos para ambiente serverless e domínio/hospedagem.

## Critérios de aceitação do produto

1. Dado um veículo publicado, ao acessar o catálogo da loja, o visitante encontra o anúncio e consegue ver seus detalhes (`AC-001`, `AC-002`, `AC-003`).
2. Dado um administrador autorizado, ao cadastrar ou editar um veículo válido, os dados persistidos aparecem no catálogo correspondente (`AC-004`, `AC-006`, `AC-007`, `AC-008`, `AC-010`).
3. Ao remover um anúncio após confirmação, ele deixa de aparecer no catálogo público e no estoque (`AC-009`).
4. Uma pessoa sem autorização não consegue alterar veículos ou dados da loja, nem consultar itens privados por página, endpoint ou chamada direta (`AC-005`, `AC-013`).
5. O administrador consegue configurar a identidade comercial, CNPJ, imagens (logotipo e capa) e canais de contato da loja em `/admin/loja`, refletindo os dados no catálogo, no rodapé e no botão de WhatsApp de cada anúncio publicado, sem contatos fictícios por padrão (`AC-011`, `AC-012`, `AC-014`).
6. O catálogo e o painel representam a mesma loja, sem fluxos de múltiplos negócios.

## Aceite técnico

Instalação reproduzível por lockfile; lint, tipos, regras locais, testes unitários e build executáveis (`pnpm check`); suíte integrada real em PostgreSQL local isolado e Chrome (`pnpm test:integration`) e auditoria mecânica de especificação (`onp-spec verify` + `onp-spec audit --ci`); documentação dos resultados em [docs/setup.md](docs/setup.md) e [docs/quality.md](docs/quality.md).

## Próxima entrega

Preparação de infraestrutura para publicação em produção (banco PostgreSQL gerenciado, armazenamento durável de imagens e domínio/HTTPS) conforme decisão do responsável.

## Manutenção

Atualizar este documento quando o escopo ou os critérios mudarem. Decisões técnicas ficam em [docs/architecture.md](docs/architecture.md).
