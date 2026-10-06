import { expect, HERO_NFT, test } from './support/fixtures'

test.skip(({ isMobile }) => isMobile, 'Navegação por teclado validada no desktop')

test.describe('drawer', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('drawer de filtros prende o foco, fecha com Esc e devolve o foco ao gatilho', async ({
    app,
    page,
  }) => {
    await app.goto('/')
    const trigger = page.getByRole('button', { name: 'Filtros', exact: true })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const drawer = page.getByRole('dialog', { name: 'Filtros' })
    await expect(drawer).toBeVisible()
    await expect
      .poll(() => drawer.evaluate((node) => node.contains(document.activeElement)))
      .toBe(true)
    for (let index = 0; index < 15; index += 1) {
      await page.keyboard.press('Tab')
      expect(await drawer.evaluate((node) => node.contains(document.activeElement))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    await expect(trigger).toBeFocused()
  })
})

test('link de pular conteúdo e foco visível', async ({ app, page }) => {
  await app.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('#conteudo')).toBeFocused()

  await page.keyboard.press('Tab')
  const focused = page.locator(':focus-visible')
  await expect(focused).toHaveCount(1)
  const outline = await focused.evaluate((element) => getComputedStyle(element).outlineStyle)
  expect(outline).not.toBe('none')
})

test('diálogo de login prende o foco, valida por teclado e fecha com Esc', async ({
  app,
  page,
}) => {
  await app.goto('/login')
  const dialog = page.getByRole('dialog', { name: 'Entrar' })
  await expect(dialog).toBeVisible()
  await expect
    .poll(() => dialog.evaluate((node) => node.contains(document.activeElement)))
    .toBe(true)

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true)
  }

  await dialog.getByLabel('E-mail').focus()
  await page.keyboard.press('Enter')
  await expect(dialog.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')
  await expect(dialog.getByText('Informe um e-mail válido')).toBeVisible()
  await expect(dialog.getByLabel('E-mail')).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page).toHaveURL(/\/$/)
})

test('compra operável por teclado: edição, quantidade e menu de ordenação', async ({
  app,
  page,
}) => {
  await app.goto(`/nfts/${HERO_NFT.id}`)
  const standard = page.getByRole('radio', { name: /Edição Padrão/ })
  await standard.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: /Edição Ouro/ })).toBeFocused()
  await expect(page.getByRole('radio', { name: /Edição Ouro/ })).toBeChecked()
  await page.keyboard.press('ArrowLeft')
  await expect(standard).toBeChecked()

  await page.getByRole('button', { name: 'Aumentar quantidade' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('group', { name: /Quantidade/ }).locator('output')).toHaveText('2')

  await page.getByRole('button', { name: 'Comprar', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/cart$/)

  await app.goto('/')
  await expect(page.locator('#catalogo h3 a').first()).toBeVisible()
  await page.getByLabel('Ordenar por:').focus()
  await page.keyboard.press('Enter')
  const options = page.getByRole('listbox')
  await expect(options.getByRole('option', { name: 'Listados recentemente' })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(options.getByRole('option', { name: 'Menor preço' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/sort=price-asc/)
})
