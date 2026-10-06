import { expect, HERO_NFT, test } from './support/fixtures'

test('skeletons durante carregamento lento no catálogo, detalhe e resumo do carrinho', async ({
  app,
  page,
}) => {
  await app.useScenario('slow-network')
  await app.goto('/cart')
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible({ timeout: 10_000 })

  await page
    .getByRole('link', { name: /Kurio, página inicial|^Início$/ })
    .filter({ visible: true })
    .first()
    .click()
  const catalogLoading = page.getByRole('status', { name: 'Carregando NFTs' })
  await expect(catalogLoading.locator('.skeleton-shimmer').first()).toBeVisible()
  await expect(page.locator('#catalogo h3 a').first()).toBeVisible({ timeout: 10_000 })
  await expect(catalogLoading).toBeHidden()

  await page.locator('#catalogo').getByRole('link', { name: HERO_NFT.name, exact: true }).click()
  await expect(
    page.getByRole('status', { name: 'Carregando NFT' }).locator('.skeleton-shimmer').first(),
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: HERO_NFT.name })).toBeVisible({
    timeout: 10_000,
  })

  await page.getByRole('button', { name: 'Comprar', exact: true }).click()
  await expect(page).toHaveURL(/\/cart$/, { timeout: 10_000 })
  await expect(
    page.getByRole('status', { name: 'Calculando resumo' }).locator('.skeleton-shimmer').first(),
  ).toBeVisible()
  await expect(
    page
      .getByRole('complementary', { name: 'Resumo do pedido' })
      .getByText('Total', { exact: true }),
  ).toBeVisible({ timeout: 15_000 })
})

test('falha no catálogo exibe feedback e recupera após nova tentativa', async ({ app, page }) => {
  await app.useScenario('server-error')
  await app.goto('/')

  const failure = page
    .getByRole('alert')
    .filter({ hasText: 'Não foi possível carregar o catálogo' })
  await expect(failure).toBeVisible({ timeout: 10_000 })
  await expect(failure).toContainText('Erro interno ao consultar o catálogo')

  await app.setScenario('default')
  await failure.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(failure).toBeHidden()
  await expect(page.locator('#catalogo h3 a').first()).toBeVisible()
})

test('falha no detalhe exibe feedback e recupera após nova tentativa', async ({ app, page }) => {
  await app.useScenario('server-error')
  await app.goto(`/nfts/${HERO_NFT.id}`)

  const failure = page.getByRole('alert').filter({ hasText: 'Não foi possível carregar este NFT' })
  await expect(failure).toBeVisible({ timeout: 10_000 })

  await app.setScenario('default')
  await failure.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByRole('heading', { level: 1, name: HERO_NFT.name })).toBeVisible()
})
