import { confirmButton, reachReview } from './support/checkout'
import { expect, HERO_NFT, test } from './support/fixtures'

test('eventos duplicados ou antigos não regridem o estado nem reaplicam efeitos', async ({
  app,
  page,
}) => {
  await app.goto('/')
  await app.addToCartViaApi(HERO_NFT.id, HERO_NFT.standardEdition, 1)
  await app.goto('/cart')
  const item = page.getByRole('list', { name: 'Itens do carrinho' }).getByRole('listitem')
  await expect(item).toContainText('1.19 ETH')
  await app.waitForRealtime()

  const event = await app.updateNft(HERO_NFT.id, {
    editionId: HERO_NFT.standardEdition,
    price: '1.5',
  })
  const priceToast = app.toast('mudou de 1.19 ETH para 1.50 ETH')
  await expect(priceToast).toHaveCount(1)
  await expect(item).toContainText('1.50 ETH')

  await app.replayNftEvent(event)
  await app.emitStaleNftEvent(HERO_NFT.id, { editionId: HERO_NFT.standardEdition, price: '0.5' })
  await app.updateNft(HERO_NFT.id, { editionId: HERO_NFT.standardEdition, price: '1.75' })

  await expect(item).toContainText('1.75 ETH')
  await expect(priceToast).toHaveCount(1)
  await expect(app.toast('0.50 ETH')).toHaveCount(0)

  await app.reload()
  await expect(item).toContainText('1.75 ETH')
  await app.waitForRealtime()
  await app.emitStaleNftEvent(HERO_NFT.id, { editionId: HERO_NFT.standardEdition, price: '0.5' })
  await app.updateNft(HERO_NFT.id, { editionId: HERO_NFT.standardEdition, price: '2' })
  await expect(item).toContainText('2.00 ETH')
  await expect(app.toast('0.50 ETH')).toHaveCount(0)
})

test('desconexão e recarga retomam o pedido pendente sem nova compra', async ({ app, page }) => {
  await app.goto('/')
  await app.loginViaApi('ana')
  await app.addToCartViaApi(HERO_NFT.id, HERO_NFT.standardEdition, 1)
  await app.goto('/checkout')
  await reachReview(page)
  await confirmButton(page).click()

  await expect(page.getByRole('heading', { name: 'Processando pagamento' })).toBeVisible()
  await app.dropConnections()
  await app.reload()

  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible({
    timeout: 15_000,
  })
  expect(await app.ordersCount()).toBe(1)
})

test('reconexão do socket reconcilia os dados com a API', async ({ app, page }) => {
  await app.goto(`/nfts/${HERO_NFT.id}`)
  await expect(page.getByText('1.19 ETH').first()).toBeVisible()

  await app.dropConnections()
  await app.updateNft(
    HERO_NFT.id,
    { editionId: HERO_NFT.standardEdition, price: '2.5' },
    { silent: true },
  )

  await expect(page.getByText('2.50 ETH').first()).toBeVisible({ timeout: 10_000 })
})
