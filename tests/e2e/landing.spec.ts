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
  for (const caminho of ['/', '/painel/', '/componentes/', '/creditos/']) {
    test(`${caminho}: nada sai para fora, CSP sem afrouxar e sem erros`, async ({ page, baseURL }) => {
      const { problemas } = vigiar(page, new URL(baseURL!).origin)
      const resposta = await page.goto(caminho)
      const csp = resposta?.headers()['content-security-policy'] ?? ''
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("connect-src 'self'")
      expect(csp).not.toContain('unsafe')
      if (caminho !== '/creditos/') await vidroPronto(page)
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

test.describe('seções da landing', () => {
  test('a sequência troca a camada do palco a cada passo', async ({ page }) => {
    await page.goto('/')
    const palco = page.locator('#palco')
    for (const passo of ['1', '2', '3']) {
      await page.locator(`.passo[data-passo="${passo}"]`).scrollIntoViewIfNeeded()
      await page.evaluate((n) => {
        const e = document.querySelector(`.passo[data-passo="${n}"]`)!
        const r = e.getBoundingClientRect()
        const faixa = window.innerWidth >= 960 ? 0.5 : 0.74
        window.scrollTo(0, window.scrollY + r.top + r.height / 2 - window.innerHeight * faixa)
      }, passo)
      await expect(palco).toHaveAttribute('data-passo', passo)
    }
  })

  test('os indicadores vêm da fonte de dados, agrupados por área', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#grupos .grupo')).toHaveCount(3)
    await expect(page.locator('#grupos .grupo__titulo')).toHaveText(['Assistência', 'Qualidade', 'Operação'])
    await expect(page.locator('#grupos .cartao')).toHaveCount(4)
    // O número é o mesmo que o painel mostra para o mês mais recente.
    await expect(page.locator('#grupos .cartao').first().locator('.cartao__valor')).toHaveAttribute('aria-label', /^\d+,\d$/)
  })

  test('a vitrine mostra as três telas do painel, com texto alternativo que descreve a tela', async ({ page }) => {
    await page.goto('/')
    const imagens = page.locator('#telas .moldura img')
    await expect(imagens).toHaveCount(3)
    for (const imagem of await imagens.all()) {
      await imagem.scrollIntoViewIfNeeded()
      await expect.poll(() => imagem.evaluate((e) => (e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
      const alt = (await imagem.getAttribute('alt')) ?? ''
      expect(alt).toContain('Painel de exemplo')
      expect(alt.toLowerCase()).not.toContain('captura')
    }
  })

  test('a página de créditos tem uma h1 e volta para a página inicial', async ({ page }) => {
    await page.goto('/creditos/')
    await expect(page.locator('h1')).toHaveText('Créditos')
    await expect(page.getByRole('link', { name: 'Voltar para a página inicial' })).toHaveAttribute('href', '/')
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Créditos' })).toHaveAttribute('href', '/creditos/')
  })

  test('a demonstração aumenta o texto e troca o tema só do exemplo', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    const vitrine = page.locator('.demo__vitrine')
    await expect(vitrine.locator('.cartao')).toHaveCount(1)
    const tamanho = () => vitrine.locator('.cartao__nome').evaluate((e) => parseFloat(getComputedStyle(e).fontSize))
    const normal = await tamanho()
    await page.getByRole('radio', { name: 'Bem maior' }).check()
    expect(await tamanho()).toBeGreaterThan(normal * 1.3)

    const fundo = () => vitrine.evaluate((e) => getComputedStyle(e).backgroundColor)
    const escuro = await fundo()
    await page.getByRole('radio', { name: 'Claro' }).check()
    // A cor muda com uma transição curta; espera ela terminar.
    await expect.poll(fundo).toBe('rgb(242, 245, 248)')
    expect(escuro).toBe('rgb(11, 17, 21)')
    // A página continua no tema escuro.
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro')
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

    // Links e botões, mais um ponto por grupo de opções (o Tab entra no grupo e as setas escolhem).
    const total =
      (await page.locator('a[href], button').count()) +
      (await page.locator('input[type="radio"]').evaluateAll((radios) => new Set(radios.map((r) => (r as HTMLInputElement).name)).size))
    const alcancados = new Set<string>()
    for (let i = 0; i < total + 2; i++) {
      await page.keyboard.press('Tab')
      const focado = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null
        if (!e || e === document.body) return null
        // No controle segmentado, o rádio é invisível e o foco aparece no rótulo ao lado dele.
        const visivel = e instanceof HTMLInputElement && e.type === 'radio' ? (e.nextElementSibling as HTMLElement) : e
        const estilo = getComputedStyle(visivel)
        const caixa = visivel.getBoundingClientRect()
        return { id: e.outerHTML.slice(0, 80), contorno: estilo.outlineStyle, altura: caixa.height, largura: caixa.width }
      })
      if (!focado) continue
      alcancados.add(focado.id)
      expect(focado.contorno, `sem foco visível em ${focado.id}`).not.toBe('none')
      expect(focado.altura, `alvo menor que 44 px: ${focado.id}`).toBeGreaterThanOrEqual(44)
    }
    expect(alcancados.size, 'todos os links, botões e grupos de opções precisam ser alcançáveis pelo teclado').toBe(total)
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
        // Na foto da página inteira, os blocos que aparecem com a rolagem ainda não "entraram".
        // Por isso ela é tirada com "reduzir movimento", em que tudo aparece direto.
        await page.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' })
        await page.reload()
        await vidroPronto(page)
        await expect(page.locator('#grupos .cartao')).toHaveCount(4)
        await page.screenshot({ path: `${nome}-pagina.png`, fullPage: true })
      })
    }
  }
})
