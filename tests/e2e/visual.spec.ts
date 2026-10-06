import type { Page } from '@playwright/test'
import { expect, HERO_NFT, test } from './support/fixtures'

const STABILIZE_CSS = `
  [data-sonner-toaster] { display: none !important; }
  *, *::before, *::after { caret-color: transparent !important; }
`

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.addStyleTag({ content: STABILIZE_CSS })
  await page.evaluate(async () => {
    for (const image of Array.from(document.images)) image.loading = 'eager'
    await Promise.all(
      Array.from(document.images).map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              image.addEventListener('load', resolve, { once: true })
              image.addEventListener('error', resolve, { once: true })
            }),
      ),
    )
    await Promise.all(
      Array.from(document.images).map((image) => image.decode().catch(() => undefined)),
    )
    await document.fonts.ready
  })
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
  await expect(page.locator('.skeleton-shimmer')).toHaveCount(0)
}

test('início', async ({ app, page }) => {
  await app.goto('/')
  await expect(page.locator('#catalogo h3 a').first()).toBeVisible()
  await settle(page)
  await expect(page).toHaveScreenshot('inicio.png', { fullPage: true })
})

test('detalhe do NFT', async ({ app, page }) => {
  await app.goto(`/nfts/${HERO_NFT.id}`)
  await expect(page.getByRole('heading', { level: 1, name: HERO_NFT.name })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Mais desta coleção' })).toBeVisible()
  await settle(page)
  await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true })
})

test('carrinho', async ({ app, page }) => {
  await app.goto('/')
  await app.addToCartViaApi(HERO_NFT.id, HERO_NFT.standardEdition, 2)
  await app.goto('/cart')
  await expect(
    page
      .getByRole('complementary', { name: 'Resumo do pedido' })
      .getByText('Total', { exact: true }),
  ).toBeVisible()
  await settle(page)
  await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true })
})

test('pagamento', async ({ app, page }) => {
  await app.goto('/')
  await app.loginViaApi('ana')
  await app.addToCartViaApi(HERO_NFT.id, HERO_NFT.standardEdition, 1)
  await app.goto('/checkout')
  await expect(page.getByRole('list', { name: 'Itens do pedido' })).toBeVisible()
  await settle(page)
  await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true })
})
