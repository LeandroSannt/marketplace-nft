import type { Page } from '@playwright/test'
import { expect } from './fixtures'

export function paymentSummary(page: Page) {
  return page.getByRole('complementary', { name: 'Resumo do pagamento' })
}

export async function reachReview(page: Page) {
  await expect(page.getByRole('heading', { name: 'Pagamento com carteira' })).toBeVisible()
  await expect(paymentSummary(page).getByRole('list', { name: 'Itens do pedido' })).toBeVisible()
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByText('Carteira conectada')).toBeVisible()
  await page.getByRole('button', { name: 'Revisar pedido' }).click()
  await expect(page.getByRole('heading', { name: /Revise seu pedido/ })).toBeVisible()
}

export function confirmButton(page: Page) {
  return page.getByRole('button', { name: /Confirmar compra|Enviando pedido/ })
}
