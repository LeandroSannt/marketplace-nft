import type { Page } from '@playwright/test'
import { expect, test, USERS } from './support/fixtures'

async function login(page: Page, email: string, password: string) {
  const dialog = page.getByRole('dialog', { name: 'Entrar' })
  await dialog.getByLabel('E-mail').fill(email)
  await dialog.getByLabel('Senha', { exact: true }).fill(password)
  await dialog.getByRole('button', { name: 'Entrar' }).click()
}

async function logout(page: Page) {
  await page.getByRole('button', { name: /Menu da conta/ }).click()
  await page.getByRole('menuitem', { name: 'Sair' }).click()
  await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
}

test('cadastro com conflito e criação de conta', async ({ app, page, isMobile }) => {
  test.skip(isMobile, 'Modal de autenticação do desktop; o mobile é coberto abaixo')
  await app.goto('/register')
  const dialog = page.getByRole('dialog', { name: 'Criar perfil de colecionador' })

  await dialog.getByLabel('Nome de usuário').fill('ana.kurio')
  await dialog.getByLabel('E-mail').fill(USERS.ana.email)
  await dialog.getByLabel('Senha', { exact: true }).fill('Segura123')
  await dialog.getByLabel('Confirmar senha').fill('Segura123')
  await dialog.getByRole('button', { name: 'Criar perfil' }).click()
  await expect(dialog.getByText('Este nome de usuário já está em uso')).toBeVisible()
  await expect(dialog.getByText('Este e-mail já está cadastrado')).toBeVisible()
  await expect(dialog.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')

  await dialog.getByLabel('Nome de usuário').fill('novo.colecionador')
  await dialog.getByLabel('E-mail').fill('novo@kurio.dev')
  await dialog.getByRole('button', { name: 'Criar perfil' }).click()
  await expect(
    page.getByRole('button', { name: 'Menu da conta de novo.colecionador' }),
  ).toBeVisible()
})

test('login, expiração de sessão, logout e troca de usuário', async ({ app, page, isMobile }) => {
  test.skip(isMobile, 'Menu da conta do desktop; o mobile é coberto abaixo')
  await app.goto('/login')
  await login(page, USERS.ana.email, 'senhaerrada1')
  await expect(
    page.getByRole('alert').filter({ hasText: 'E-mail ou senha incorretos' }),
  ).toBeVisible()

  await login(page, USERS.ana.email, USERS.ana.password)
  await expect(
    page.getByRole('button', { name: `Menu da conta de ${USERS.ana.name}` }),
  ).toBeVisible()

  await app.expireSessions()
  await page.getByRole('button', { name: /Menu da conta/ }).click()
  await page.getByRole('menuitem', { name: 'Perfil do colecionador' }).click()
  await expect(page).toHaveURL(/\/login\?redirect=%2Faccount%2Fprofile/)
  await expect(app.toast('Sua sessão expirou')).toBeVisible()

  await login(page, USERS.ana.email, USERS.ana.password)
  await expect(page).toHaveURL(/\/account\/profile$/)
  await expect(page.getByLabel('Nome de exibição')).toHaveValue(USERS.ana.name)

  await logout(page)
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('kurio:session')))
    .toBeNull()

  await app.goto('/login?redirect=/account/profile')
  await login(page, USERS.bruno.email, USERS.bruno.password)
  await expect(page.getByLabel('Nome de exibição')).toHaveValue(USERS.bruno.name)
  await expect(
    page.getByRole('button', { name: `Menu da conta de ${USERS.bruno.name}` }),
  ).toBeVisible()
  await expect(page.getByText(USERS.ana.name)).toHaveCount(0)
})

test('rotas privadas redirecionam para o login preservando o destino', async ({
  app,
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Coberto no mobile pelo teste de login abaixo')
  await app.goto('/account/wallets')
  await expect(page).toHaveURL(/\/login\?redirect=%2Faccount%2Fwallets/)
  await login(page, USERS.ana.email, USERS.ana.password)
  await expect(page).toHaveURL(/\/account\/wallets$/)
})

test('mobile: login com validação, retorno ao fluxo e logout pela conta', async ({
  app,
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Tela de login mobile')
  await app.goto('/account/profile')
  await expect(page).toHaveURL(/\/login\?redirect=%2Faccount%2Fprofile/)

  const form = page.getByRole('main')
  await form.getByRole('button', { name: 'Entrar' }).click()
  await expect(form.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')

  await form.getByLabel('E-mail').fill(USERS.bruno.email)
  await form.getByLabel('Senha', { exact: true }).fill(USERS.bruno.password)
  await form.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/account\/profile$/)
  await expect(page.getByLabel('Nome de exibição')).toHaveValue(USERS.bruno.name)

  await page.getByRole('button', { name: 'Sair' }).click()
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('kurio:session')))
    .toBeNull()
  await app.goto('/account/profile')
  await expect(page).toHaveURL(/\/login/)
})
