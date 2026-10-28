# Spec: Catálogo e administração de uma loja

> feature: catalogo-loja
> status: auditada

## Contexto

O usuário confirmou uma única loja nesta versão. Entregar consulta pública do estoque e gestão administrativa protegida. A expansão para várias lojas é futura e não faz parte da arquitetura desta entrega.

## Histórias

### US-001 — Consultar os veículos à venda

Como visitante, quero ver os veículos da loja e seus detalhes para avaliar os anúncios.

#### AC-001 — Catálogo mostra apenas anúncios publicados

- **Dado** um estoque com veículos publicados, rascunhos e vendidos
- **Quando** o visitante abre o catálogo
- **Então** encontra apenas os publicados, com foto de capa quando existente, marca, modelo, ano, quilometragem e preço em reais.

#### AC-002 — Detalhe público respeita a publicação

- **Dado** um veículo publicado e outro não publicado
- **Quando** o visitante acessa cada endereço de anúncio
- **Então** vê os detalhes do publicado; o anúncio não publicado não revela seus dados e apresenta página de não encontrado.

#### AC-003 — Estoque vazio tem mensagem útil

- **Dado** que não existem veículos publicados
- **Quando** o visitante abre o catálogo
- **Então** vê uma mensagem de estoque vazio e não vê veículos fictícios.

### US-002 — Entrar no painel com segurança

Como administrador da loja, quero acessar o painel com credenciais próprias para manter o estoque.

#### AC-004 — Login e encerramento de sessão

- **Dado** um administrador criado por procedimento autorizado
- **Quando** informa credenciais válidas e depois encerra a sessão
- **Então** consegue acessar o painel enquanto autenticado e deixa de acessá-lo após sair; credenciais inválidas recebem mensagem genérica.

#### AC-005 — Escritas exigem autorização no servidor

- **Dado** uma pessoa sem sessão administrativa válida
- **Quando** tenta consultar dados privados ou criar, editar, remover ou enviar fotos diretamente às ações do servidor
- **Então** o acesso é negado e o estoque permanece inalterado.

### US-003 — Manter anúncios atualizados

Como administrador autenticado, quero cadastrar, editar e retirar veículos do catálogo para refletir meu estoque.

#### AC-006 — Cadastro válido persiste após nova leitura

- **Dado** um administrador autenticado e os dados válidos de um veículo
- **Quando** salva e publica o anúncio
- **Então** o veículo é persistido e aparece em uma nova leitura do catálogo; o painel mostra sucesso e o anúncio criado.

#### AC-007 — Dados inválidos não alteram o estoque

- **Dado** um cadastro com preço ou quilometragem negativos, anos inválidos ou marca/modelo ausentes
- **Quando** o administrador tenta salvar
- **Então** os campos inválidos são identificados e nenhum anúncio é criado ou alterado.

#### AC-008 — Edição e retirada atualizam o catálogo

- **Dado** um anúncio publicado
- **Quando** o administrador edita seus dados ou o marca como vendido/rascunho
- **Então** a edição aparece em nova leitura e anúncios vendidos/rascunhos deixam de ser exibidos publicamente.

#### AC-009 — Remoção exige confirmação e retira o anúncio

- **Dado** um anúncio existente
- **Quando** o administrador cancela a remoção e depois a confirma
- **Então** o cancelamento mantém o anúncio; a confirmação o remove do estoque e seu endereço público deixa de expor os dados.

#### AC-010 — Fotos válidas e seguras

- **Dado** um administrador autenticado e arquivos de imagem válidos e inválidos
- **Quando** envia fotos de um anúncio
- **Então** fotos aceitas ficam vinculadas em ordem e com capa; formato inválido, tamanho excedido ou caminho manipulado são rejeitados sem gravar fora do diretório autorizado.

## Fora de escopo

Múltiplas lojas, equipe com papéis distintos, cadastro público de administradores, pagamentos, financiamento, importação de estoque, domínio, deploy, contratação de serviços e armazenamento de produção. Sem anúncios demonstrativos no estoque real.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-001 | Catálogo sem login, interface pt-BR e valores em reais | confirmada | Usuário aprovou a proposta em 2026-10-16 |
| ASM-002 | Cadastro com marca, modelo, versão opcional, ano fabricação/modelo, km, preço, combustível, câmbio, cor, descrição e fotos | confirmada | Usuário aprovou a proposta em 2026-10-16 |
| ASM-003 | Estados rascunho, publicado e vendido; somente publicado no catálogo | confirmada | Usuário aprovou a proposta em 2026-10-16 |
| ASM-004 | Login administrativo por e-mail/senha, sem cadastro público; fotos locais no desenvolvimento | confirmada | Usuário aprovou a proposta em 2026-10-16 |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-001 | Uma loja ou múltiplos garagistas? | respondida | Uma única loja; expansão será avaliada depois, conforme usuário em 2026-10-16 |
| Q-002 | Confirmar campos, estados e acesso propostos? | respondida | Proposta confirmada pelo usuário |
| Q-003 | Qual PostgreSQL autorizado usar na validação local? | respondida | Usar PostgreSQL local isolado do projeto, sem Docker e sem tocar bancos existentes |
| Q-004 | Executar sequencialmente na sessão atual ou autorizar tarefas paralelas com modelo/esforço definidos? | respondida | Execução sequencial aprovada; GPT-6.1-sol, esforço médio |

