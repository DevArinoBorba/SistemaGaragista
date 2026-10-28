# Arquitetura proposta para uma única loja

Estado: desenho implementado; evidências e limites em `docs/setup.md` e `docs/architecture.md`.

## Fatia inicial

Catálogo público em `/`, anúncio em `/veiculos/[id]`, login em `/admin/login` e estoque em `/admin/veiculos`. Formulários de criação e edição no painel. Visitantes não precisam de conta; cadastro público de administradores não entra nesta entrega.

## Dados propostos

Um estoque da loja, sem tabela de organizações ou tenant_id. Veículos com identidade estável, marca, modelo, versão opcional, ano de fabricação/modelo, quilometragem, preço em centavos de real, combustível, câmbio, cor, descrição e status. Fotos ordenadas com uma capa. Datas de criação/alteração em UTC. Status propostos: rascunho, publicado e vendido; exclusão confirmada remove o anúncio do catálogo.

Campos, status e fotos confirmados pelo usuário. Não criar anúncios fictícios no estoque real. Fixtures de testes permanecem em banco temporário separado do banco da loja.

## Segurança proposta

Login por e-mail e senha com Better Auth 1.7.10, sessão no PostgreSQL e criação inicial de administrador por comando local. Criptografia e formato de sessão pertencem à biblioteca. Sem cadastro público. Toda consulta privada e operação de escrita exige sessão e autorização verificadas no servidor. Origin/CSRF e rate limit ativados. Senhas não são recebidas por argumentos nem registradas em logs.

## Banco e fotos no desenvolvimento

Drizzle e pg preservados. Após revisar a primeira migration, aplicação feita apenas ao PostgreSQL local isolado deste projeto. Docker não iniciou; usado PostgreSQL nativo 18.4 com wrapper de desenvolvimento embedded-postgres. Configuração privada em `.env.local` e `.local/`. Sem uso de banco de outro projeto, SQLite ou serviço cloud.

Proposta para fotos: arquivos locais ignorados no desenvolvimento, com limites de formato, tamanho e quantidade e nomes gerados no servidor. O local de upload não pode permitir execução de arquivos ou traversal. Armazenamento durável de produção será escolhido antes da publicação; a solução local não equivale a armazenamento serverless persistente.

## Fronteiras e testes

Apresentação → módulos de funcionalidade → autorização/validação → consultas Drizzle parametrizadas. DTO público exclui dados de sessão/administrador. Listagens limitadas. Testes de domínio em Vitest, integração SQL distinguindo engine embarcado de PostgreSQL conectado, e testes de fluxo em navegador quando as telas existirem. Critérios de persistência e login precisam de prova de comportamento; mocks isolados não comprovam funcionamento completo.

## Design

Interface em português, catálogo centrado nas fotos e dados dos veículos, painel orientado a tarefas. Sem estatísticas, depoimentos ou dados da loja inventados. Nome comercial, contato e logotipo reais serão configurações da loja, não suposições apresentadas como fatos. Direção visual detalhada e inspeção responsiva serão produzidas na tarefa de interface usando as skills pertinentes.
