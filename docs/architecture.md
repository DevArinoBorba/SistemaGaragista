# Código e arquitetura

Aplicação para uma única loja, confirmada pelo usuário. Não há tenant_id, cadastro de organizações ou seleção de loja. Expansão futura exige projeto próprio.

## Stack e fronteiras

Next.js 16.4.2, React 19.3, TypeScript strict, Tailwind 4, Drizzle ORM/pg, Better Auth 1.7.10, Sharp e Vitest em Node 24. Páginas são Server Components; formulários interativos são Client Components. Apresentação chama módulos de funcionalidades, sem importar o cliente de banco diretamente. Ambiente, autenticação, banco, repositório e armazenamento usam server-only.

## Mapa do código

- `src/db/`: pool lazy, schema de veículos, configuração da loja (`store_settings`) e autenticação; migrations versionadas em `drizzle/`
- `src/features/vehicles/`: validação Zod (anúncios e filtros combinados), consultas, leitura pública, sitemap e Server Actions protegidas
- `src/features/store/`: validação Zod de identidade/CNPJ/contatos, repositório de `store_settings` e Server Action protegida (`saveStoreSettingsAction`)
- `src/features/auth/`: configuração lazy Better Auth, sessão administrativa e exigência de acesso
- `src/features/uploads/`: validação, conversão e reconciliação de imagens (`reconcileOrphanPhotos`); arquivos em `.local/uploads`
- `src/components/`: cabeçalho/rodapé com identidade da loja, catálogo, galeria horizontal de fotos (`vehicle-gallery`), paginação com preservação de filtros e formulários do painel (`vehicle-form`, `store-form`)
- `src/app/`: catálogo, anúncio, login, painel protegido (`/admin/veiculos`, `/admin/loja`), metadados dinâmicos (`sitemap.ts`, `robots.ts`) e handlers de autenticação e imagens (`/api/photos`, `/api/store`)
- `scripts/local-db.mjs`: PostgreSQL nativo isolado, com reserva de porta e dados privados locais
- `scripts/create-admin.ts`: criação explícita da primeira conta administrativa e rotação de senha (`--rotate`)
- `scripts/backup-local.ts`: snapshot local consistente de `store_settings`, `vehicles` e `.local/uploads` em `.local/backups/`
- `tests/`: integração em PostgreSQL real e Chrome com banco temporário próprio
- `src/lib/`: ambiente, logger e composição de classes

## Rotas

| Rota | Acesso e comportamento |
| --- | --- |
| `/` | Público; exibe identidade/capa da loja, metadados Open Graph + JSON-LD (`AutoDealer`), busca e filtros combinados (marca/modelo/versão, câmbio, combustível e ordenação), 12 veículos por página e rodapé com canais configurados |
| `/veiculos/[id]` | Somente veículo publicado; exibe metadados Open Graph + JSON-LD (`Car`), dados do veículo, canais da loja e botão de WhatsApp com mensagem pré-preenchida; demais retornam 404 |
| `/sitemap.xml` e `/robots.txt` | Dinâmicos (`force-dynamic`); listam apenas `/` e veículos publicados, bloqueando `/admin/` e `/api/` |
| `/admin/login` | Entrada administrativa; sessão já autenticada redireciona ao painel |
| `/admin/veiculos` | Estoque protegido com busca e filtros por situação, combustível, câmbio e ordenação, 24 veículos por página |
| `/admin/veiculos/novo` | Cadastro protegido |
| `/admin/veiculos/[id]/editar` | Edição protegida |
| `/admin/loja` | Configuração protegida de identidade comercial, CNPJ, imagens (logotipo e capa), canais de contato e exportação JSON da loja |
| `/api/admin/estoque.csv` e `/api/admin/backup.json` | Exportações protegidas do estoque (CSV sanitizado) e retrato completo da loja e veículos (JSON) com `no-store`/`nosniff` |
| `/api/auth/[...all]` | Allowlist de login, logout, sessão e health; sem cadastro público |
| `/api/photos/[vehicleId]/[name]` | Verifica vínculo, status e autorização antes de ler arquivo |
| `/api/store/[name]` | Verifica formato seguro do nome e vínculo ativo (`logoPhoto` ou `heroPhoto`) em `store_settings` antes de servir a imagem |

## Dados

`vehicles` contém identidade UUID, características, preço inteiro em centavos, status, lista ordenada de nomes de fotos e timestamps UTC. Status: draft, published e sold. Constraints impedem valores negativos, nomes vazios, anos inconsistentes e mais de 12 fotos. Índice parcial ordena o catálogo publicado. Busca usa parâmetros e listagens têm limite/offset com ordem estável por criação e id.

`store_settings` armazena em registro único (`id = 'default'`, garantido por constraint check) a identidade comercial e os canais da loja: `name` (padrão `"Garagista"`), `tagline`, `cnpj`, `whatsapp`, `phone`, `email`, `address`, `openingHours`, `logoPhoto`, `heroPhoto` e `updatedAt`. Enquanto não houver registro salvo, a leitura pública retorna `defaultStoreSettings` sem canais fictícios.

Tabelas Better Auth: usuário, conta, sessão, verificação e rate limit. Campo isAdmin não é aceito em inputs públicos. Cadastro desativado; somente a primeira conta é criada por comando local (`pnpm admin:create`), com hash scrypt da própria biblioteca. O comando padrão recusa alterar contas existentes; `pnpm admin:rotate` rotaciona a senha e revoga sessões em transação explícita.

Pool de até 5 conexões, timeout de conexão de 5 s e timeout ocioso de 30 s. Criação lazy e reutilização durante HMR. Nenhuma migration ocorre em build/import/request. `db:generate` gera SQL; `db:migrate` aplica explicitamente em destino autorizado. A primeira migration foi aplicada somente ao banco local deste projeto.

## Segurança de acesso

Layout e páginas privadas exigem sessão de administrador. Cada Server Action repete a autorização antes de ler veículos ou processar arquivos. Better Auth mantém sessões no banco, sem cookie cache, duração de 8 horas e revogação no logout. Rate limit persistido no PostgreSQL: 5 logins por minuto e limite geral de 60 requisições por minuto. Origin/CSRF seguem Better Auth e Next Server Actions; não desativados.

Respostas públicas não incluem contas, sessões ou configuração. Credenciais são privadas e ignoradas pelo Git. Erros públicos usam mensagens genéricas e logs não incluem o payload completo.

## Fotos

Até 12 fotos, 8 MB por arquivo e 20 MB por envio. Aceita JPEG/PNG/WebP, verifica decodificação e limita pixels a 25 milhões. Sharp aplica orientação, reduz a até 1920 × 1920 e recodifica em WebP sem metadados. Nomes UUID gerados no servidor; nomes e vínculo validados ao servir. Imagens não publicadas exigem sessão administrativa. Respostas no-store permitem revogação imediata.

Upload valida o lote completo antes de converter e grava arquivos novos antes do banco; se a escrita falhar ou detectar edição concorrente nas fotos (`WHERE id = $1 AND photos = $2`), os novos arquivos são removidos imediatamente. Após salvar/remover, limpa os arquivos que perderam vínculo. Falha de filesystem posterior pode deixar órfãos e é registrada; não há transação distribuída entre disco e banco. `reconcileOrphanPhotos` permite reconciliar arquivos sem vínculo respeitando janela de proteção. Disco local serve ao desenvolvimento e a hosts com volume persistente, não a armazenamento efêmero serverless.

## Verificação e manutenção

Unidades cobrem ambiente, logs, pool, validação, autorização antes de I/O e arquivos malformados. Integração usa outro banco PostgreSQL no cluster local, criado com nome aleatório reservado ao teste; navega em Chrome e verifica persistência e chamadas diretas. Limpeza não remove dados do banco da loja.

Não há loader global antes das decisões de 404/login: evitar iniciar streaming antes dessas decisões. Loading do estoque fica dentro da área protegida. Ao mudar comportamento, atualizar documento, spec e testes correspondentes.
