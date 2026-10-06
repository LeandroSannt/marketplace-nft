# Arquitetura — Kurio NFT Marketplace

## Visão geral

```
UI (routes, components)
  └── features/*         hooks de query e mutation, regras de cache, handlers de eventos
        └── features/*/api.ts   chamadas REST via Axios, validadas por Zod
              └── lib/http.ts   instância Axios única: sessão, carrinho do visitante, erros normalizados
                    └── MSW (src/mocks) — servidor simulado na camada de rede
contracts/  schemas Zod compartilhados por cliente e mocks (fonte única dos tipos)
```

- `src/contracts`: contratos de transporte. Cada tipo do app sai de `z.infer` desses schemas.
- `src/features/<domínio>`: `api.ts` (transporte), `queries.ts` (query keys, options e mutations) e `realtime.ts` (aplicação de eventos ao cache).
- `src/lib`: infraestrutura e regras puras compartilhadas (`http`, `api-error`, `session-store`, `realtime`, `event-guard`, `money`, `cart-merge`, `labels`).
- **Dependência entre features:** uma feature consome de outra apenas a superfície pública (`queries.ts`, `hooks.ts`, `realtime.ts`), por exemplo as query keys usadas na invalidação. Componentes de uma feature nunca são importados por outra: a composição acontece na rota (o botão de favoritos entra no detalhe do NFT, e o fundo da home entra no modal de login, por props).
- `src/mocks`: servidor simulado (banco, domínio, handlers, socket, cenários e controle).
- Componentes, hooks e o cliente Axios **não contêm dados fictícios nem caminhos alternativos**. Todo comportamento simulado vive em `src/mocks`.

## Valores em ETH

- ETH trafega sempre como **string decimal** (`ethAmountSchema`).
- Todo cálculo usa `big.js` com 18 casas decimais, via `src/lib/money.ts`, compartilhado com os mocks.
- A apresentação usa `formatEth`, com no mínimo 2 e no máximo 4 casas.
- Quantidades são inteiras e positivas.
- A **cotação da API é a referência** para fechar o pedido. O cliente nunca calcula total para enviar.

## Contratos REST

Base: `/api`. Erros seguem o formato `{ error: { code, message, fields?, details? } }`.

| Recurso          | Método e rota                                                                                     | Sucesso                                                                             | Erros relevantes                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Cadastro         | `POST /auth/register`                                                                             | 201 `Session`                                                                       | 409 `CONFLICT` (e-mail ou usuário, com `fields`), 422                                                                |
| Login            | `POST /auth/login`                                                                                | 200 `Session`                                                                       | 401 `UNAUTHORIZED`, 422                                                                                              |
| Sessão           | `GET /auth/session`                                                                               | 200 `CurrentSession`                                                                | 401 `UNAUTHORIZED` / `SESSION_EXPIRED`                                                                               |
| Logout           | `POST /auth/logout`                                                                               | 204                                                                                 | —                                                                                                                    |
| Catálogo         | `GET /nfts?q&collections&networks&minPrice&maxPrice&tab&sort&page`                                | 200 `CatalogResponse` (itens, paginação e facetas)                                  | 422, 500                                                                                                             |
| Destaques        | `GET /nfts/featured`                                                                              | 200 `FeaturedResponse`                                                              | —                                                                                                                    |
| Detalhe          | `GET /nfts/:id`                                                                                   | 200 `NftDetail` (com edições)                                                       | 404                                                                                                                  |
| Favoritos        | `GET /favorites`, `PUT /favorites/:nftId`, `DELETE /favorites/:nftId`                             | 200 `Favorites`                                                                     | 401, 404, 500                                                                                                        |
| Carrinho         | `GET /cart`                                                                                       | 200 `Cart`                                                                          | —                                                                                                                    |
| Item             | `POST /cart/items`, `PATCH /cart/items/:nftId/:editionId`, `DELETE /cart/items/:nftId/:editionId` | 200 `Cart`                                                                          | 409 `OUT_OF_STOCK` / `QUANTITY_LIMIT`, 404                                                                           |
| Cupom            | `PUT /cart/coupon`, `DELETE /cart/coupon`                                                         | 200 `Cart`                                                                          | 422 `COUPON_INVALID` / `COUPON_EXPIRED`                                                                              |
| Merge            | `POST /cart/merge { guestCartId }`                                                                | 200 `Cart`                                                                          | 401                                                                                                                  |
| Cotação          | `POST /quotes { network }`                                                                        | 200 `Quote` (linhas, cupom, subtotal, desconto, taxa, total, problemas e expiração) | 401                                                                                                                  |
| Pedido           | `POST /orders` + `Idempotency-Key`                                                                | 201 `Order`, ou 200 na repetição                                                    | 409 `QUOTE_OUTDATED` (com a nova cotação e os problemas), 409 `IDEMPOTENCY_CONFLICT`, 409 `WALLET_DISCONNECTED`, 422 |
| Estado do pedido | `GET /orders/:id`, `GET /orders?status=pending`                                                   | 200                                                                                 | 404, 403 `FORBIDDEN` (pedido de outro usuário)                                                                       |
| Perfil           | `GET /profile`, `PATCH /profile`, `POST /profile/password`                                        | 200 / 204                                                                           | 409 (usuário em uso), 422 (senha atual incorreta)                                                                    |
| Carteiras        | `GET /wallets`, `POST /wallets`, `PATCH /wallets/:id`                                             | 200 / 201                                                                           | 409 (espaço ocupado), 422, 403 `FORBIDDEN` (carteira de outro usuário)                                               |
| Conexão          | `POST /wallets/:id/connect { network }`, `POST /wallets/:id/disconnect`                           | 200 `WalletConnection`                                                              | 403 `WALLET_REJECTED`                                                                                                |

Falhas transitórias são representadas por 500 `INTERNAL_ERROR` e 503 `SERVICE_UNAVAILABLE`. No cliente, timeouts e quedas de rede viram `TIMEOUT` e `NETWORK_ERROR` (`src/lib/api-error.ts`).

### Idempotência de pedidos

- O cliente gera um `Idempotency-Key` por **tentativa**, identificada pela impressão digital do corpo do pedido. A chave fica em `sessionStorage`, separada por usuário (`kurio:checkout:attempt:<userId>`), e cliques repetidos, timeouts e refresh reaproveitam a mesma chave.
- Mesma chave e mesmo corpo devolvem o pedido existente (200). Mesma chave com corpo diferente devolve 409 `IDEMPOTENCY_CONFLICT`.
- Uma cotação nova muda o corpo e, portanto, gera uma nova tentativa.
- Enquanto houver pedido `pending` (`GET /orders?status=pending`), o checkout mostra o aviso e **bloqueia uma nova confirmação**. Assim, um refresh depois de um timeout, que gera cotação e chave novas, não cria um segundo pedido.

### Revalidação no checkout

`POST /orders` recalcula a cotação no servidor. Se preço, disponibilidade, cupom, taxa ou versão do carrinho mudaram, ou se a cotação expirou (5 min), a resposta é 409 `QUOTE_OUTDATED` com a cotação nova e os problemas encontrados. A UI exibe as mudanças e exige nova confirmação.

### Ciclo do pedido

1. `pending`: o estoque é reservado e cada NFT afetado emite `nft.updated`.
2. Depois de 3 s, a liquidação simulada leva o pedido a `confirmed` ou a `declined` (estoque devolvido). No `confirmed`, o pedido recebe um hash de transação simulado.
   - O `explorerUrl` aponta para o **explorador simulado** do próprio app: `/explorer/tx/:hash?order=:id`.
   - Essa página confere o hash com o pedido do usuário autenticado e mostra a transação com um aviso de demonstração.
   - O link não aponta para exploradores reais (Etherscan, Solscan), porque eles não encontrariam um hash fictício e a ação pareceria funcional sem ser.
3. Na confirmação, saem do carrinho **apenas os itens e as quantidades comprados**.
4. Pedidos `confirmed` e `declined` são terminais.
5. O pedido guarda o snapshot das linhas e dos valores. Mudanças posteriores no catálogo não alteram o recibo.
6. Se a página recarregar com um pedido pendente, o mock reagenda a liquidação ao iniciar, e `GET /orders/:id` liquida pedidos vencidos.

## Tempo real (Socket.IO)

| Evento          | Payload                                                                                                                     | Efeito no cliente                                                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `nft.updated`   | `{ eventId, type, version, occurredAt, resource: { type: 'nft', id }, data: { price, available, editions[] } }`             | Atualiza detalhe, listas, destaques e carrinho; invalida cotações; avisa o usuário (toast com `aria-live`) quando um item do carrinho muda |
| `order.updated` | `{ eventId, type, version, occurredAt, resource: { type: 'order', id }, data: { status, transactionHash, declineReason } }` | Atualiza o pedido em cache, invalida a lista de pendentes e, na confirmação, o carrinho                                                    |

- **Duplicatas e eventos antigos:** o `event-guard` descarta `eventId` já visto e versões menores ou iguais à última conhecida do recurso. As funções que aplicam o evento também comparam com a `version` do dado em cache, que pode ter vindo do REST. Os itens do carrinho trazem `nftVersion`, então mesmo o primeiro evento recebido por um socket novo é descartado se for mais antigo que o carrinho vindo do REST. Assim, nenhum estado regride e nenhum efeito (como um toast) é reaplicado.
- **Reconexão:** depois de reconectar, o cliente invalida catálogo, carrinho, cotação e pedidos, reconciliando com o REST.
- **Isolamento:** o socket é recriado a cada troca de sessão, autenticado pelo token no pacote CONNECT. O servidor entrega `order.updated` apenas às conexões do dono. Na troca, listeners e conexão anteriores são liberados, e o cache privado é removido.
- **Status da conexão:** `useRealtimeStatus()` expõe `connecting`, `connected`, `reconnecting` ou `offline` para a UI.

### Transporte simulado e limitações

O servidor de socket é simulado com `ws.link` do MSW e `@mswjs/socket.io-binding`, exercitando o `socket.io-client` real.

- O MSW intercepta só WebSocket. O cliente usa `transports: ['websocket']`, sem fallback para polling.
- O binding responde ao handshake automaticamente, mas **não envia pings**. O mock envia ping a cada 20 s e descarta conexões sem resposta em 40 s, como um heartbeat timeout real.
- Não há suporte a acks, rooms nem namespaces. O roteamento por usuário é feito pelo mock com o token do pacote CONNECT.
- O MSW remove o prefixo `/socket.io/` ao comparar URLs, então o handler escuta a raiz da origem. Por isso o HMR do Vite foi movido para `/__vite_hmr`.
- O `engine.io-client` captura `globalThis.WebSocket` ao ser importado. Por isso o `socket.io-client` (`src/lib/realtime-socket.ts`) só é importado, sob demanda, depois de a barreira de rede liberar.

### Inicialização e barreira de rede

O app renderiza imediatamente, em paralelo com o início do MSW. Header, hero e skeletons aparecem sem esperar o service worker. A barreira `networkReady` (`src/lib/network-ready.ts`) é liberada quando os mocks terminam de iniciar, ou na hora, se `VITE_ENABLE_MOCKS=false`. Até lá:

- o interceptor do Axios aguarda a barreira antes de enviar qualquer requisição;
- o `RealtimeSync` só cria o socket depois dela.

Isso não cria caminho alternativo de negócio: é apenas uma espera pela rede.

## Estado e cache (TanStack Query)

| Dado      | Query key                           | Política                                                                                                  |
| --------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Catálogo  | `['catalog', 'list', query]`        | `staleTime` 30 s, `keepPreviousData` na troca de página e filtro                                          |
| Detalhe   | `['catalog', 'detail', id]`         | `staleTime` 30 s; atualizado por `nft.updated`                                                            |
| Destaques | `['catalog', 'featured']`           | `staleTime` 5 min                                                                                         |
| Sessão    | `['session', token]`                | `staleTime` 5 min, sem retry                                                                              |
| Favoritos | `['favorites', userId]`             | Atualização **otimista com rollback**                                                                     |
| Carrinho  | `['cart', userId \| 'guest']`       | Substituído pela resposta de cada mutation; atualizado por eventos                                        |
| Cotação   | `['quote', userId, network, stage]` | `staleTime` 0; invalidada por mutations do carrinho e por eventos                                         |
| Pedido    | `['orders', userId, 'detail', id]`  | Polling de 10 s enquanto pendente, como rede de segurança do socket; `staleTime` infinito quando terminal |

- **Retries:** queries tentam até 2 vezes, com backoff exponencial, apenas em falha transitória (rede, timeout ou 5xx). Erros 4xx não são repetidos. Mutations nunca são repetidas automaticamente; o pedido é repetido pelo usuário com a mesma chave de idempotência.
- **Respostas obsoletas:** toda query passa o `signal` do TanStack Query ao Axios, cancelando requisições abandonadas. Como as keys incluem todos os parâmetros, uma resposta que chega fora de ordem nunca sobrescreve outra consulta.
- **Isolamento:** dados privados levam o `userId` na key. No login, logout, troca de usuário ou expiração de sessão, `clearPrivateCache` cancela e remove `session`, `favorites`, `cart`, `quote`, `orders`, `profile` e `wallets`.
- **Foco da janela:** não refaz consultas (`refetchOnWindowFocus: false`); o tempo real cobre a sincronização.
- **Atualização em segundo plano:** um indicador global (`BackgroundRefreshIndicator`, `role="status"`) aparece sempre que uma query que já tem dados está sendo refeita (polling do pedido, invalidação por evento, reconexão).
- **Falha de mutation do carrinho:** em 409 ou 422, o carrinho e a cotação são invalidados para refletir o estado real do servidor.

## Sessão

- O token fica em `localStorage` (`kurio:session`), junto com o `userId`. A sessão sobrevive a refresh e é validada por `GET /auth/session`.
- O Axios envia `Authorization: Bearer` em todas as requisições, exceto login e cadastro. Assim, uma tentativa de login com credenciais erradas nunca derruba uma sessão válida. Qualquer 401 numa requisição autenticada marca a sessão como expirada (`sessionStore.expire()`), o que limpa o cache privado e permite à UI redirecionar ao login preservando o contexto.
- As senhas nunca são armazenadas em claro: os mocks guardam SHA-256 com salt.

## Carrinho

- O visitante tem um carrinho no servidor identificado por `X-Cart-Id`, guardado em `localStorage` (`kurio:guest-cart`), e por isso sobrevive a refresh.
- No login ou cadastro, `POST /cart/merge` incorpora os itens do visitante ao carrinho do usuário, respeitando limite por pedido e estoque e preservando o cupom. A regra de merge é uma função pura (`src/lib/cart-merge.ts`). Se o merge falhar, o id do carrinho do visitante é mantido e a junção é tentada de novo no próximo login.
- Disponibilidade e limite por edição são validados no servidor (409).

## Mocks (MSW)

- **Ativação:** `VITE_ENABLE_MOCKS=true`, padrão também no build de demonstração.
- **Persistência:** o estado vive em `localStorage` (`kurio:mock:db`), consistente entre catálogo, favoritos, carrinhos, cotações, pedidos, perfis e carteiras.
- **Reset:** `?reset=1` na URL ou `window.__kurioMock.reset()` restauram integralmente o estado conhecido: banco semeado, armazenamento do app limpo, cenário `default` (ou o informado junto, em `?reset=1&scenario=<id>`), timers de liquidação e de choque de preço cancelados, contadores de rede (`flaky`, `variable-latency`) zerados e conexões de socket derrubadas.
- **Fixtures:** 40 NFTs gerados com semente fixa (9 coleções, 3 redes, edições com estoque, limites e esgotados), 2 usuários e 3 cupons.
- **Cenários:** `?scenario=<id>` ou `window.__kurioMock.setScenario(id)`, persistidos entre recargas. A lista e a descrição estão em `src/mocks/scenarios.ts`.
- **Controle:** `window.__kurioMock` permite, sem atravessar a UI:
  - `updateNft` (muda preço ou estoque e emite o evento real);
  - `emitStaleNftEvent` e `replayNftEvent` (evento antigo ou duplicado);
  - `dropConnections` (derruba o socket);
  - `expireSessions`;
  - `settlePendingOrders`.

## Limitações

- **Backend simulado no navegador:** API e socket rodam no service worker e na própria aba. Os dados vivem no `localStorage` de cada navegador; não há compartilhamento entre dispositivos ou abas em tempo real (outra aba só vê mudanças ao recarregar).
- **Performance mobile:** o MSW inicia no aparelho antes da primeira resposta, o que pesa no LCP do Lighthouse mobile (detalhes em `lighthouse/README.md`).
- **Socket.IO:** sem polling, acks, rooms ou namespaces (ver "Transporte simulado e limitações").
- **Blockchain e carteiras:** conexão, assinatura, hash e explorador são simulados; nenhum dado sai do navegador.
- **Imagens:** as artes dos NFTs são provisórias até a substituição pelos assets finais do Figma.
- **Fora do escopo do desafio:** editorial, suporte, atividade, ofertas, downloads e newsletter avisam "em breve" em vez de aparentar sucesso.

## Desvios do Figma e decisões de UX

Os desvios visuais estão na seção "Desvios e ajustes" do [STYLE_GUIDE.md](STYLE_GUIDE.md). As decisões de UX por tela estão abaixo.

### Início

- Busca, coleções, redes, faixa de preço, tab, ordenação e página vivem na URL, validados por Zod com `catch`, de modo que parâmetros inválidos são ignorados e não quebram a página.
- Trocar qualquer filtro volta à página 1. A busca usa debounce de 350 ms e `replace`, para não poluir o histórico.
- No desktop, a busca fica no ícone do header. No mobile, na barra do topo, junto com a gaveta de filtros, como no Figma.
- A imagem do hero é estática (não depende da API), para não atrasar o LCP.

### Detalhes do NFT

- As edições aparecem como tiragem (1/50, 1/10, 1/1), como no Figma. A quantidade máxima é o menor valor entre o limite por pedido e o estoque, descontado o que já está no carrinho.
- "Comprar" adiciona ao carrinho e leva a ele. Favoritar exige login; um visitante é levado ao login e volta ao NFT.
- As avaliações mostram apenas a nota e a contagem; não há avaliações individuais simuladas.

### Carrinho

- Subtotal, desconto, taxa e total vêm sempre da cotação da API (`POST /quotes`, estágio `cart`), inclusive para visitantes. O cliente não soma valores.
- Itens esgotados ou acima do estoque ficam sinalizados no item, e o checkout fica bloqueado até o ajuste.
- Mudanças de preço ou estoque recebidas pelo socket atualizam o item e o resumo e geram um aviso acessível.

### Pagamento e confirmação

- O checkout tem duas etapas: **dados** (colecionador, carteira, rede e conexão) e **revisão**. Só é possível revisar com os dados válidos e a carteira conectada.
- A conexão é simulada pela API (`/wallets/:id/connect` e `/disconnect`), e o mock guarda qual carteira e rede estão conectadas. `POST /orders` só aceita o pedido se a carteira do pedido estiver conectada na mesma rede; caso contrário responde 409 `WALLET_DISCONNECTED` sem criar pedido. Recusa (cenário `wallet-rejected`) mostra o motivo e permite tentar de novo. Desconexão pela carteira no momento da confirmação (cenário `wallet-disconnects`) volta para a etapa de dados e pede nova conexão. Trocar a carteira ou a rede exige reconectar. A conexão fica só em memória: depois de um refresh é preciso conectar de novo, como numa carteira real.
- Ao entrar na revisão, o cliente guarda uma impressão digital da cotação. Se ela mudar (evento `nft.updated` ou 409 `QUOTE_OUTDATED`), a confirmação fica bloqueada até o usuário aceitar os novos valores.
- Envio idempotente: o botão fica desabilitado durante o envio. Em timeout ou queda de rede, "Tentar novamente" reenvia **a mesma requisição** (mesmo `quoteId` e mesma chave), mesmo que a cotação tenha mudado por causa da reserva de estoque. Isso recupera o pedido existente em vez de criar outro.
- Depois de iniciado, o fluxo continua montado mesmo que o carrinho esvazie por causa da confirmação do pedido, para que a recuperação continue disponível.
- O formulário do checkout fica em `sessionStorage`, separado por usuário (`kurio:checkout:draft:<userId>`). Se a sessão expirar, o mesmo usuário entra de novo e retoma com os dados preenchidos; outro usuário no mesmo navegador nunca vê esse rascunho.
- `/orders/:id` mostra o status ao vivo (socket, com polling de 10 s como rede de segurança): pendente, recusado (itens preservados no carrinho e opção de tentar de novo) ou confirmado (recibo).
- O recibo usa o snapshot gravado no pedido. A confirmação aparece como um painel centralizado de 578 px, com a mesma composição do modal do Figma.

### Perfil e carteiras

- `/account` é um layout protegido, com navegação lateral no desktop e abas roláveis no mobile. "Atividade" e "Lista de interesse" estão fora do escopo e avisam "em breve".
- O perfil tem dois formulários independentes:
  - dados (nome, usuário, bio, site, ENS e avatar), com 409 de usuário em uso mapeado para o campo;
  - senha, com a senha atual validada no servidor (422) e os campos limpos após o sucesso.
- O avatar é validado no cliente (PNG, JPG ou WebP, até 512 KB) e enviado como data URL. A pré-visualização é imediata, e o header passa a mostrar o avatar depois de salvo.
- Carteiras: um formulário por espaço (principal e secundária). Espaço vazio mostra "Adicionar" (POST); espaço preenchido mostra "Salvar" (PATCH), habilitado apenas quando há alteração.
- Todas as alterações persistem no banco simulado e sobrevivem a refresh.

### Login e cadastro

- No desktop, um modal sobre o Início, como no Figma; o fundo fica inerte. No mobile, uma tela cheia.
- Fechar o modal cancela e volta à página anterior (ou ao Início, se a origem era o checkout).
- Depois de entrar, o carrinho do visitante é incorporado e o usuário volta ao `redirect`.
- Rotas privadas (`/checkout`, `/account/*`) redirecionam ao login com `redirect`.
- Sessão expirada: aviso, limpeza do cache privado e ida ao login preservando a página.
- Erros de validação e conflito vindos da API são exibidos no campo correspondente; credenciais inválidas aparecem num alerta do formulário.
- Login social e recuperação de senha estão fora do escopo e avisam "em breve".
