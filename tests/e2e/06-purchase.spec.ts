import { confirmButton, reachReview } from './support/checkout'
import { expect, HERO_NFT, test } from './support/fixtures'

test('compra completa do catálogo ao recibo confirmado', async ({ app, page }) => {
  await app.goto('/')
  await app.loginViaApi('ana')

  await page.locator('#catalogo').getByRole('link', { name: HERO_NFT.name, exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: HERO_NFT.name })).toBeVisible()
  await page.getByRole('button', { name: /^Comprar( NFT)?$/ }).click()

  await expect(page).toHaveURL(/\/cart$/)
  await page.getByRole('link', { name: 'Finalizar compra' }).click()
  await expect(page).toHaveURL(/\/checkout$/)

  await reachReview(page)
  await confirmButton(page).click()

  await expect(page).toHaveURL(/\/orders\/ord_/)
  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(
    page.getByRole('list', { name: 'Itens do pedido' }).getByText(HERO_NFT.name),
  ).toBeVisible()
  await expect(page.getByText('1.206 ETH')).toBeVisible()
  const explorerLink = page.getByRole('link', { name: /Ver no explorador/ })
  await expect(explorerLink).toHaveAttribute('href', /^\/explorer\/tx\/0x[0-9a-f]{64}\?order=ord_/)
  expect(await app.ordersCount()).toBe(1)

  await explorerLink.click()
  await expect(page.getByRole('heading', { name: 'Detalhes da transação' })).toBeVisible()
  await expect(page.getByText('Sucesso')).toBeVisible()
  await expect(page.getByRole('note')).toContainText('Explorador simulado')

  await app.goto('/cart')
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
})
