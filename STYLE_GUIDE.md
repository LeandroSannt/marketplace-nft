# Style Guide — Kurio NFT Marketplace

Fonte: [Figma — Frontend Challenge](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1), página **Marketplace de NFTs GreenMint**. Valores extraídos do painel de propriedades de cada nó dos 15 frames (variáveis e estilos nomeados do arquivo).

Regra: **todo valor visual do código sai deste guia**, via tokens do Tailwind. Nada de hex solto ou valor arbitrário quando existe token. Desvios do Figma são registrados na seção 10 e em `ARCHITECTURE.md`.

Marca no layout: **KURIO**. Tema único, escuro, em tons de marrom e cobre.

---

## 1. Frames de referência

| Desktop (1440 px)               | Mobile (414 px)  |
| ------------------------------- | ---------------- |
| Início                          | Início           |
| Detalhes do NFT                 | Detalhes do NFT  |
| Carrinho de NFTs                | Carrinho de NFTs |
| Pagamento                       | Pagamento        |
| Confirmação de Pedido (modal)   | — (adaptar)      |
| Login (modal sobre o Início)    | Login            |
| Cadastro (modal sobre o Início) | Cadastro         |
| Perfil do Colecionador          | — (adaptar)      |
| Carteiras                       | — (adaptar)      |

---

## 2. Cores

Nomes iguais às variáveis do Figma (`color/*`).

### Superfícies

| Token            | Hex       | Uso                                                                      |
| ---------------- | --------- | ------------------------------------------------------------------------ |
| `ink`            | `#140D0A` | Fundo da página; texto sobre botão primário; contorno do badge           |
| `surface-card`   | `#241612` | Cards, painel de filtros, modais, bottom sheet do resumo, input de cupom |
| `surface-raised` | `#2F1D15` | Elementos elevados dentro de cards (linhas, blocos internos)             |
| `surface-dark`   | `#38220F` | Faixas e blocos de destaque (footer, medalhões)                          |

### Bordas

| Token         | Hex       | Uso                                                         |
| ------------- | --------- | ----------------------------------------------------------- |
| `border`      | `#3F2319` | Borda padrão de inputs, cards e divisores                   |
| `border-soft` | `#55321F` | Ícones de contorno (ex.: olho da senha), bordas secundárias |

### Texto

| Token                         | Hex       | Uso                                                      |
| ----------------------------- | --------- | -------------------------------------------------------- |
| `foreground` / `text-primary` | `#F5F1EB` | Texto principal, títulos, ícones                         |
| `text-secondary`              | `#CFB28C` | Descrições, itens de lista inativos, metadados           |
| `text-accent`                 | `#E89B55` | Item ativo (nav, tab, filtro), links, preços em destaque |
| `text-coral`                  | `#F0805F` | Asterisco de campo obrigatório                           |

### Marca e ação

| Token       | Hex       | Uso                                                                                |
| ----------- | --------- | ---------------------------------------------------------------------------------- |
| `primary`   | `#D28A4C` | Botões primários, foco de input, underline ativo, divisor do header, slider, badge |
| `secondary` | `#B39463` | Placeholders, valores secundários                                                  |
| `amber`     | `#E3A44E` | Destaques pontuais (rating, ícones de medalhão)                                    |

### Feedback

| Token              | Hex       | Uso                                                        |
| ------------------ | --------- | ---------------------------------------------------------- |
| `success`          | `#00A66C` | Pedido confirmado, carteira conectada                      |
| `error`            | `#ED1B2E` | Borda e ícone de erro, pedido recusado                     |
| `error-foreground` | `#FF5A68` | **Ajuste de acessibilidade:** texto de erro (ver seção 10) |

### Neutros auxiliares

| Token                 | Hex       | Uso                                             |
| --------------------- | --------- | ----------------------------------------------- |
| `white`               | `#FFFFFF` | Logos de terceiros, fundos de marca de carteira |
| `black`               | `#000000` | Marcas de terceiros                             |
| `gray-light`          | `#EDEDED` | Fundo de selo de terceiros                      |
| `background-elevated` | `#FBFBFB` | Fundo claro de marca de carteira                |
| `brand-facebook`      | `#1877F2` | Ícone do Facebook no login social               |

### Gradientes

| Token           | Definição                                               | Uso                                                       |
| --------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| `gradient-cta`  | `linear-gradient(90deg, #D28A4C, rgb(210 138 76 / .8))` | Botões pill mobile (Finalizar compra, Confirmar compra)   |
| `gradient-card` | `linear-gradient(180deg, #241612, rgb(36 22 18 / .8))`  | Card de item do carrinho mobile, banner "NFT em destaque" |

### Contraste (texto pequeno, AA ≥ 4.5)

| Combinação                   | Razão aprox.                                 |
| ---------------------------- | -------------------------------------------- |
| `foreground` sobre `ink`     | 17:1                                         |
| `text-secondary` sobre `ink` | 10:1                                         |
| `secondary` sobre `ink`      | 6.5:1                                        |
| `ink` sobre `primary`        | 6.6:1                                        |
| `error` sobre `surface-card` | 4.0:1 ✗ → usar `error-foreground` para texto |

---

## 3. Tipografia

Família única: **Roboto Mono** (variável `font/family`), pesos **400, 500 e 700**. Servir localmente (`@fontsource/roboto-mono`) com `font-display: swap`. Fallback: `ui-monospace, SFMono-Regular, Menlo, monospace`.

O Figma tem cerca de 45 estilos nomeados (ex.: `Body/14 Regular · lh 22`). Eles foram consolidados na escala abaixo. O peso é aplicado à parte (`font-normal`, `font-medium`, `font-bold`).

| Token             | Tamanho / altura          | Pesos usados  | Onde                                                                            |
| ----------------- | ------------------------- | ------------- | ------------------------------------------------------------------------------- |
| `text-display-lg` | 43 / 70                   | 700           | Título do hero desktop ("SEJA DONO DO FUTURO DA ARTE DIGITAL")                  |
| `text-display`    | 32 / 32, `tracking 0.1em` | 700           | Wordmark KURIO nas telas de auth mobile                                         |
| `text-heading-lg` | 28 / 28                   | 700           | Nome do NFT no detalhe desktop                                                  |
| `text-heading`    | 24 / 32                   | 700           | "NFT EM DESTAQUE", selos de serviço                                             |
| `text-title-lg`   | 22 / 29                   | 400, 700      | Preço em destaque no detalhe (700, `text-accent`), asterisco                    |
| `text-title`      | 20 / 24                   | 400, 500, 700 | Títulos de tela mobile ("Entrar", "Carrinho de NFTs"), títulos de modal desktop |
| `text-body-xl`    | 18 / 24                   | 400, 500, 700 | Cabeçalhos de filtro ("Coleções"), totais em ETH, títulos de promo              |
| `text-section`    | 17 / 16                   | 700           | Títulos de seção do detalhe e da conta (tabs, "Você também pode gostar")        |
| `text-body-lg`    | 16 / 20                   | 400, 500, 700 | Nav, botões, valores, labels fortes                                             |
| `text-body-md`    | 15 / 16                   | 400, 500, 700 | Labels de formulário, tabs, nome do NFT no card, itens de filtro                |
| `text-body`       | 14 / 22                   | 400, 500, 700 | Texto corrido, inputs, descrições, endereços de carteira                        |
| `text-caption`    | 13 / 16                   | 400, 500      | "Ou continue com", botões sociais, input de cupom                               |
| `text-caption-sm` | 12 / 16                   | 400, 500, 700 | "Taxa estimada", eyebrow, metadados                                             |
| `text-tiny`       | 10 / 10                   | 500           | Contador do badge do carrinho                                                   |
| `text-micro`      | 9 / 9, `tracking 0.1px`   | 700           | Selos de marcas de carteira                                                     |

Variações de altura de linha usadas em contextos específicos:

| Contexto                                          | Classe                                           |
| ------------------------------------------------- | ------------------------------------------------ |
| Descrição do hero e de textos longos (14 / 24)    | `text-body leading-6`                            |
| Itens da lista de filtros (15 / 40)               | `text-body-md leading-10`                        |
| Links de rodapé (14 / 30)                         | `text-body leading-[30px]` (exceção documentada) |
| Wordmark no header desktop (14, `tracking 0.1em`) | `text-body font-bold tracking-[0.1em]`           |

Texto em caixa alta (hero, "EXPLORAR", "COMPRAR", "NFT EM DESTAQUE") já vem assim no conteúdo. No código, usar `uppercase` sobre o texto normal para não prejudicar leitores de tela.

---

## 4. Espaçamento e layout

Base de **4 px**. A escala padrão do Tailwind cobre todos os valores do Figma.

| Valor (px)   | Tailwind           | Uso típico                                                          |
| ------------ | ------------------ | ------------------------------------------------------------------- |
| 4            | `1`                | Gap ícone e texto, título e subtítulo                               |
| 6            | `1.5`              | Gaps internos pequenos                                              |
| 8            | `2`                | Gap de paginação, card de produto                                   |
| 10           | `2.5`              | Gap padrão entre itens de auto layout (o mais usado), label e input |
| 12           | `3`                | Gap de campos de formulário, listas de filtro                       |
| 16           | `4`                | Padding horizontal de inputs, gap de blocos                         |
| 20           | `5`                | Padding do painel de filtros, gap de tabs e de wallet cards         |
| 24           | `6`                | Gap entre campos, padding do bottom sheet                           |
| 28           | `7`                | Padding lateral das telas mobile, gap das ações do header           |
| 32           | `8`                | Gap entre blocos de seção                                           |
| 40           | `10`               | Gap entre grupos de filtro, nav, padding de auth mobile             |
| 48           | `12`               | Gap sidebar e grid, padding superior do header do modal             |
| 88 / 92 / 96 | `22` / `23` / `24` | Espaço entre seções da home desktop                                 |

### Grid e containers

| Contexto                 | Valor                                                           |
| ------------------------ | --------------------------------------------------------------- |
| Frame desktop            | 1440 px, padding lateral 120 px, padding vertical 24 px         |
| Container de conteúdo    | `max-w-[1200px] mx-auto` (token `container-content`)            |
| Gap entre seções da home | 96 px                                                           |
| Header desktop           | 1200 × 45 px, `justify-between`                                 |
| Hero desktop             | 1200 × 450 px; texto em coluna de 600 px; imagem 450 × 450 r24  |
| Produtos                 | Sidebar 310 px + grid fluido (842 px no desktop), gap 48        |
| Grid de NFTs             | 3 colunas no desktop, cards de 268 px                           |
| Frame mobile             | 414 px de design; conteúdo 358–366 px; padding lateral 24–28 px |
| Modais de auth           | 500 px de largura, conteúdo de 340 px (recuo de 80 px)          |
| Modal de confirmação     | 578 px de largura, conteúdo de 490 px                           |

### Breakpoints

| Nome           | Min     | Validação obrigatória |
| -------------- | ------- | --------------------- |
| base (mobile)  | 0       | 390 px                |
| `md` (tablet)  | 768 px  | 768 px                |
| `lg`           | 1024 px | —                     |
| `xl` (desktop) | 1280 px | 1440 px               |

Mobile-first. No tablet, filtros viram drawer, o grid usa 2 colunas e os modais de auth ocupam a tela inteira abaixo de `md`.

---

## 5. Raios

| Token          | Valor   | Uso                                                                   |
| -------------- | ------- | --------------------------------------------------------------------- |
| `rounded-xs`   | 3 px    | Botões de formulário desktop (Salvar, Finalizar no carrinho)          |
| `rounded-sm`   | 5 px    | Inputs desktop, botões de modal, botão Etherscan                      |
| `rounded-md`   | 6 px    | Botão "Entrar" do header, Aplicar, EXPLORAR                           |
| `rounded-lg`   | 8 px    | Cards de NFT, cards promo, modais                                     |
| `rounded-xl`   | 10 px   | Inputs e botões das telas de auth mobile                              |
| `rounded-2xl`  | 14 px   | Card de item do carrinho mobile e imagem                              |
| `rounded-3xl`  | 16 px   | Containers internos de cards mobile                                   |
| `rounded-4xl`  | 24 px   | Imagem do hero, arte do banner em destaque (22)                       |
| `rounded-pill` | 40 px   | Botões CTA mobile, input de cupom, topo do bottom sheet, frame mobile |
| `rounded-full` | 9999 px | Avatares, badge, thumbs do slider, dots do carrossel                  |

---

## 6. Bordas e divisores

| Uso                                                  | Definição                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Padrão (inputs, cards, divisores)                    | `1px solid border`                                                                   |
| Input em foco ou ativo                               | `1px solid primary` mais anel de foco (seção 9)                                      |
| Ícones de contorno                                   | `1.5px border-soft`                                                                  |
| Divisor sob o header (home, perfil, carteiras, auth) | `1px primary`, largura 1200                                                          |
| Underline do item de nav ativo                       | `1px primary`, largura do item; telas do fluxo Mercado usam o header **sem** divisor |
| Badge do carrinho                                    | `2px ink` (contorno externo)                                                         |
| Thumb do slider                                      | círculo de 15 px `primary` com borda `ink`                                           |
| Botão de quantidade                                  | `1px ink`                                                                            |
| Destaque lateral (item selecionado)                  | `border-left 6px primary`                                                            |

---

## 7. Sombras

Cor base `#0A0604` a 45%, exceto as de controle.

| Token            | Valor                                 | Uso                                       |
| ---------------- | ------------------------------------- | ----------------------------------------- |
| `shadow-card`    | `0 6px 20px 0 rgb(10 6 4 / .45)`      | Cards de item do carrinho, input de cupom |
| `shadow-glow`    | `0 0 20px 0 rgb(10 6 4 / .45)`        | Cards e painéis elevados                  |
| `shadow-glow-lg` | `0 0 40px 0 rgb(10 6 4 / .45)`        | Modais                                    |
| `shadow-drop`    | `0 20px 20px 0 rgb(10 6 4 / .45)`     | Imagem de destaque                        |
| `shadow-sheet`   | `0 -10px 30px 0 rgb(10 6 4 / .45)`    | Bottom sheet do resumo mobile             |
| `shadow-control` | `0 4px 12px -2px rgb(20 13 10 / .15)` | Botões de quantidade (+/−)                |

---

## 8. Componentes

Medidas do Figma. Cada componente vira um wrapper shadcn/ui ou um componente próprio em `src/components`.

### Header desktop (`Header Row` / `Header With Divider`)

- Linha de 1200 × 45, `justify-between`.
- Logo: wordmark "KURIO" `text-body font-bold tracking-[0.1em] foreground`.
- Nav com gap de 40: Início, Mercado, Criadores, Aprenda. Item `text-body-lg font-normal foreground`. **Ativo:** `font-bold text-accent` com underline `primary` de 1px e gap de 24 entre texto e linha.
- Ações com gap de 28:
  - busca (ícone 20);
  - carrinho (ícone 24) com badge de 16 px `primary`, borda `2px ink` e contador `text-tiny font-medium ink`;
  - botão "Entrar" de 100 × 35, `rounded-md primary`, ícone de logout 20 + texto `text-body-lg font-medium ink`, gap 4.
- Ativo = Início (Início, Entrar, Criar conta, Perfil, Carteiras) ou Mercado (Detalhe, Carrinho, Pagamento, Confirmação).
- Com divisor: home, perfil, carteiras, auth. Sem divisor: telas do Mercado.
- Mobile: barra de busca (366 × 45) no topo e tab bar inferior (414 × 126).

### Botões

| Variante             | Medidas                                             | Estilo                                                                    |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| `primary` (desktop)  | h 40, px 28–36, `rounded-md`                        | `bg-primary text-ink text-body-lg font-bold`                              |
| `primary-sm`         | h 36, px 12, py 8, `rounded-md`                     | Botão Aplicar dos filtros                                                 |
| `form`               | 131 × 40, `rounded-xs`                              | Salvar (perfil, carteiras); botão do resumo do carrinho com largura total |
| `modal`              | h 45, largura total, `rounded-sm`                   | Entrar e Criar conta nos modais                                           |
| `auth-mobile`        | h 60, largura total, `rounded-xl`                   | Entrar e Criar perfil (mobile)                                            |
| `cta-pill`           | h 60, largura total, `rounded-pill`, `gradient-cta` | Finalizar compra e Confirmar compra (mobile)                              |
| `outline` / `social` | h 40, largura total, borda `border`, `rounded-sm`   | Continuar com Google ou Facebook, `text-caption font-medium`              |
| `ghost` / link       | —                                                   | `text-accent`, ex.: "Esqueceu a senha?", "Trocar carteira"                |
| `icon`               | 20 × 30, `rounded-[20px]`                           | +/− de quantidade, `bg-primary`, borda `ink`, `shadow-control`            |

Estados (não desenhados, seguem o padrão):

- hover: `brightness-110`;
- active: `brightness-95`;
- disabled: `opacity-50 cursor-not-allowed`;
- loading: spinner, `aria-busy` e largura mantida;
- foco: seção 9.

### Inputs

| Variante                | Medidas                                             | Estilo                                                                             |
| ----------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Desktop                 | h 40, px 16, py 12, `rounded-sm`                    | `border-border bg-transparent text-body`                                           |
| Mobile (auth)           | h 50, px 16, `rounded-xl`                           | Idem; foco com `border-primary`                                                    |
| Cupom                   | h 50, pl 16, `rounded-pill`                         | `bg-surface-card border-border shadow-card text-caption`; botão "Aplicar" acoplado |
| Senha                   | Input mais toggle de olho (ícone 18, `border-soft`) | Botão com `aria-label` "Mostrar senha" ou "Ocultar senha"                          |
| Select (rede, carteira) | h 40, `rounded-sm`                                  | shadcn `Select` com seta                                                           |
| Textarea (bio)          | `rounded-sm`, `border-border`                       | —                                                                                  |

- Placeholder: `secondary`. Valor: `foreground`.
- Label: `text-body-md foreground`, gap de 10–12 até o input. Obrigatório com `*` em `text-coral`.
- Erro: borda `error`, mensagem `text-caption-sm text-error-foreground` com ícone, ligada por `aria-describedby`, e `aria-invalid`.
- Campo de formulário desktop: coluna de 417 px; linhas com dois campos em `justify-between` (862 px).

### Card de NFT (grid)

- 268 px de largura, `bg-surface-card rounded-lg`, imagem quadrada no topo.
- Nome em `text-body-md font-bold foreground`; preço em `text-body-lg` ETH; edição (`1/50`) em `text-body font-medium`.
- Card inteiro clicável (link), com foco visível e `alt` descritivo na arte.

### Painel de filtros (sidebar)

- 310 px, `bg-surface-card`, p-5, grupos com gap de 40.
- Título do grupo: `text-body-xl font-bold foreground`.
- Coleções: lista com px-3; item com altura de 40 e `justify-between`; nome `text-body-md` e contagem `font-bold`. Ativo em `text-accent`, inativo em `text-secondary`. Implementar como checkbox acessível (estado também por ícone ou peso, não só cor).
- Faixa de preço: slider (trilho `primary`, thumbs de 15 px), texto "Preço: 0,02 - 12,30 ETH" e botão Aplicar `primary-sm`.
- Rede: Ethereum, Polygon e Solana com contagem.
- Mobile e tablet: drawer acionado pelo ícone de filtro da barra de busca.

### Banner "NFT em destaque"

- 310 × 470, `gradient-card`.
- Títulos: "NFT EM DESTAQUE" em `text-heading text-accent` e "OFERTA LIMITADA" em `text-title-lg foreground`.
- Arte de 310 × 368, `rounded-[22px]`, com quadrados decorativos em gradiente.

### Toolbar do catálogo

- Tabs (gap 20) em `text-body-md font-medium`: ativa `text-accent`, demais `foreground`. Implementar com `role="tablist"` ou links com `aria-current`.
- Ordenação à direita ("Listados recentemente" mais seta), com shadcn `Select` ou `DropdownMenu`.

### Paginação

- Itens de 35 px de altura, gap 8. Página atual com `bg-primary text-ink` e `aria-current="page"`.

### Hero (home)

- Eyebrow "Bem-vindo à Kurio" em `text-body font-medium tracking-[0.1em]`.
- Título em `text-display-lg uppercase` e descrição em `text-body leading-6 text-secondary` (557 px).
- CTA "EXPLORAR" de 140 × 40.
- Dots do carrossel: 3 × 8 px `primary`.

### Cards promo

- 586 × 250, `rounded-lg`, imagem mais texto `text-body-xl font-bold` e CTA.

### Carrinho

- Desktop: tabela de 782 px (gap 12) mais resumo da carteira de 332 px (gap 24), botão `form` com largura total, recomendações em cards de 219 px.
- Mobile: item com card de 358 × 100 `gradient-card shadow-card rounded-2xl` e imagem de 100 × 100; stepper de quantidade; resumo em bottom sheet `bg-surface-card rounded-t-pill` com pt/px 24, pb 36 e `shadow-sheet`.
- Linhas de resumo (Subtotal, Desconto, Taxa estimada, Total): label `text-body-md` ou `text-caption-sm`, valor `text-body-lg` e total `text-body-xl font-bold`.

### Pagamento

- Wallet cards de 358 × 93, gap 20: marca da carteira, nome e endereço em `text-body leading-[22px]`, rede, estado "Carteira conectada".
- Seleção por radio group acessível.
- Header de tela mobile: 358 × 44 com voltar e título `text-title font-bold`.

### Modais (auth e confirmação)

- Auth: 500 px de largura, `bg-surface-card rounded-lg`; cabeçalho com pt-12 e gap 40; conteúdo de 340 px. O modal abre sobre a home esmaecida, e o footer fica abaixo do scrim.
- Confirmação: 578 px; tabela de itens (cabeçalho `justify-between`), taxas, total, botão Etherscan (`rounded-sm`, p-4, h 48).
- shadcn `Dialog`: foco preso, `Esc` fecha, foco volta ao gatilho, título por `aria-labelledby`. Abaixo de `md` vira tela cheia.

### Perfil e Carteiras

- Formulário em duas colunas de 417 px.
- Avatar: preview circular mais controles (gap 10).
- Bloco "Alterar senha" com três campos de senha.
- Carteiras: principal e secundária, cada uma com Rede, Endereço 0x, Apelido e ENS.
- Abas laterais com `text-body-md leading-[45px] text-accent`: Detalhes do perfil, Carteiras, Sair.

### Footer

- Largura de 1200, em três faixas:
  1. três medalhões com newsletter;
  2. faixa da marca com contatos;
  3. quatro colunas de links (`text-body leading-[30px]`), redes sociais (ícones 16 `primary`) e chips de carteiras.
- Links fora do escopo não podem simular sucesso: abrem um aviso "Em breve" ou ficam marcados como indisponíveis.

### Skeleton

- `bg-surface-raised` com shimmer em gradiente linear (`surface-raised` → `border` → `surface-raised`), animação de 1.5 s.
- Ocupa a mesma dimensão do conteúdo final (card 268 × 369, linhas do resumo, galeria do detalhe).
- Com `prefers-reduced-motion: reduce`: sem animação, cor estática.

### Toast e feedback

- Toast do shadcn (Sonner) com `bg-surface-card border-border`. Sucesso com ícone `success`, erro com ícone `error`.
- Região `aria-live="polite"` para mutations e eventos em tempo real; `assertive` só para erro de checkout.

---

## 9. Foco e estados de interação

- Foco visível em **todo** elemento interativo: `outline-2 outline-offset-2 outline-primary` via `focus-visible`. Nunca remover outline sem substituto.
- Estados nunca só por cor. Ativo também muda o peso (`font-bold`) ou ganha underline ou ícone. Erro também ganha ícone e texto.
- Áreas de toque de no mínimo 44 × 44 no mobile (ícones pequenos ganham padding).
- `prefers-reduced-motion`: desliga shimmer, transições de carrossel e animações de drawer.

---

## 10. Ícones e assets

- **Ícones de interface:** biblioteca **`lucide-react`**, padrão do shadcn/ui. O Figma usa o conjunto Iconly, e os equivalentes do Lucide foram escolhidos pela mesma forma e traço.
  - Tamanhos: 20 px para ações do header, 24 px para o carrinho e a tab bar.
  - Sempre com `aria-hidden`. A ação tem label no botão ou link (`aria-label`, ou texto visível).
- **Marcas:** **`react-icons`**, só para logos, com importação por ícone:
  - `react-icons/fa6` para Facebook, Instagram, X, LinkedIn e YouTube;
  - `FcGoogle` para o "G" colorido.
- **Monogramas:** as carteiras e os serviços do layout são **monogramas de letra** ("Wallet mark W/M", "Service mark W/C/D"), feitos com texto e não com logo.
- **Artes dos NFTs:** as 4 imagens originais do Figma (PNG de 1254 px) foram convertidas para WebP com qualidade 78 em `public/nfts/{arte}-{320|640|1024}.webp`. O layout reutiliza essas 4 artes em todas as telas.
  - Toda imagem é renderizada por `NftImage`, com `width` e `height` fixos.
  - As imagens finais podem substituir esses arquivos, ou ganhar novos caminhos, sem mudar o layout.

  | Arte    | Arquivo          | Descrição                                                        |
  | ------- | ---------------- | ---------------------------------------------------------------- |
  | Emerald | `emerald-*.webp` | Macaco de óculos redondos e jaqueta varsity verde (arte do hero) |
  | Violet  | `violet-*.webp`  | Gorila de chapéu bucket e moletom roxo                           |
  | Onyx    | `onyx-*.webp`    | Chimpanzé de gola alta verde e blazer creme                      |
  | Amber   | `amber-*.webp`   | Macaco dourado de fones de ouvido e jaqueta creme                |
  - Uso: `srcset` com as 3 larguras e `sizes` por contexto.
  - Abaixo da dobra: `loading="lazy"` e `decoding="async"`.
  - Imagem do LCP (hero ou detalhe): `fetchpriority="high"`.
  - Sempre `width` e `height` explícitos, para não gerar CLS.

- **Fonte:** Roboto Mono servida localmente, só o subconjunto latino.

---

## 11. Desvios e ajustes em relação ao Figma

| Item                       | Figma                                     | Implementação                                                        | Motivo                                                    |
| -------------------------- | ----------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| Texto de erro              | `#ED1B2E`                                 | `error-foreground #FF5A68` para texto (borda e ícone mantêm `error`) | Contraste de 4.0:1 sobre `surface-card` fica abaixo de AA |
| Altura de linha de títulos | Estilos com `lh 16` em fontes de 18–20 px | Altura de linha ≥ tamanho da fonte                                   | Evitar corte de texto e falhas com zoom                   |
| Muitos estilos de texto    | Cerca de 45 estilos                       | Escala consolidada (seção 3)                                         | Consistência e manutenção                                 |
| Telas sem frame mobile     | Perfil, Carteiras, Confirmação            | Adaptadas com os mesmos tokens e componentes                         | Exigência do desafio                                      |
| Estados não desenhados     | —                                         | Loading, vazio, erro e disabled seguindo esta paleta                 | Exigência do desafio                                      |
| Filtros selecionados       | Só a cor muda (`text-accent`)             | Cor, negrito e caixa de seleção marcada (`role="checkbox"`)          | Estado não pode depender só de cor (acessibilidade)       |
| Ícones                     | Iconly                                    | Equivalentes do `lucide-react`                                       | Biblioteca mantida, padrão do shadcn/ui                   |
| Busca no desktop           | Só o ícone no header                      | O ícone abre um campo de busca inline                                | A busca é obrigatória no Início                           |
| Ações fora do escopo       | Links de criadores, aprenda, blog, redes  | Botões que avisam "em breve" via toast                               | Não aparentar sucesso funcional (exigência do desafio)    |

---

## 12. Implementação dos tokens (Tailwind v4)

```css
@import 'tailwindcss';
@import '@fontsource/roboto-mono/400.css';
@import '@fontsource/roboto-mono/500.css';
@import '@fontsource/roboto-mono/700.css';

@theme {
  --font-mono: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-sans: var(--font-mono);

  --color-ink: #140d0a;
  --color-surface-card: #241612;
  --color-surface-raised: #2f1d15;
  --color-surface-dark: #38220f;
  --color-border: #3f2319;
  --color-border-soft: #55321f;
  --color-foreground: #f5f1eb;
  --color-text-secondary: #cfb28c;
  --color-text-accent: #e89b55;
  --color-text-coral: #f0805f;
  --color-primary: #d28a4c;
  --color-secondary: #b39463;
  --color-amber: #e3a44e;
  --color-success: #00a66c;
  --color-error: #ed1b2e;
  --color-error-foreground: #ff5a68;
  --color-gray-light: #ededed;
  --color-background-elevated: #fbfbfb;
  --color-brand-facebook: #1877f2;

  --text-display-lg: 43px;
  --text-display-lg--line-height: 70px;
  --text-display: 32px;
  --text-display--line-height: 32px;
  --text-display--letter-spacing: 0.1em;
  --text-heading-lg: 28px;
  --text-heading-lg--line-height: 28px;
  --text-heading: 24px;
  --text-heading--line-height: 32px;
  --text-title-lg: 22px;
  --text-title-lg--line-height: 29px;
  --text-title: 20px;
  --text-title--line-height: 24px;
  --text-body-xl: 18px;
  --text-body-xl--line-height: 24px;
  --text-section: 17px;
  --text-section--line-height: 16px;
  --text-body-lg: 16px;
  --text-body-lg--line-height: 20px;
  --text-body-md: 15px;
  --text-body-md--line-height: 16px;
  --text-body: 14px;
  --text-body--line-height: 22px;
  --text-caption: 13px;
  --text-caption--line-height: 16px;
  --text-caption-sm: 12px;
  --text-caption-sm--line-height: 16px;
  --text-tiny: 10px;
  --text-tiny--line-height: 10px;
  --text-micro: 9px;
  --text-micro--line-height: 9px;

  --radius-xs: 3px;
  --radius-sm: 5px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 10px;
  --radius-2xl: 14px;
  --radius-3xl: 16px;
  --radius-4xl: 24px;
  --radius-pill: 40px;

  --shadow-card: 0 6px 20px 0 rgb(10 6 4 / 0.45);
  --shadow-glow: 0 0 20px 0 rgb(10 6 4 / 0.45);
  --shadow-glow-lg: 0 0 40px 0 rgb(10 6 4 / 0.45);
  --shadow-drop: 0 20px 20px 0 rgb(10 6 4 / 0.45);
  --shadow-sheet: 0 -10px 30px 0 rgb(10 6 4 / 0.45);
  --shadow-control: 0 4px 12px -2px rgb(20 13 10 / 0.15);

  --container-content: 1200px;
}
```

### Mapeamento para as variáveis do shadcn/ui

| Variável shadcn                              | Token                |
| -------------------------------------------- | -------------------- |
| `--background`                               | `ink`                |
| `--foreground`                               | `foreground`         |
| `--card` / `--popover`                       | `surface-card`       |
| `--card-foreground` / `--popover-foreground` | `foreground`         |
| `--primary`                                  | `primary`            |
| `--primary-foreground`                       | `ink`                |
| `--secondary`                                | `secondary` (Figma)  |
| `--secondary-foreground`                     | `ink`                |
| `--muted`                                    | `surface-raised`     |
| `--muted-foreground`                         | `text-secondary`     |
| `--accent`                                   | `surface-raised`     |
| `--accent-foreground`                        | `text-accent`        |
| `--destructive`                              | `error`              |
| `--border` / `--input`                       | `border`             |
| `--ring`                                     | `primary`            |
| `--radius`                                   | `8px` (`rounded-lg`) |
