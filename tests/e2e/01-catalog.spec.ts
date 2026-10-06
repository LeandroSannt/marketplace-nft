import type { Page } from '@playwright/test'
import { expect, test } from './support/fixtures'

async function cardNames(page: Page) {
  await expect(page.locator('#catalogo ul[aria-busy="true"]')).toHaveCount(0)
  return page.locator('#catalogo h3 a').allTextContents()
}

function filters(page: Page) {
  return page.getByRole('complementary', { name: 'Filtros' })
}

test('busca, filtros combinados, ordenação, paginação e restauração pelo histórico', async ({
  app,
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'A barra lateral de filtros é do desktop; o mobile usa o drawer abaixo')
  await app.goto('/')
  const results = page.getByText(/NFTs encontrados, página/)
  await expect(results).toHaveText(/40 NFTs encontrados, página 1/)

  await filters(page)
    .getByRole('checkbox', { name: /Arte digital/ })
    .click()
  await filters(page)
    .getByRole('checkbox', { name: /Ethereum/ })
    .click()
  await expect(page).toHaveURL(/collections=.*digital-art.*networks=.*ethereum/)
  await expect(results).not.toHaveText(/^40 NFTs/)
  await expect(filters(page).getByRole('checkbox', { name: /Arte digital/ })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  const filteredNames = await cardNames(page)
  expect(filteredNames.length).toBeGreaterThan(0)
  expect(filteredNames.length).toBeLessThan(9)

  await page.reload()
  await expect(filters(page).getByRole('checkbox', { name: /Ethereum/ })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect.poll(() => cardNames(page)).toEqual(filteredNames)

  await filters(page).getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(results).toHaveText(/40 NFTs encontrados/)

  await page.getByLabel('Ordenar por:').click()
  await page.getByRole('option', { name: 'Menor preço' }).click()
  await expect(page).toHaveURL(/sort=price-asc/)
  await cardNames(page)
  const prices = await page.locator('#catalogo h3 + p').allTextContents()
  const values = prices.map((text) => Number(/([\d.]+) ETH/.exec(text)?.[1]))
  expect(values).toEqual([...values].sort((a, b) => a - b))

  await page.getByRole('button', { name: 'Página 2' }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  const pageTwoNames = await cardNames(page)

  await filters(page)
    .getByRole('checkbox', { name: /Fotografia/ })
    .click()
  await expect(page).not.toHaveURL(/page=/)

  await page.goBack()
  await expect(page).toHaveURL(/page=2/)
  await expect.poll(() => cardNames(page)).toEqual(pageTwoNames)

  await page.getByRole('button', { name: 'Buscar NFTs' }).click()
  await page
    .getByRole('searchbox', { name: 'Buscar NFTs por nome ou criador' })
    .filter({ visible: true })
    .fill('Emerald')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/q=Emerald/)
  await expect(page.getByText('Resultados para')).toBeVisible()
  const searchNames = await cardNames(page)
  expect(searchNames.length).toBeGreaterThan(0)
  for (const name of searchNames) expect(name).toContain('Emerald')
})

test('estado vazio com opção de limpar filtros', async ({ app, page }) => {
  await app.goto('/?q=inexistente')
  await expect(page.getByText('Nenhum NFT encontrado')).toBeVisible()
  await page.getByRole('main').getByRole('button', { name: 'Limpar filtros' }).last().click()
  await expect(page.locator('#catalogo h3 a').first()).toBeVisible()
})

test('mobile: filtros no drawer persistem na URL, no refresh e no histórico', async ({
  app,
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Drawer de filtros exclusivo do mobile')
  await app.goto('/')
  await expect(page.locator('#catalogo h3 a').first()).toBeVisible()
  const allNames = await cardNames(page)

  const trigger = page.getByRole('button', { name: 'Filtros', exact: true })
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Filtros' })
  await expect(drawer).toBeVisible()
  await drawer.getByRole('checkbox', { name: /Fotografia/ }).click()
  await expect(page).toHaveURL(/collections=.*photography/)

  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(page.getByRole('button', { name: 'Filtros (ativos)' })).toBeFocused()
  const filteredNames = await cardNames(page)
  expect(filteredNames).not.toEqual(allNames)

  await page.reload()
  await expect(page).toHaveURL(/collections=.*photography/)
  await expect.poll(() => cardNames(page)).toEqual(filteredNames)

  await page.goBack()
  await expect(page).not.toHaveURL(/collections=/)
  await expect.poll(() => cardNames(page)).toEqual(allNames)
})

test('respostas fora de ordem: a lista final corresponde à última seleção', async ({
  app,
  page,
}) => {
  await app.goto('/')
  const trending = await page.evaluate(async () => {
    const response = await fetch('/api/nfts?tab=trending')
    const body = (await response.json()) as { items: { name: string }[] }
    return body.items.map((item) => item.name)
  })
  const tab = (name: string) => page.getByRole('button', { name, exact: true })

  await app.setScenario('variable-latency')
  for (const name of ['Novos lançamentos', 'Em alta', 'Novos lançamentos', 'Em alta']) {
    await tab(name).click()
  }
  await expect(tab('Em alta')).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => cardNames(page)).toEqual(trending)
  await page.waitForTimeout(1500)
  expect(await cardNames(page)).toEqual(trending)
})
