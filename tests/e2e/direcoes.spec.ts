import { expect, test, type Page } from '@playwright/test'

// Galeria da fase 1: as duas direções visuais, servidas pelo build com a CSP de produção.
// As capturas ficam em test-results/direcoes/ (fora do git).

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

for (const direcao of ['a', 'b'] as const) {
  for (const tema of ['claro', 'escuro'] as const) {
    test(`direção ${direcao}, tema ${tema}: painel sem erros`, async ({ page, baseURL }, info) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const problemas = vigiar(page, new URL(baseURL!).origin)
      await page.goto(`/componentes/?direcao=${direcao}&tema=${tema}&vidro=css&limpo=1`)
      await pronto(page)

      await expect(page.locator('#painel')).toHaveAttribute('data-direcao', direcao)
      await expect(page.locator(direcao === 'a' ? '.cartao' : '.linha')).toHaveCount(4)
      const rolagemHorizontal = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(rolagemHorizontal, 'a página não pode rolar para o lado').toBe(false)

      // Duas capturas: a tela como a pessoa vê ao abrir, e a página inteira.
      // Na página inteira, a navegação de baixo é escondida, porque ela é fixa e sairia no meio da imagem.
      await page.screenshot({ path: `test-results/direcoes/${info.project.name}-${direcao}-${tema}-tela.png` })
      await page.evaluate(() => {
        for (const e of document.querySelectorAll<HTMLElement>('.barra-abas, .botao-flutuante, .faixa--base')) e.style.display = 'none'
      })
      await page.screenshot({ path: `test-results/direcoes/${info.project.name}-${direcao}-${tema}-pagina.png`, fullPage: true })
      expect(problemas).toEqual([])
    })
  }

  for (const vidro of ['vidro', 'css', 'solida'] as const) {
    test(`direção ${direcao}: navegação na aparência "${vidro}"`, async ({ page, baseURL }, info) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const problemas = vigiar(page, new URL(baseURL!).origin)
      await page.goto(`/componentes/?direcao=${direcao}&tema=claro&vidro=${vidro}&limpo=1`)
      await pronto(page)
      await page.waitForTimeout(400)

      await expect(page.locator('.barra-topo')).toBeVisible()
      await page.screenshot({ path: `test-results/direcoes/${info.project.name}-${direcao}-nav-${vidro}.png` })
      // Registra qual aparência ficou valendo: sem WebGL, "vidro" cai para "css".
      info.annotations.push({ type: 'aparência em uso', description: (await page.locator('html').getAttribute('data-vidro')) ?? '' })
      expect(problemas).toEqual([])
    })
  }
}

// Os outros testes rodam com "reduzir movimento", para as capturas saírem estáveis.
// Este roda com as animações ligadas, que é como a maioria das pessoas vai ver.
test('com as animações ligadas, o painel abre e troca de mês sem erros', async ({ page, baseURL }) => {
  const problemas = vigiar(page, new URL(baseURL!).origin)
  await page.goto('/componentes/?direcao=a&vidro=css')
  await pronto(page)
  await page.locator('#filtro-mes').selectOption('2026-06')
  await expect(page.locator('.cartao--destaque .cartao__valor')).toHaveAttribute('aria-label', /\d/)
  await page.waitForTimeout(500)
  expect(problemas).toEqual([])
})

test('os filtros mudam os números na hora', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/componentes/?direcao=a&vidro=css')
  await pronto(page)
  const titulo = page.locator('.painel__titulo')
  await expect(titulo).toHaveText('Outubro de 2026')
  await page.locator('#filtro-mes').selectOption('2026-03')
  await expect(titulo).toHaveText('Março de 2026')
  await page.locator('#filtro-setor').selectOption('pronto-socorro')
  // O Pronto-Socorro não tem dados de março: estado "dados insuficientes".
  await expect(page.locator('.cartao--destaque .cartao__valor')).toHaveText('—')
})

test('a comparação mostra as duas direções lado a lado', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/componentes/?vidro=css')
  await pronto(page)
  await expect(page.locator('.amostra')).toHaveCount(2)
  await page.locator('.controles').screenshot({ path: `test-results/direcoes/${info.project.name}-comparacao.png` })
})
