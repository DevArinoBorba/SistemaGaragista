# Spec: Identidade comercial e canais de contato da loja

> feature: identidade-loja
> status: auditada

## Contexto

Permitir que o administrador da única loja configure e altere pelo painel (`/admin/loja`) toda a identidade comercial, CNPJ, imagens institucionais (logotipo e imagem de capa/fachada) e canais de contato (WhatsApp, telefone, e-mail, endereço e horário de atendimento), refletindo essas informações no catálogo público, rodapé e atendimento direto de cada anúncio publicado.

## Histórias

### US-004 — Configurar identidade, CNPJ, imagens e canais de contato no painel

Como administrador da loja, quero editar no painel o nome comercial, slogan, CNPJ, logotipo, imagem de capa e todos os canais de atendimento para manter os dados e a apresentação visual do site atualizados.

#### AC-011 — Painel salva identidade, CNPJ, imagens e contatos da loja

- **Dado** um administrador autenticado na página de configuração da loja (`/admin/loja`)
- **Quando** preenche e salva nome comercial, slogan, CNPJ, WhatsApp, telefone, e-mail, endereço, horário de atendimento e imagens válidas da loja (logotipo e capa)
- **Então** os dados e imagens convertidas em WebP são persistidos, o painel exibe confirmação de sucesso e o cabeçalho, a apresentação inicial e o rodapé públicos passam a exibir a nova identidade, CNPJ, imagens e contatos.

#### AC-013 — Alteração da loja exige autorização e validação no servidor

- **Dado** uma tentativa sem sessão administrativa válida ou com dados inválidos (como nome comercial vazio, CNPJ inválido, WhatsApp/telefone fora do formato ou arquivo de imagem inválido)
- **Quando** tenta salvar as configurações da loja pelo formulário ou chamada direta à Server Action
- **Então** a operação é recusada no servidor com identificação do erro e os dados e imagens anteriores da loja permanecem preservados.

### US-005 — Consultar dados da loja e acionar contato direto no anúncio

Como visitante interessado em um veículo, quero ver a identidade, o CNPJ, o endereço e os canais de atendimento da loja e iniciar contato direto na página do anúncio já com os dados do veículo.

#### AC-012 — Anúncio publicado exibe canais da loja e WhatsApp com dados do veículo

- **Dado** uma loja com canais de contato configurados e um veículo publicado
- **Quando** o visitante abre a página de detalhes do veículo (`/veiculos/[id]`)
- **Então** vê os dados de atendimento da loja (WhatsApp, telefone, e-mail, endereço e horário) e o link de WhatsApp direciona para o número configurado com mensagem pré-preenchida contendo marca, modelo e ano do veículo.

#### AC-014 — Catálogo e anúncio permanecem honestos sem contatos ou imagens fictícias por padrão

- **Dado** que o administrador ainda não cadastrou CNPJ, imagens da loja ou canais de contato
- **Quando** o visitante acessa o catálogo ou um anúncio publicado
- **Então** vê a identificação padrão (`Garagista`) sem exibir CNPJ falso, imagens quebradas ou links de WhatsApp/telefone fictícios.

## Fora de escopo

Múltiplas lojas, envio automático via API paga do WhatsApp, chat em tempo real embutido e armazenamento de imagens em nuvem externa nesta etapa.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-005 | Configuração da única loja persistida em `store_settings` (registro único `'default'`), incluindo nome, slogan, CNPJ, WhatsApp, telefone, e-mail, endereço, horário, `logoPhoto` e `heroPhoto` | confirmada | Usuário determinou em 2026-10-26 que todos os contatos, CNPJ e imagens da loja sejam editáveis no painel admin |
| ASM-006 | Link de WhatsApp usa `https://wa.me/<digitos>?text=<mensagem>` com DDI `55` padrão para números nacionais de 10 ou 11 dígitos, e imagens da loja usam conversão Sharp WebP em `.local/uploads` servidas em `/api/store/[name]` | confirmada | Usuário autorizou seguir com a melhor decisão técnica em 2026-10-26 |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-005 | Quais campos da loja devem ser editáveis pelo administrador no painel? | respondida | Todos os dados de contato (WhatsApp, telefone, e-mail, endereço, horário), nome comercial, slogan, CNPJ e imagens da loja (logotipo e capa), mantendo padrão inicial limpo editável no painel |
| Q-006 | Quais tarefas paralelizar na execução? | respondida | Usuário autorizou paralelizar todas as tarefas possíveis e seguir com a melhor decisão técnica |
