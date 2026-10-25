import { expect, test, type Page } from '@playwright/test'

// Protótipo das entrevistas, servido pelo build com a CSP de produção.
// As capturas ficam em test-results/capturas/ (fora do git).

function vigiar(page: Page, origem: string) {
  const problemas: string[] = []
  page.on('console', (m) => m.type() === 'error' && problemas.push(`console: ${m.text()}`))
  page.on('pageerror', (e) => problemas.push(`erro: ${e.message}`))
  page.on('request', (r) => new URL(r.url()).origin !== origem && problemas.push(`requisição externa: ${r.url()}`))
  return problemas
}

for (const aba of ['plantonista', 'enfermagem'] as const) {
  test(`protótipo, aba ${aba}: cartões, frases e gráficos sem erros`, async ({ page, baseURL }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const problemas = vigiar(page, new URL(baseURL!).origin)

    const resposta = await page.goto(`/prototipo/#${aba}`)
    expect(resposta?.headers()['content-security-policy']).toContain("connect-src 'self'")

    const painel = page.getByRole('tabpanel')
    await expect(page.getByRole('tab', { selected: true })).toHaveAttribute('id', `aba-${aba}`)
    await expect(painel.locator('.cartao')).toHaveCount(4)
    await expect(painel.locator('.mudancas__lista li')).toHaveCount(3)
    await expect(painel.getByRole('img')).toHaveCount(2)

    for (const canvas of await painel.locator('canvas').all()) {
      const caixa = await canvas.boundingBox()
      expect(caixa?.width).toBeGreaterThan(100)
      expect(caixa?.height).toBeGreaterThan(100)
    }

    const rolagemHorizontal = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(rolagemHorizontal, 'a página não pode rolar para o lado').toBe(false)

    await page.screenshot({ path: `test-results/capturas/${info.project.name}-${aba}-claro.png`, fullPage: true })
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    await page.waitForTimeout(100)
    await page.screenshot({ path: `test-results/capturas/${info.project.name}-${aba}-escuro.png`, fullPage: true })

    expect(problemas).toEqual([])
  })
}

test('protótipo: as setas do teclado trocam de aba', async ({ page }) => {
  await page.goto('/prototipo/')
  await page.getByRole('tab', { name: 'Plantonista' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Enfermagem' })).toBeFocused()
  await expect(page.getByRole('tab', { selected: true })).toHaveText('Enfermagem')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Indicadores da unidade')
})
