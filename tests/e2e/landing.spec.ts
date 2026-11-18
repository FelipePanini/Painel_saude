import { expect, test, type Page } from '@playwright/test'

// Landing page (/) e painel (/painel/), servidos pelo build com a CSP de produção.
// As capturas ficam em capturas/landing/ (fora do git).

/** O pedaço do build com o Three.js e o robô. Se ele não for pedido, o 3D não foi baixado. */
const ehOTresD = (url: string) => /\/assets\/(robo3d|three\.core)-/.test(url)

function vigiar(page: Page, origem: string) {
  const problemas: string[] = []
  const pedidos: string[] = []
  page.on('console', (m) => {
    // Aviso do driver gráfico do navegador de teste (WebGL por software). Não é erro da página.
    if (m.type() === 'warning' && m.text().includes('GL Driver Message')) return
    if (m.type() === 'error' || m.type() === 'warning') problemas.push(`console ${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => problemas.push(`erro: ${e.message}`))
  page.on('request', (r) => {
    pedidos.push(r.url())
    if (new URL(r.url()).origin !== origem && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) problemas.push(`requisição externa: ${r.url()}`)
  })
  return { problemas, pedidos }
}

const vidroPronto = (page: Page) => page.waitForFunction(() => document.documentElement.dataset.vidroPronto === 'sim')

test.describe('rede e CSP', () => {
  for (const caminho of ['/', '/painel/', '/componentes/']) {
    test(`${caminho}: nada sai para fora, CSP sem afrouxar e sem erros`, async ({ page, baseURL }) => {
      const { problemas } = vigiar(page, new URL(baseURL!).origin)
      const resposta = await page.goto(caminho)
      const csp = resposta?.headers()['content-security-policy'] ?? ''
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("connect-src 'self'")
      expect(csp).not.toContain('unsafe')
      await vidroPronto(page)
      await page.waitForLoadState('networkidle')
      expect(problemas).toEqual([])
    })
  }

  test('o painel não baixa nada da landing nem do 3D', async ({ page, baseURL }) => {
    const { pedidos } = vigiar(page, new URL(baseURL!).origin)
    await page.goto('/painel/')
    await vidroPronto(page)
    await page.waitForLoadState('networkidle')
    expect(pedidos.filter((url) => ehOTresD(url) || /\/assets\/landing-/.test(url))).toEqual([])
  })
})

test.describe('robô 3D', () => {
  test('com WebGL, o robô 3D entra no lugar do pôster e acena ao clicar', async ({ page, baseURL }) => {
    const { problemas, pedidos } = vigiar(page, new URL(baseURL!).origin)
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-robo', 'vivo', { timeout: 15000 })
    await expect(page.locator('.robo__canvas')).toHaveAttribute('aria-hidden', 'true')
    expect(pedidos.some(ehOTresD)).toBe(true)
    // O canvas ocupa o mesmo espaço do pôster: nada pula quando o 3D entra.
    const poster = await page.locator('.robo__poster').boundingBox()
    const canvas = await page.locator('.robo__canvas').boundingBox()
    expect(canvas).toEqual(poster)
    await page.locator('#robo').click()
    await page.waitForTimeout(300)
    expect(problemas).toEqual([])
  })

  test('sem WebGL, fica só o pôster e nada quebra', async ({ page, baseURL }) => {
    // Simula um navegador sem WebGL: getContext devolve null para webgl e webgl2.
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, tipo: string, ...resto: unknown[]) {
        if (tipo.includes('webgl')) return null
        return (original as (...args: unknown[]) => unknown).call(this, tipo, ...resto)
      } as typeof original
    })
    const { problemas, pedidos } = vigiar(page, new URL(baseURL!).origin)
    await page.goto('/')
    await vidroPronto(page)
    await page.waitForTimeout(500)
    await expect(page.locator('html')).toHaveAttribute('data-robo', 'poster')
    await expect(page.locator('html')).toHaveAttribute('data-vidro', 'css')
    await expect(page.locator('.robo__poster')).toBeVisible()
    expect(pedidos.some(ehOTresD)).toBe(false)
    expect(problemas).toEqual([])
  })

  test('com "reduzir movimento", o 3D nem é baixado', async ({ page, baseURL }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { problemas, pedidos } = vigiar(page, new URL(baseURL!).origin)
    await page.goto('/')
    await vidroPronto(page)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('html')).toHaveAttribute('data-robo', 'poster')
    expect(pedidos.some(ehOTresD)).toBe(false)
    // As formas do fundo e o pôster ficam parados.
    const animacao = await page.locator('.fundo-blur__forma--1').evaluate((e) => getComputedStyle(e).animationName)
    expect(animacao).toBe('none')
    expect(problemas).toEqual([])
  })

  test('a pausa para o 3D, continua depois de recarregar e pode ser desfeita', async ({ page, baseURL }) => {
    const { problemas, pedidos } = vigiar(page, new URL(baseURL!).origin)
    await page.goto('/')
    const botao = page.locator('#pausa')
    await expect(botao).toHaveText('Pausar animação')
    await botao.click()
    await expect(botao).toHaveText('Retomar animação')
    await expect(botao).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveAttribute('data-pausado', 'sim')

    // Depois de recarregar, continua pausado e o 3D não é baixado.
    pedidos.length = 0
    await page.reload()
    await vidroPronto(page)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#pausa')).toHaveText('Retomar animação')
    await expect(page.locator('html')).toHaveAttribute('data-robo', 'poster')
    expect(pedidos.some(ehOTresD)).toBe(false)
    const estadoDaAnimacao = await page.locator('.fundo-blur__forma--1').evaluate((e) => getComputedStyle(e).animationPlayState)
    expect(estadoDaAnimacao).toBe('paused')

    // Retomar traz o 3D de volta.
    await page.locator('#pausa').click()
    await expect(page.locator('html')).toHaveAttribute('data-robo', 'vivo', { timeout: 15000 })
    expect(problemas).toEqual([])
  })
})

test.describe('acessibilidade básica da landing', () => {
  test('uma h1, títulos em ordem, alvos de 44 px e tudo alcançável pelo teclado com foco visível', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await vidroPronto(page)

    await expect(page.locator('h1')).toHaveCount(1)
    const niveis = await page.locator('h1, h2, h3, h4').evaluateAll((titulos) => titulos.map((t) => Number(t.tagName[1])))
    for (let i = 1; i < niveis.length; i++) expect(niveis[i]! - niveis[i - 1]!, `título pulando de nível: ${niveis.join(', ')}`).toBeLessThanOrEqual(1)

    const interativos = page.locator('a[href], button')
    const total = await interativos.count()
    const alcancados = new Set<string>()
    for (let i = 0; i < total + 2; i++) {
      await page.keyboard.press('Tab')
      const focado = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null
        if (!e || e === document.body) return null
        const estilo = getComputedStyle(e)
        const caixa = e.getBoundingClientRect()
        return { id: e.outerHTML.slice(0, 80), contorno: estilo.outlineStyle, altura: caixa.height, largura: caixa.width }
      })
      if (!focado) continue
      alcancados.add(focado.id)
      expect(focado.contorno, `sem foco visível em ${focado.id}`).not.toBe('none')
      expect(focado.altura, `alvo menor que 44 px: ${focado.id}`).toBeGreaterThanOrEqual(44)
    }
    expect(alcancados.size, 'todos os links e botões precisam ser alcançáveis pelo teclado').toBe(total)
  })
})

test.describe('capturas da landing', () => {
  // Só no projeto "computador": as larguras são definidas aqui, uma a uma.
  // eslint-disable-next-line no-empty-pattern -- o Playwright exige o primeiro argumento desestruturado
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'computador', 'as capturas rodam uma vez só')
  })

  for (const largura of [375, 768, 1280, 1440]) {
    for (const tema of ['light', 'dark'] as const) {
      test(`${largura} px, tema ${tema === 'light' ? 'claro' : 'escuro'}`, async ({ page }) => {
        await page.setViewportSize({ width: largura, height: largura < 768 ? 812 : 900 })
        await page.emulateMedia({ colorScheme: tema })
        await page.goto('/')
        await expect(page.locator('html')).toHaveAttribute('data-robo', 'vivo', { timeout: 15000 })
        await vidroPronto(page)
        await page.waitForTimeout(600)
        const nome = `capturas/landing/${largura}-${tema === 'light' ? 'claro' : 'escuro'}`
        await page.screenshot({ path: `${nome}-dobra.png` })
        await page.screenshot({ path: `${nome}-pagina.png`, fullPage: true })
      })
    }
  }
})
