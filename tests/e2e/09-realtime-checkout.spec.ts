import { confirmButton, paymentSummary, reachReview } from './support/checkout'
import { expect, HERO_NFT, test } from './support/fixtures'

test.beforeEach(async ({ app }) => {
  await app.goto('/')
  await app.loginViaApi('ana')
  await app.addToCartViaApi(HERO_NFT.id, HERO_NFT.standardEdition, 1)
  await app.goto('/checkout')
  await reachReview(app.page)
})

test('preço alterado via Socket.IO bloqueia a cotação desatualizada', async ({ app, page }) => {
  await expect(paymentSummary(page).getByText('1.206 ETH')).toBeVisible()

  await app.updateNft(HERO_NFT.id, { editionId: HERO_NFT.standardEdition, price: '1.5' })

  await expect(
    app.toast(`O preço de ${HERO_NFT.name} (Padrão) mudou de 1.19 ETH para 1.50 ETH.`),
  ).toBeVisible()
  await expect(
    page.getByRole('alert').filter({ hasText: 'Preço, disponibilidade ou taxas mudaram' }),
  ).toBeVisible()
  await expect(confirmButton(page)).toBeDisabled()
  await expect(paymentSummary(page).getByText('1.516 ETH')).toBeVisible()

  await page.getByRole('button', { name: 'Aceitar novos valores' }).click()
  await expect(confirmButton(page)).toBeEnabled()
  await confirmButton(page).click()
  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText('1.516 ETH')).toBeVisible()
})

test('edição esgotada via Socket.IO impede a confirmação', async ({ app, page }) => {
  await app.updateNft(HERO_NFT.id, { editionId: HERO_NFT.standardEdition, available: 0 })

  await expect(app.toast(`${HERO_NFT.name} (Padrão) esgotou`)).toBeVisible()
  await expect(paymentSummary(page).getByText('Há itens indisponíveis.')).toBeVisible()
  await expect(confirmButton(page)).toBeDisabled()
})
