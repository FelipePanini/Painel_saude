// npm run vitrine: tira capturas do painel (/painel/) para a vitrine da landing.
//
// 1. Sobe o build com `vite preview` (o `npm run vitrine` roda o build antes).
// 2. Abre o painel em três formatos (computador, tablet e celular), nos temas claro e escuro, em 2x.
// 3. Confere que os dados carregados são fictícios (marcador ZZ-FICTICIO). Se não forem, para com erro:
//    nenhuma imagem pública pode mostrar dado real.
// 4. Converte cada captura para WebP, no navegador, em dois tamanhos (1x e 2x).
// 5. Salva as imagens em public/vitrine/ e a lista em src/landing/vitrine.json, com o texto alternativo.
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const PORTA = 4181
const ORIGEM = `http://localhost:${PORTA}`
const PASTA = 'public/vitrine'
const formatos = [
  { formato: 'computador', largura: 1280, altura: 800 },
  { formato: 'tablet', largura: 768, altura: 1024 },
  { formato: 'celular', largura: 390, altura: 844 },
]
const temas = [
  { tema: 'claro', esquema: 'light' },
  { tema: 'escuro', esquema: 'dark' },
]

async function esperarServidor() {
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    try {
      const resposta = await fetch(`${ORIGEM}/painel/`)
      if (resposta.ok) return
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error('O vite preview não respondeu. Rode `npm run build` e tente de novo.')
}

const servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--strictPort'], { stdio: 'ignore' })
let navegador
try {
  await esperarServidor()
  mkdirSync(PASTA, { recursive: true })
  navegador = await chromium.launch()
  const conversor = await navegador.newPage()
  const telas = []

  for (const { formato, largura, altura } of formatos) {
    const tela = { formato, largura, altura, alt: '', imagens: {} }
    for (const { tema, esquema } of temas) {
      const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: 2, colorScheme: esquema, reducedMotion: 'reduce' })
      const pagina = await contexto.newPage()
      await pagina.goto(`${ORIGEM}/painel/`)
      await pagina.waitForFunction(() => document.documentElement.dataset.vidroPronto === 'sim')
      const marcador = await pagina.evaluate(() => document.documentElement.dataset.marcadorDeDados)
      if (marcador !== 'ZZ-FICTICIO') throw new Error(`Os dados do painel não estão marcados como fictícios (marcador: ${marcador ?? 'nenhum'}). Nenhuma captura foi salva.`)
      await pagina.waitForTimeout(400)

      // Texto alternativo a partir do que a tela mostra, não "captura de tela".
      tela.alt = await pagina.evaluate(() => {
        const destaque = document.querySelector('.cartao--destaque')
        const nome = destaque?.querySelector('.cartao__nome')?.textContent ?? ''
        const valor = destaque?.querySelector('.cartao__valor')?.getAttribute('aria-label') ?? ''
        const selo = destaque?.querySelector('.selo span')?.textContent ?? ''
        const periodo = document.querySelector('.visao-geral__periodo')?.textContent?.split(' · ')[0] ?? ''
        return `Painel de exemplo de ${periodo.toLowerCase()}: ${nome.toLowerCase()} em ${valor}${selo ? `, ${selo.toLowerCase()}` : ''}, com o gráfico dos últimos 12 meses e os outros indicadores ao lado.`
      })

      const png = await pagina.screenshot()
      await contexto.close()

      // Conversão para WebP no próprio navegador (canvas), em 1x e 2x.
      const arquivos = await conversor.evaluate(
        async ({ base64, largura }) => {
          const imagem = new Image()
          imagem.src = `data:image/png;base64,${base64}`
          await imagem.decode()
          const saida = {}
          for (const escala of [1, 2]) {
            const canvas = document.createElement('canvas')
            canvas.width = largura * escala
            canvas.height = Math.round((imagem.height * largura * escala) / imagem.width)
            const ctx = canvas.getContext('2d')
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height)
            saida[`${escala}x`] = canvas.toDataURL('image/webp', 0.82).split(',')[1]
          }
          return saida
        },
        { base64: png.toString('base64'), largura },
      )
      tela.imagens[tema] = {}
      for (const [escala, base64] of Object.entries(arquivos)) {
        const nome = `${formato}-${tema}-${escala}.webp`
        writeFileSync(`${PASTA}/${nome}`, Buffer.from(base64, 'base64'))
        tela.imagens[tema][escala] = `/vitrine/${nome}`
      }
      console.log(`  ${formato}, ${tema}: ok`)
    }
    telas.push(tela)
  }

  writeFileSync('src/landing/vitrine.json', `${JSON.stringify({ gerado: new Date().toISOString().slice(0, 10), telas }, null, 2)}\n`)
  console.log(`Vitrine pronta: ${telas.length * temas.length * 2} imagens em ${PASTA}/ e a lista em src/landing/vitrine.json.`)
} finally {
  await navegador?.close()
  servidor.kill()
}
