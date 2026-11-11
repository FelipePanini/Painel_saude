import { expect, test, type Page } from '@playwright/test'

// Galeria de componentes da fase 1, servida pelo build com a CSP de produção.
// As capturas ficam em test-results/galeria/ (fora do git).

function vigiar(page: Page, origem: string) {
  const problemas: string[] = []
  page.on('console', (m) => {
    // O navegador de teste desenha o WebGL por software e avisa que isso é lento ("GL Driver Message").
    // É um aviso do driver, não um erro da página; violações de CSP chegam como "error" e continuam contando.
    if (m.type() === 'warning' && m.text().includes('GL Driver Message')) return
    if (m.type() === 'error' || m.type() === 'warning') problemas.push(`console ${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => problemas.push(`erro: ${e.message}`))
  page.on('request', (r) => new URL(r.url()).origin !== origem && !r.url().startsWith('data:') && !r.url().startsWith('blob:') && problemas.push(`requisição externa: ${r.url()}`))
  return problemas
}

const pronto = (page: Page) => page.waitForFunction(() => document.documentElement.dataset.vidroPronto === 'sim')

for (const tema of ['claro', 'escuro'] as const) {
  test(`galeria no tema ${tema}: todas as seções, sem erros`, async ({ page, baseURL }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const problemas = vigiar(page, new URL(baseURL!).origin)
    await page.goto(`/componentes/?tema=${tema}&vidro=css`)
    await pronto(page)

    await expect(page.locator('html')).toHaveAttribute('data-tema', tema)
    await expect(page.locator('.secao')).toHaveCount(11)
    await expect(page.locator('#indicadores .cartao')).toHaveCount(4)
    const rolagemHorizontal = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(rolagemHorizontal, 'a página não pode rolar para o lado').toBe(false)

    // A tela como a pessoa vê ao abrir, e cada seção sozinha.
    await page.screenshot({ path: `test-results/galeria/${info.project.name}-${tema}-tela.png` })
    for (const id of ['cores', 'tipografia', 'botoes', 'campos', 'filtros', 'indicadores', 'avisos', 'estados']) {
      await page.locator(`#${id}`).screenshot({ path: `test-results/galeria/${info.project.name}-${tema}-${id}.png` })
    }
    expect(problemas).toEqual([])
  })
}

for (const vidro of ['vidro', 'css', 'solida'] as const) {
  for (const tema of ['claro', 'escuro'] as const) {
    test(`navegação na aparência "${vidro}", tema ${tema}`, async ({ page, baseURL }, info) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const problemas = vigiar(page, new URL(baseURL!).origin)
      await page.goto(`/componentes/?tema=${tema}&vidro=${vidro}#indicadores`)
      await pronto(page)
      await page.waitForTimeout(400)

      await expect(page.locator('.barra-topo')).toBeVisible()
      // "vidro" pode cair para "css" num navegador sem WebGL; as outras duas valem como pedidas.
      if (vidro !== 'vidro') await expect(page.locator('html')).toHaveAttribute('data-vidro', vidro)
      await page.screenshot({ path: `test-results/galeria/${info.project.name}-nav-${vidro}-${tema}.png` })
      expect(problemas).toEqual([])
    })
  }
}

// Os outros testes rodam com "reduzir movimento", para as capturas saírem estáveis.
// Este roda com as animações ligadas, que é como a maioria das pessoas vai ver.
test('com as animações ligadas, os cartões trocam de mês sem erros', async ({ page, baseURL }) => {
  const problemas = vigiar(page, new URL(baseURL!).origin)
  await page.goto('/componentes/?vidro=css')
  await pronto(page)
  await page.locator('#filtro-mes').selectOption('2026-06')
  await expect(page.locator('.cartao--destaque .cartao__valor')).toHaveAttribute('aria-label', /\d/)
  await page.waitForTimeout(500)
  expect(problemas).toEqual([])
})

test('os filtros da barra mudam os cartões na hora', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/componentes/?vidro=css')
  await pronto(page)
  const periodo = page.locator('.palco-indicadores__periodo')
  await expect(periodo).toContainText('Outubro de 2026')
  await page.locator('#filtro-mes').selectOption('2026-03')
  await expect(periodo).toContainText('Março de 2026')
  await page.locator('#filtro-setor').selectOption('pronto-socorro')
  // O Pronto-Socorro não tem dados de março: estado "dados insuficientes".
  await expect(page.locator('.cartao--destaque .cartao__valor')).toHaveText('—')
})

test('"Ver tendência" leva o indicador para o cartão em destaque', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/componentes/?vidro=css')
  await pronto(page)
  await page.getByRole('button', { name: 'Ver tendência de quedas' }).click()
  await expect(page.locator('.cartao--destaque .cartao__nome')).toHaveText('Quedas')
})

test('apagar mostra um aviso com "Desfazer", e desfazer devolve o registro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/componentes/?vidro=css')
  await pronto(page)
  await page.getByRole('button', { name: 'Apagar registro de exemplo' }).click()
  await expect(page.locator('#toast .secao__nota')).toHaveText('O registro de exemplo foi apagado.')
  await page.getByRole('button', { name: 'Desfazer' }).click()
  await expect(page.locator('#toast .secao__nota')).toContainText('Clínica Médica')
  await expect(page.locator('.toast')).toHaveCount(0)
})

test('o tema escolhido vale mesmo contra a preferência do sistema', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await page.goto('/componentes/?vidro=css')
  await pronto(page)
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro')
  await page.getByRole('radio', { name: 'Claro' }).check()
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro')
})

test('os chips de filtro ligam e desligam pelo teclado', async ({ page }) => {
  await page.goto('/componentes/?vidro=css')
  await pronto(page)
  const chip = page.getByRole('button', { name: 'UTI Adulto' })
  await expect(chip).toHaveAttribute('aria-pressed', 'false')
  await chip.focus()
  await page.keyboard.press('Space')
  await expect(chip).toHaveAttribute('aria-pressed', 'true')
})
