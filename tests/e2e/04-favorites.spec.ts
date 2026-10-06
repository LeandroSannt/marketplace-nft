import { expect, test } from './support/fixtures'

const NFT_PATH = '/nfts/violet-nomad-527'

test('favoritar persiste, falha faz rollback e recupera o estado', async ({ app, page }) => {
  await app.goto(NFT_PATH)
  await app.loginViaApi('ana')

  const favorite = page.getByRole('button', { name: /^(Favoritar|Favorito)$/ })
  await expect(favorite).toHaveAttribute('aria-pressed', 'false')

  await favorite.click()
  await expect(favorite).toHaveAttribute('aria-pressed', 'true')
  await expect(app.toast('foi adicionado aos favoritos')).toBeVisible()

  await app.reload()
  await expect(favorite).toHaveAttribute('aria-pressed', 'true')

  await app.setScenario('favorites-failure')
  await favorite.click()
  await expect(favorite).toHaveAttribute('aria-pressed', 'false')
  await expect(app.toast('Não foi possível atualizar seus favoritos')).toBeVisible()
  await expect(favorite).toHaveAttribute('aria-pressed', 'true')

  await app.setScenario('default')
  await favorite.click()
  await expect(app.toast('saiu dos favoritos')).toBeVisible()
  await app.reload()
  await expect(favorite).toHaveAttribute('aria-pressed', 'false')
})

test('visitante é levado ao login ao favoritar e volta ao NFT', async ({ app, page, isMobile }) => {
  test.skip(isMobile, 'O modal de login é do desktop')
  await app.goto(NFT_PATH)
  await page.getByRole('button', { name: 'Favoritar' }).click()
  await expect(page).toHaveURL(/\/login\?redirect=%2Fnfts%2Fviolet-nomad-527/)
  const dialog = page.getByRole('dialog', { name: 'Entrar' })
  await dialog.getByLabel('E-mail').fill('colecionador@kurio.dev')
  await dialog.getByLabel('Senha', { exact: true }).fill('Kurio2026')
  await dialog.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/nfts\/violet-nomad-527$/)
})
