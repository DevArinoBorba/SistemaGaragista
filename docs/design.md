# Design e acessibilidade

Catálogo e painel em português para uma única loja. A interface dá prioridade aos anúncios reais e mantém o estoque vazio até o administrador adicionar veículos.

## Direção visual

Redesign de 2026-10-28, direção escolhida pelo responsável: "Showroom noturno" alinhado à identidade visual da logo Orium Veículos. Referências analisadas: Porsche Finder (cards com foto ampla, hierarquia modelo → specs → preço), Longbow Motors e Rolls-Royce (muito respiro, tipografia contida), hipercarros como Koenigsegg (carrossel central tipo galeria). O site público é escuro porque a foto do veículo é o objeto: grafite frio (`#0c0b10`), texto prata-alabastro (`#f0edf7`), acento roxo Orium (`#b366ff` / hover `#c78aff`) usado só em ação principal, foco, progresso e selo "Novo no estoque".

Tipografia: Bodoni Moda (títulos, nome da loja, preços de destaque) e Archivo com eixo de largura (interface, specs; nomes de modelo em caixa alta expandida, como emblema). Ambas via `next/font` em `layout.tsx`; tokens em `src/app/globals.css`. Ícones SVG próprios em `src/components/icons.tsx`, sem glifos Unicode.

Estrutura pública: cabeçalho fixo translúcido; hero com a capa da loja (ou luz de piso em gradiente roxo quando não há capa, sem foto inventada) e o nome da loja em escala grande; carrossel "Recém-chegados" (até 6 anúncios, só na página 1 sem filtros e com 3+ veículos); estoque completo com busca, filtros em pílulas, grade de cards e paginação; rodapé com contatos (`#contato`). Detalhe: galeria 16:10, ficha lateral fixa com preço, especificações e CTA de WhatsApp em roxo Orium, descrição na coluna principal e carrossel compacto de outros veículos (até 8).

Interação assinatura: no carrossel de destaques o slide ativo fica iluminado e os demais esmaecem, como um carro sob o spot do showroom; setas, contador e barra de progresso acompanham o scroll-snap, que também funciona por toque e teclado (trilho focável). Único movimento de entrada: a capa da loja "acende" (brilho e escala) no carregamento. Tudo respeita `prefers-reduced-motion`.

Admin usa o mesmo sistema em variante clara e sóbria (escopo `.admin-shell`/`.login-page`): lavanda clara (`#f4f2f8`), branco, tinta grafite e roxo profundo `#6d28d9` como acento, sem alterar fluxos, rótulos ou formulários.

## Estados e acessibilidade

Catálogo vazio e sem resultados, detalhe não encontrado, erro recuperável, formulário pendente, validação por campo, sucesso, remoção confirmada/cancelada e login inválido. Campos têm rótulos; alertas e status são anunciados. Foco visível, link para pular ao conteúdo, controles nativos e redução de movimento. Dialog nativo mantém o foco e permite cancelar; checkbox e radio escolhem fotos e capa.

Entradas discretas usam transform/opacity e respeitam prefers-reduced-motion. O inspector registrou 10 elementos em movimento e um aviso de pouco movimento; mantido para privilegiar consulta e evitar animação excessiva no estoque. Não há vídeo decorativo de terceiros.

## Revisão visual

Redesign verificado em 2026-10-28: `pnpm lint`, `typecheck`, `lint:rules`, `test` (17), `build` e `test:integration` (31, incluindo ausência de overflow em 1440/768/390) aprovados; detector Impeccable sem achados. Capturas em 1440 e 390 px de catálogo vazio, catálogo com estoque, carrossel avançado, detalhe, login, estoque e edição no admin, feitas num banco temporário próprio com fotos sintéticas geradas apenas para QA (não incorporadas ao site, removidas ao final).

Limites: nas capturas de página inteira os cards abaixo da dobra aparecem sem foto porque `next/image` carrega sob demanda; na navegação real elas carregam ao rolar. O carrossel duplica intencionalmente os primeiros anúncios do estoque; uma curadoria manual de destaques exigiria novo campo e escopo próprio.
