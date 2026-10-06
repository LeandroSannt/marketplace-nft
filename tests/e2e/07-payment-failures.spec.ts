import { confirmButton, reachReview } from './support/checkout'
import { expect, HERO_NFT, test } from './support/fixtures'

test.beforeEach(async ({ app }) => {
  await app.goto('/')
  await app.loginViaApi('ana')
  await app.addToCartViaApi(HERO_NFT.id, HERO_NFT.standardEdition, 1)
})

test('pagamento recusado preserva os itens no carrinho', async ({ app, page }) => {
  await app.setScenario('payment-declined')
  await app.goto('/checkout')
  await reachReview(page)
  await confirmButton(page).click()

  await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole('link', { name: 'Ver carrinho' }).click()
  await expect(
    page.getByRole('list', { name: 'Itens do carrinho' }).getByRole('listitem'),
  ).toHaveCount(1)
})

test('cliques repetidos criam um único pedido', async ({ app, page }) => {
  await app.goto('/checkout')
  await reachReview(page)
  await confirmButton(page).dblclick()
  await confirmButton(page)
    .click({ force: true, trial: false })
    .catch(() => undefined)

  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible({
    timeout: 15_000,
  })
  expect(await app.ordersCount()).toBe(1)
})

test('timeout após criar o pedido recupera o mesmo pedido', async ({ app, page }) => {
  await page.clock.install()
  await app.setScenario('order-timeout')
  await app.goto('/checkout')
  await reachReview(page)
  await confirmButton(page).click()

  await page.clock.fastForward('00:09')
  const recovery = page
    .getByRole('alert')
    .filter({ hasText: 'Não recebemos a confirmação do pedido' })
  await expect(recovery).toBeVisible()

  await recovery.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page).toHaveURL(/\/orders\/ord_/)
  await expect(
    page.getByRole('heading', { name: /Pedido confirmado|Processando pagamento/ }),
  ).toBeVisible()
  await page.clock.fastForward('00:05')
  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible()
  expect(await app.ordersCount()).toBe(1)
})

test('carteira desconectada na confirmação exige nova conexão sem criar pedido', async ({
  app,
  page,
}) => {
  await app.setScenario('wallet-disconnects')
  await app.goto('/checkout')
  await reachReview(page)
  await confirmButton(page).click()

  await expect(page.getByText('A carteira foi desconectada').first()).toBeVisible()
  await expect(page.getByText('Carteira desconectada. Conecte para continuar.')).toBeVisible()
  expect(await app.ordersCount()).toBe(0)

  await reachReview(page)
  await confirmButton(page).click()
  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible({
    timeout: 15_000,
  })
  expect(await app.ordersCount()).toBe(1)
})
