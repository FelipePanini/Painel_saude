import { expect, test } from '@playwright/test'

test('a página inicial abre com a CSP de produção e sem erros', async ({ page, baseURL }) => {
  const erros: string[] = []
  const origensExternas: string[] = []
  page.on('console', (mensagem) => {
    if (mensagem.type() === 'error') erros.push(mensagem.text())
  })
  page.on('pageerror', (erro) => erros.push(erro.message))
  page.on('request', (requisicao) => {
    if (new URL(requisicao.url()).origin !== new URL(baseURL!).origin) origensExternas.push(requisicao.url())
  })

  const resposta = await page.goto('/')
  const csp = resposta?.headers()['content-security-policy'] ?? ''
  expect(csp).toContain("connect-src 'self'")
  expect(resposta?.headers()['x-content-type-options']).toBe('nosniff')

  await expect(page).toHaveTitle('Painel Saúde')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.waitForLoadState('networkidle')

  expect(erros, 'erros no console (inclui violações de CSP)').toEqual([])
  expect(origensExternas, 'requisições para outras origens').toEqual([])
})
