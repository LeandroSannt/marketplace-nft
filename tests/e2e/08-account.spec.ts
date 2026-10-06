import { expect, test } from './support/fixtures'

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

test.beforeEach(async ({ app }) => {
  await app.goto('/')
  await app.loginViaApi('ana')
})

test('edição de perfil, avatar e senha com erros de validação', async ({ app, page }) => {
  await app.goto('/account/profile')
  const profile = page.getByRole('form', { name: 'Perfil do colecionador' })

  await profile.getByLabel('Nome de usuário').fill('bruno.lima')
  await profile.getByLabel('Site').fill('nao-e-url')
  await profile.getByRole('button', { name: 'Salvar' }).click()
  await expect(profile.getByText('Informe uma URL válida (https://...)')).toBeVisible()

  await profile.getByLabel('Site').fill('https://kurio.dev/ana')
  await profile.getByRole('button', { name: 'Salvar' }).click()
  await expect(profile.getByText('Este nome de usuário já está em uso')).toBeVisible()
  await expect(profile.getByLabel('Nome de usuário')).toHaveAttribute('aria-invalid', 'true')

  await profile.locator('input[type=file]').setInputFiles({
    name: 'grande.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(600 * 1024),
  })
  await expect(profile.getByText('A imagem deve ter no máximo 512 KB')).toBeVisible()

  await profile.locator('input[type=file]').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: TINY_PNG,
  })
  await expect(profile.getByRole('img', { name: 'Pré-visualização do avatar' })).toBeVisible()

  await profile.getByLabel('Nome de usuário').fill('ana.kurio')
  await profile.getByLabel('Nome de exibição').fill('Ana Colecionadora')
  await profile.getByRole('button', { name: 'Salvar' }).click()
  await expect(app.toast('Perfil atualizado')).toBeVisible()

  await app.reload()
  await expect(profile.getByLabel('Nome de exibição')).toHaveValue('Ana Colecionadora')
  await expect(profile.getByRole('img', { name: 'Pré-visualização do avatar' })).toBeVisible()

  const password = page.getByRole('form', { name: 'Alterar senha' })
  await password.getByLabel('Senha atual').fill('errada123')
  await password.getByLabel(/^Nova senha/).fill('NovaSenha1')
  await password.getByLabel('Confirmar nova senha').fill('Diferente1')
  await password.getByRole('button', { name: 'Alterar senha' }).click()
  await expect(password.getByText('As senhas não coincidem')).toBeVisible()

  await password.getByLabel('Confirmar nova senha').fill('NovaSenha1')
  await password.getByRole('button', { name: 'Alterar senha' }).click()
  await expect(password.getByText('Senha atual incorreta')).toBeVisible()

  await password.getByLabel('Senha atual').fill('Kurio2026')
  await password.getByRole('button', { name: 'Alterar senha' }).click()
  await expect(app.toast('Senha alterada')).toBeVisible()
  await expect(password.getByLabel('Senha atual')).toHaveValue('')
})

test('cadastro e edição de carteiras com erros de validação', async ({ app, page }) => {
  await app.goto('/account/wallets')
  const primary = page.getByRole('form', { name: 'Carteira principal' })

  await primary.getByLabel('Endereço da carteira').fill('0x123')
  await primary.getByRole('button', { name: 'Salvar' }).click()
  await expect(
    primary.getByText('Informe um endereço 0x com 40 caracteres hexadecimais'),
  ).toBeVisible()

  await primary
    .getByLabel('Endereço da carteira')
    .fill('0xA91F3c5e7B2d4F6a8C0e1D3b5A7c9E2f4B6dE82C')
  await primary.getByLabel('Apelido da carteira').fill('Cofre principal')
  await primary.getByRole('button', { name: 'Salvar' }).click()
  await expect(app.toast('Carteira principal atualizada')).toBeVisible()

  await app.reload()
  await expect(primary.getByLabel('Apelido da carteira')).toHaveValue('Cofre principal')
})

test('cadastro de carteira secundária', async ({ app, page }) => {
  await app.goto('/')
  await page.evaluate(() => {
    window.localStorage.removeItem('kurio:session')
  })
  await app.loginViaApi('bruno')
  await app.goto('/account/wallets')

  const secondary = page.getByRole('form', { name: 'Carteira secundária' })
  await secondary.getByRole('button', { name: 'Adicionar' }).click()
  await expect(
    secondary.locator('[id$="-error"]', { hasText: 'Selecione a carteira' }),
  ).toBeVisible()
  await expect(secondary.locator('[id$="-error"]', { hasText: 'Selecione uma rede' })).toBeVisible()

  await secondary.getByLabel(/^Carteira/).click()
  await page.getByRole('option', { name: 'Phantom' }).click()
  await secondary.getByLabel('Rede').click()
  await page.getByRole('option', { name: 'Solana' }).click()
  await secondary.getByLabel('Apelido da carteira').fill('Reserva Solana')
  await secondary
    .getByLabel('Endereço da carteira')
    .fill('0x1111111111111111111111111111111111111111')
  await secondary.getByRole('button', { name: 'Adicionar' }).click()
  await expect(app.toast('Carteira secundária cadastrada')).toBeVisible()
  await expect(secondary.getByRole('button', { name: 'Salvar' })).toBeVisible()
})
