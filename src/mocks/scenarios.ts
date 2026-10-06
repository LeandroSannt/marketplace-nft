export const SCENARIOS = {
  default: 'Sucesso, latência curta e pagamento confirmado',
  'empty-catalog': 'Catálogo sem resultados',
  'slow-network': 'Todas as respostas levam 2,5 s',
  'variable-latency': 'Latência variável: respostas da listagem chegam fora de ordem',
  offline: 'Sem conexão: requisições e socket falham',
  'server-error': 'Catálogo e detalhe respondem 500',
  flaky: 'Primeira tentativa de cada leitura responde 503; a nova tentativa funciona',
  'favorites-failure': 'Incluir ou remover favorito responde 500',
  'session-expires-on-checkout': 'A sessão expira ao gerar a cotação do checkout',
  'price-change-on-checkout': 'O preço do primeiro item sobe 15% logo após a cotação',
  'sold-out-on-checkout': 'A edição do primeiro item esgota logo após a cotação',
  'order-timeout': 'A criação do pedido excede o timeout na primeira tentativa',
  'payment-declined': 'O pagamento é recusado',
  'wallet-rejected': 'A carteira recusa a conexão',
} as const

export type ScenarioId = keyof typeof SCENARIOS

const STORAGE_KEY = 'kurio:mock:scenario'

export function isScenarioId(value: unknown): value is ScenarioId {
  return typeof value === 'string' && value in SCENARIOS
}

function readInitialScenario(): ScenarioId {
  const fromUrl = new URLSearchParams(window.location.search).get('scenario')
  if (isScenarioId(fromUrl)) {
    persistScenario(fromUrl)
    return fromUrl
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isScenarioId(stored) ? stored : 'default'
  } catch {
    return 'default'
  }
}

function persistScenario(scenario: ScenarioId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, scenario)
  } catch {
    return
  }
}

let activeScenario: ScenarioId = readInitialScenario()

export function getScenario(): ScenarioId {
  return activeScenario
}

export function setScenario(scenario: ScenarioId) {
  activeScenario = scenario
  persistScenario(scenario)
}
