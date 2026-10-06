# Auditoria Lighthouse

Auditoria de **Início** (`/`) e **Detalhe do NFT** (`/nfts/emerald-ape-042`) nos perfis mobile e desktop. Foram feitas três medições por página e perfil, sobre o build de produção (`vite build` + `vite preview`), com o cenário padrão dos mocks (MSW ativo, latência curta). A tabela reporta a mediana de cada categoria.

## Resultados (mediana de 3 execuções)

| Página  | Perfil  | Performance | Accessibility | Best Practices |     SEO |    LCP |   CLS |    TBT |    FCP |
| ------- | ------- | ----------: | ------------: | -------------: | ------: | -----: | ----: | -----: | -----: |
| Início  | Desktop |      **98** |       **100** |        **100** | **100** | 1.04 s | 0.002 |   2 ms | 0.80 s |
| Detalhe | Desktop |      **98** |       **100** |        **100** | **100** | 1.04 s | 0.000 |   0 ms | 0.80 s |
| Início  | Mobile  |          70 |       **100** |        **100** | **100** | 5.49 s | 0.023 | 106 ms | 3.76 s |
| Detalhe | Mobile  |          74 |       **100** |        **100** | **100** | 4.79 s | 0.000 |  75 ms | 3.75 s |

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.

- **Desktop:** todas as categorias atingem a meta.
- **Mobile:** Accessibility, Best Practices e SEO atingem a meta. **Performance fica abaixo** (análise abaixo).
- As performances individuais foram 70/70/70 (Início) e 74/74/74 (Detalhe) no mobile, e 98/98/98 nas duas páginas no desktop.

## Como reproduzir

```bash
npm run lighthouse
```

O comando gera o build e roda `lhci autorun` com as configurações versionadas:

- `lighthouse/base.cjs`: URLs, 3 execuções, asserções das metas com agregação por mediana e saída em `lighthouse/reports/<perfil>`.
- `lighthouse/lighthouserc.mobile.cjs`: preset padrão (mobile).
- `lighthouse/lighthouserc.desktop.cjs`: preset `desktop`.

Os relatórios HTML e JSON de cada execução ficam em `lighthouse/reports/mobile` e `lighthouse/reports/desktop`. O `manifest.json` de cada pasta indica a execução representativa (mediana).

## Ambiente e condições

| Item       | Valor                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Lighthouse | 12.6.1 (via `@lhci/cli` 0.15.1)                                                                   |
| Navegador  | HeadlessChrome 154 (Chrome instalado no sistema)                                                  |
| Sistema    | Windows 11 Pro, Node 24.12.0, Vite 8.3.2                                                          |
| Servidor   | `vite preview` local (porta 4173), com compressão                                                 |
| Mobile     | Throttling simulado: RTT 150 ms, 1,6 Mbps, CPU 4x mais lenta; tela 412×823 com DPR 1.75           |
| Desktop    | Throttling simulado: RTT 40 ms, 10 Mbps, CPU 1x; preset `desktop`                                 |
| Dados      | Cenário `default` dos mocks; cada execução começa sem armazenamento (banco simulado recém-criado) |

A auditoria carrega as imagens, fontes e funcionalidades reais da entrega (MSW, Socket.IO simulado, React Query), sem simplificações exclusivas para a pontuação.

## Análise e causas

### Otimizações aplicadas durante a auditoria

| Mudança                                                                                                                       | Efeito medido                                            |
| ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| App renderiza em paralelo com o MSW; requisições e socket aguardam uma barreira de "rede pronta" (`src/lib/network-ready.ts`) | TBT mobile do Início: 580 ms → 146 ms                    |
| `socket.io-client` carregado sob demanda, depois da barreira                                                                  | Menos JS na inicialização                                |
| Preload da arte do hero no HTML, com `imagesrcset` e `imagesizes`                                                             | LCP desktop sem atraso de carregamento (Load Delay 0 ms) |
| `main` com altura mínima de uma tela                                                                                          | CLS desktop do Detalhe: 0.195 → 0                        |
| `robots.txt`                                                                                                                  | SEO: 92 → 100                                            |
| Imagens WebP em 3 larguras com `srcset` e `sizes`; dimensões fixas                                                            | CLS próximo de 0 em todas as páginas                     |

### Por que a performance mobile fica abaixo de 90

1. **A API roda dentro do próprio aparelho.** A entrega exige o MSW também no build de demonstração. Antes de qualquer dado existir, o navegador precisa:
   - baixar e executar o pacote de mocks (cerca de 170 KB gzip: MSW, interceptors, parsers do Socket.IO, fixtures e regras de negócio);
   - registrar e ativar o service worker;
   - criar o banco simulado.

   Com CPU 4x mais lenta e rede 4G simulada, essa cadeia sozinha consome cerca de 3 s.

2. **O LCP mobile depende de dados.** No Início mobile, o maior elemento é a arte do primeiro card do catálogo. No Detalhe, é a imagem principal do NFT. Ambos só existem depois da resposta da API simulada. Por isso, mesmo com a imagem baixada rápido, o _render delay_ domina (cerca de 3 s no Início).
3. **FCP de SPA.** Sem HTML pré-renderizado, o primeiro conteúdo depende do download e da execução do bundle inicial (cerca de 127 KB gzip: React, TanStack Router e Query, Radix e Zod) sob a rede simulada.

No desktop, as mesmas cadeias custam cerca de 1 s, e todas as metas são atingidas. Com um backend real, os itens 1 e 2 deixariam de existir: os dados viriam pela rede em paralelo ao bundle, sem o custo de iniciar a API dentro do aparelho.

### Próximos passos possíveis

- Pré-renderizar (SSG) o shell do Início e do Detalhe, para tirar o FCP do caminho do JavaScript.
- Carregar sob demanda partes do header usadas só por usuários logados (menu da conta, Radix Dropdown e floating-ui).
- Em produção com backend real, desativar os mocks (`VITE_ENABLE_MOCKS=false`) e remover a cadeia do service worker.
