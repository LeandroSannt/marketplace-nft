import type { Page } from '@playwright/test'
import { expect, HERO_NFT, test, USERS } from './support/fixtures'

function cartItems(page: Page) {
  return page.getByRole('list', { name: 'Itens do carrinho' }).getByRole('listitem')
}

function summary(page: Page) {
  return page.getByRole('complementary', { name: 'Resumo do pedido' })
}

test('quantidades, remoção, cupom e persistência após refresh', async ({ app, page }) => {
  await app.goto(`/nfts/${HERO_NFT.id}`)
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: /^Comprar( NFT)?$/ }).click()
  await expect(page).toHaveURL(/\/cart$/)
  await expect(cartItems(page)).toHaveCount(1)
  await expect(
    cartItems(page)
      .getByRole('group', { name: /Quantidade/ })
      .locator('output'),
  ).toHaveText('2')
  await expect(summary(page).getByText('2.38 ETH').first()).toBeVisible()

  await cartItems(page).getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(summary(page).getByText('Subtotal (3 itens)')).toBeVisible()
  await expect(summary(page).getByText('3.57 ETH')).toBeVisible()

  await cartItems(page).getByRole('button', { name: 'Diminuir quantidade' }).click()
  await expect(summary(page).getByText('Subtotal (2 itens)')).toBeVisible()
  await expect(summary(page).getByText('2.38 ETH').first()).toBeVisible()
  await cartItems(page).getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(summary(page).getByText('Subtotal (3 itens)')).toBeVisible()

  const coupon = summary(page).getByLabel('Código promocional')
  await coupon.fill('INVALIDO')
  await summary(page).getByRole('button', { name: 'Aplicar' }).click()
  await expect(summary(page).getByRole('alert')).toHaveText('Cupom inválido')
  await expect(coupon).toHaveAttribute('aria-invalid', 'true')

  await coupon.fill('EXPIRADO20')
  await summary(page).getByRole('button', { name: 'Aplicar' }).click()
  await expect(summary(page).getByRole('alert')).toHaveText('Este cupom expirou')

  await coupon.fill('kurio10')
  await summary(page).getByRole('button', { name: 'Aplicar' }).click()
  await expect(summary(page).getByText('Desconto KURIO10 (10%)')).toBeVisible()
  await expect(summary(page).getByText('3.229 ETH')).toBeVisible()

  await app.reload()
  await expect(cartItems(page)).toHaveCount(1)
  await expect(summary(page).getByText('Cupom KURIO10 aplicado')).toBeVisible()

  await summary(page).getByRole('button', { name: 'Remover cupom KURIO10' }).click()
  await expect(summary(page).getByText('Desconto KURIO10 (10%)')).toHaveCount(0)

  await cartItems(page)
    .getByRole('button', { name: `Remover ${HERO_NFT.name} (Padrão) do carrinho` })
    .click()
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
})

test('itens do visitante são preservados ao autenticar', async ({ app, page, isMobile }) => {
  test.skip(isMobile, 'O modal de login é do desktop')
  await app.goto('/')
  await app.addToCartViaApi(HERO_NFT.id, HERO_NFT.standardEdition, 1)
  await app.goto('/cart')
  await expect(cartItems(page)).toHaveCount(1)

  await summary(page).getByRole('link', { name: 'Entre na sua conta' }).click()
  const dialog = page.getByRole('dialog', { name: 'Entrar' })
  await dialog.getByLabel('E-mail').fill(USERS.ana.email)
  await dialog.getByLabel('Senha', { exact: true }).fill(USERS.ana.password)
  await dialog.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/cart$/)
  await expect(cartItems(page)).toHaveCount(1)
  await expect(summary(page).getByRole('heading', { name: 'Carteira principal' })).toBeVisible()
  await app.reload()
  await expect(cartItems(page)).toHaveCount(1)
})
