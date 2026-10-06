# Kurio — Marketplace de NFTs

Solução do [desafio frontend da Jungle Gaming](https://github.com/junglegaming/frontend-challenge): um marketplace de NFTs em React e TypeScript, fiel ao [layout do Figma](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1). Tem fluxos completos de descoberta, compra e conta, API e tempo real simulados com MSW, testes E2E com Playwright e auditoria Lighthouse.

**Demo:** [marktplace-nft.vercel.app](https://marktplace-nft.vercel.app). O build de demonstração roda com os mocks e o tempo real simulado ativos, e aceita os mesmos cenários e o reset descritos abaixo (`?scenario=<id>`, `?reset=1`).

- **Arquitetura, contratos REST, eventos, cache, sessão e decisões:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Design tokens e desvios do Figma:** [STYLE_GUIDE.md](STYLE_GUIDE.md)
- **Auditoria Lighthouse:** [lighthouse/README.md](lighthouse/README.md)

## Stack

| Responsabilidade              | Tecnologia                                                           |
| ----------------------------- | -------------------------------------------------------------------- |
| Interface e linguagem         | React 19, TypeScript (strict)                                        |
| Roteamento                    | TanStack Router (rotas por arquivo, search params validados, guards) |
| Estado remoto                 | TanStack Query                                                       |
| Cliente HTTP                  | Axios (instância única)                                              |
| Tempo real                    | Socket.IO (`socket.io-client`)                                       |
| Estilização e componentes     | Tailwind CSS 4, shadcn/ui (Radix)                                    |
| Mocking                       | MSW 2 e `@mswjs/socket.io-binding`                                   |
| Testes E2E e regressão visual | Playwright                                                           |
| Auditoria                     | Lighthouse CI                                                        |
| Complementares                | Vite, Zod, React Hook Form, big.js, lucide-react, react-icons        |

## Setup

Requisitos: **Node 22 ou superior** e npm. Não depende de nenhum serviço externo: a API e o Socket.IO são simulados no navegador.

```bash
npm install
```

```bash
npm run dev
```

Acesse http://localhost:5173. Os mocks já vêm ativos.

Para rodar os testes E2E pela primeira vez, instale o Chromium do Playwright:

```bash
npx playwright install chromium
```

## Variáveis de ambiente

Os valores padrão estão em `.env` (versionado, sem segredos). Para sobrescrever localmente, use `.env.local`.

| Variável            | Padrão | Descrição                                                        |
| ------------------- | ------ | ---------------------------------------------------------------- |
| `VITE_API_URL`      | `/api` | Base da API REST usada pelo Axios                                |
| `VITE_ENABLE_MOCKS` | `true` | Ativa o MSW (REST e Socket.IO) no dev e no build de demonstração |

## Credenciais fictícias

| Usuário                             | E-mail                   | Senha       |
| ----------------------------------- | ------------------------ | ----------- |
| Ana Kurio (2 carteiras, 1 favorito) | `colecionador@kurio.dev` | `Kurio2026` |
| Bruno Lima (1 carteira)             | `segundo@kurio.dev`      | `Kurio2026` |

Também é possível criar contas novas em **Criar conta**. As senhas são guardadas apenas como hash (SHA-256 com salt) no banco simulado.

### Cupons

| Código         | Resultado             |
| -------------- | --------------------- |
| `KURIO10`      | 10% de desconto       |
| `BEMVINDO5`    | 5% de desconto        |
| `EXPIRADO20`   | Cupom expirado (erro) |
| Qualquer outro | Cupom inválido (erro) |

### Carteiras e endereços

Os formulários de carteira aceitam qualquer endereço fictício no formato `0x` seguido de 40 caracteres hexadecimais, por exemplo `0x4F3a9C2e7B1d8E6f0A5c3B9d2E7f1A4c6B8d0E2f`.

## Cenários e reset dos mocks

O estado simulado (catálogo, usuários, favoritos, carrinhos, pedidos e carteiras) fica em `localStorage` e sobrevive a refresh.

| Ação               | Como fazer                                                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Selecionar cenário | Abrir qualquer URL com `?scenario=<id>`, por exemplo `http://localhost:5173/?scenario=payment-declined`. O cenário fica salvo até ser trocado.                              |
| Voltar ao normal   | `?scenario=default`                                                                                                                                                         |
| Reset completo     | `?reset=1` restaura o banco semeado, volta ao cenário `default` e limpa sessão, carrinho e rascunhos do app. Para resetar já em outro cenário, use `?reset=1&scenario=<id>` |
| Pelo console       | `window.__kurioMock.setScenario('flaky')`, `window.__kurioMock.reset()`                                                                                                     |

| Cenário                       | Comportamento                                                                |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `default`                     | Sucesso, latência curta e pagamento confirmado                               |
| `empty-catalog`               | Catálogo sem resultados                                                      |
| `slow-network`                | Todas as respostas levam 2,5 s (skeletons)                                   |
| `variable-latency`            | Latência variável; respostas da listagem chegam fora de ordem                |
| `offline`                     | Sem conexão: requisições e socket falham                                     |
| `server-error`                | Catálogo e detalhe respondem 500                                             |
| `flaky`                       | A primeira tentativa de cada leitura responde 503; a nova tentativa funciona |
| `favorites-failure`           | Incluir ou remover favorito responde 500 (rollback otimista)                 |
| `session-expires-on-checkout` | A sessão expira ao gerar a cotação do checkout                               |
| `price-change-on-checkout`    | O preço do primeiro item sobe 15% logo após a cotação                        |
| `sold-out-on-checkout`        | A edição do primeiro item esgota logo após a cotação                         |
| `order-timeout`               | A criação do pedido excede o timeout na primeira tentativa                   |
| `payment-declined`            | O pagamento é recusado                                                       |
| `wallet-rejected`             | A carteira recusa a conexão                                                  |
| `wallet-disconnects`          | A carteira se desconecta ao confirmar a compra                               |

### Controles extras (console do navegador)

| Comando                                                              | Efeito                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `__kurioMock.updateNft('emerald-ape-042', { price: '1.5' })`         | Muda o preço no servidor e emite `nft.updated` pelo Socket.IO       |
| `__kurioMock.updateNft('emerald-ape-042', { available: 0 })`         | Esgota a edição padrão e emite o evento                             |
| `__kurioMock.emitStaleNftEvent('emerald-ape-042', { price: '0.5' })` | Emite um evento com versão antiga (deve ser ignorado)               |
| `__kurioMock.dropConnections()`                                      | Derruba o socket; o cliente reconecta e reconcilia com a API        |
| `__kurioMock.expireSessions()`                                       | Expira todas as sessões; a próxima requisição privada leva ao login |
| `__kurioMock.settlePendingOrders()`                                  | Liquida imediatamente os pedidos pendentes                          |

## Como reproduzir os fluxos de falha

| Fluxo                            | Passos                                                                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Carregamento lento e skeletons   | `/?scenario=slow-network` e navegar pelo catálogo, detalhe e carrinho                                                                          |
| Falha e nova tentativa           | `/?scenario=server-error`. O catálogo mostra erro; troque para `default` pelo console e clique em **Tentar novamente**                         |
| Retry automático                 | `/?scenario=flaky`. As leituras falham uma vez e se recuperam sozinhas                                                                         |
| Respostas fora de ordem          | `/?scenario=variable-latency` e trocar filtros rapidamente; a lista final corresponde sempre ao último filtro                                  |
| Sem conexão                      | `/?scenario=offline`                                                                                                                           |
| Favorito com rollback            | Entrar, abrir um NFT, rodar `__kurioMock.setScenario('favorites-failure')` e clicar em **Favoritar**. O estado volta e um aviso aparece        |
| Cupom inválido ou expirado       | No carrinho, aplicar `XYZ` ou `EXPIRADO20`                                                                                                     |
| Conflito de cadastro             | Criar conta com o e-mail `colecionador@kurio.dev`                                                                                              |
| Sessão expirada no checkout      | `/?scenario=session-expires-on-checkout`, entrar e ir ao pagamento. O app leva ao login e retoma o checkout com os dados preservados           |
| Preço alterado durante a compra  | `/?scenario=price-change-on-checkout`, ir ao pagamento, conectar e revisar. Após 1,5 s, a confirmação é bloqueada até aceitar os novos valores |
| Edição esgotada durante a compra | `/?scenario=sold-out-on-checkout`, mesmo caminho acima                                                                                         |
| Carteira recusa a conexão        | `/?scenario=wallet-rejected` e clicar em **Conectar carteira**                                                                                 |
| Carteira desconecta na compra    | `/?scenario=wallet-disconnects`, revisar e confirmar. O app volta para a etapa da carteira e pede nova conexão, sem criar pedido               |
| Pagamento recusado               | `/?scenario=payment-declined` e confirmar a compra. Os itens continuam no carrinho                                                             |
| Timeout com recuperação          | `/?scenario=order-timeout` e confirmar a compra. Após 8 s, **Tentar novamente** recupera o mesmo pedido, sem duplicar                          |
| Clique repetido                  | Clicar várias vezes em **Confirmar compra**: um único pedido é criado (chave de idempotência)                                                  |
| Pedido pendente após queda       | Confirmar a compra, rodar `__kurioMock.dropConnections()` e recarregar a página. O status é recuperado sem nova compra                         |
| Tempo real no carrinho           | Com um NFT no carrinho, rodar `__kurioMock.updateNft(...)`. O item, o resumo e um aviso acessível são atualizados                              |

## Comandos

| Comando                   | Descrição                                                               |
| ------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`             | Servidor de desenvolvimento com mocks (porta 5173)                      |
| `npm run build`           | Build de produção (gera as rotas e roda o typecheck)                    |
| `npm run preview`         | Serve o build de produção (porta 4173)                                  |
| `npm run typecheck`       | Verificação de tipos (`tsc -b`)                                         |
| `npm run lint`            | ESLint com `strictTypeChecked`                                          |
| `npm run format`          | Prettier, com ordenação de classes Tailwind                             |
| `npm run test:e2e`        | Testes Playwright (build, preview e projetos desktop 1440 e mobile 390) |
| `npm run test:e2e:ui`     | Playwright em modo interativo                                           |
| `npm run test:e2e:update` | Atualiza as baselines de regressão visual                               |
| `npm run lighthouse`      | Build e auditoria Lighthouse mobile e desktop (3 execuções, mediana)    |

## Testes

Os 12 cenários exigidos estão em `tests/e2e/01-*.spec.ts` a `12-*.spec.ts`. A regressão visual de Início, Detalhe, Carrinho e Pagamento está em `tests/e2e/visual.spec.ts`, com baselines versionadas em `tests/e2e/__screenshots__/`.

- Cada teste parte de um contexto novo do navegador, com o banco simulado recém-semeado.
- As chamadas REST passam pelos handlers do MSW. Os eventos de tempo real são emitidos pelo servidor de socket simulado e chegam pelo `socket.io-client`.
- O timeout do pedido é testado com relógio controlado (`page.clock`).
- O relatório HTML fica em `playwright-report/`. Traces, vídeos e screenshots de falhas ficam em `test-results/`.

As baselines visuais foram geradas no Windows. Em outro sistema operacional, diferenças de renderização de fonte podem exigir `npm run test:e2e:update`.

## Estrutura

```
src/
  app/         providers, router, query client, sincronização de sessão e tempo real
  contracts/   schemas Zod dos contratos REST e eventos (compartilhados com os mocks)
  routes/      rotas do TanStack Router
  features/    domínios: auth, catalog, favorites, cart, checkout, account
  components/  shadcn/ui adaptado, layout e componentes compartilhados
  lib/         http, erros, sessão, tempo real, dinheiro (ETH)
  mocks/       MSW: banco, fixtures, domínio, handlers, socket, cenários
tests/e2e/     Playwright
lighthouse/    configuração e relatórios da auditoria
```
