import { expect, HERO_NFT, test } from './support/fixtures'

test('acesso direto ao detalhe, edição indisponível e limite de quantidade', async ({
  app,
  page,
}) => {
  await app.goto(`/nfts/${HERO_NFT.id}`)
  await expect(page.getByRole('heading', { level: 1, name: HERO_NFT.name })).toBeVisible()
  await expect(page.getByText('1.19 ETH').filter({ visible: true }).first()).toBeVisible()

  await page.getByRole('radio', { name: /Edição Ouro.*esgotada/ }).click()
  await expect(page.getByText('A edição Ouro está esgotada.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Esgotado' })).toBeDisabled()

  await page.getByRole('radio', { name: /Edição Padrão/ }).click()
  const increase = page.getByRole('button', { name: 'Aumentar quantidade' })
  for (let index = 0; index < 6; index += 1) {
    if (await increase.isEnabled()) await increase.click()
  }
  await expect(page.getByRole('group', { name: /Quantidade de/ }).locator('output')).toHaveText('5')
  await expect(increase).toBeDisabled()
})

test('NFT inexistente exibe estado de não encontrado', async ({ app, page }) => {
  await app.goto('/nfts/nao-existe')
  await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
  await page.getByRole('link', { name: 'Explorar o catálogo' }).click()
  await expect(page).toHaveURL(/\/#catalogo$/)
})

test('rota inexistente exibe a página 404', async ({ app, page }) => {
  await app.goto('/rota/que/nao/existe')
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
})
