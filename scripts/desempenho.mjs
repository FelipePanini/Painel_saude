// npm run desempenho: mede a landing como um celular médio a veria.
// Processador 4x mais lento e rede 4G rápida, sobre o build (`vite preview`).
// Mede o LCP (quando a maior imagem ou texto da primeira tela aparece), o CLS (quanto o layout pula)
// e quanto JavaScript a primeira tela baixa, com e sem o 3D. Compara com o orçamento do briefing.
import { spawn } from 'node:child_process'
import { chromium, devices } from '@playwright/test'

const PORTA = 4182
const ORIGEM = `http://localhost:${PORTA}`
const ORCAMENTO = { lcpMs: 2500, cls: 0.1, jsInicialKb: 80 }

async function esperarServidor() {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(ORIGEM)).ok) return
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error('O vite preview não respondeu. Rode `npm run build` e tente de novo.')
}

async function medir(navegador, { reduzirMovimento }) {
  const contexto = await navegador.newContext({ ...devices['Pixel 7'], reducedMotion: reduzirMovimento ? 'reduce' : 'no-preference' })
  const pagina = await contexto.newPage()
  const cdp = await contexto.newCDPSession(pagina)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  // "4G rápida": 9 Mbit/s para baixar, 1,5 Mbit/s para subir, 40 ms de latência.
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 })

  const bytesJs = { inicial: 0, tresD: 0 }
  cdp.on('Network.loadingFinished', () => {})
  const respostas = new Map()
  cdp.on('Network.responseReceived', (e) => respostas.set(e.requestId, e.response.url))
  cdp.on('Network.loadingFinished', (e) => {
    const url = respostas.get(e.requestId) ?? ''
    if (!url.endsWith('.js')) return
    if (/\/assets\/(robo3d|three\.core|GLTFLoader)-/.test(url)) bytesJs.tresD += e.encodedDataLength
    else bytesJs.inicial += e.encodedDataLength
  })

  await pagina.addInitScript(() => {
    window.__medidas = { lcp: 0, cls: 0 }
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries()) window.__medidas.lcp = e.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries()) if (!e.hadRecentInput) window.__medidas.cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  })

  await pagina.goto(ORIGEM, { waitUntil: 'load' })
  // Espera o 3D entrar (ou desistir) e a página assentar.
  await pagina.waitForFunction(() => document.documentElement.dataset.robo !== 'carregando', null, { timeout: 30000 })
  await pagina.waitForTimeout(3000)
  const medidas = await pagina.evaluate(() => ({ ...window.__medidas, robo: document.documentElement.dataset.robo }))
  await contexto.close()
  return { ...medidas, jsInicialKb: bytesJs.inicial / 1024, jsTresDKb: bytesJs.tresD / 1024 }
}

const servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--strictPort'], { stdio: 'ignore' })
let navegador
let falhou = false
try {
  await esperarServidor()
  navegador = await chromium.launch()
  for (const reduzirMovimento of [false, true]) {
    const m = await medir(navegador, { reduzirMovimento })
    const linha = (nome, valor, limite, unidade, ok) => console.log(`  ${ok ? 'ok  ' : 'FORA'} ${nome}: ${valor}${unidade} (orçamento: ${limite}${unidade})`)
    console.log(reduzirMovimento ? '\nCom "reduzir movimento":' : 'Celular médio (CPU 4x mais lenta, 4G rápida):')
    console.log(`  robô: ${m.robo}`)
    linha('LCP', Math.round(m.lcp), ORCAMENTO.lcpMs, ' ms', m.lcp <= ORCAMENTO.lcpMs)
    linha('CLS', m.cls.toFixed(3), ORCAMENTO.cls, '', m.cls < ORCAMENTO.cls)
    linha('JavaScript inicial, sem o 3D', m.jsInicialKb.toFixed(1), ORCAMENTO.jsInicialKb, ' KB', m.jsInicialKb <= ORCAMENTO.jsInicialKb)
    console.log(`       JavaScript do 3D, baixado depois: ${m.jsTresDKb.toFixed(1)} KB`)
    falhou ||= m.lcp > ORCAMENTO.lcpMs || m.cls >= ORCAMENTO.cls || m.jsInicialKb > ORCAMENTO.jsInicialKb
  }
} finally {
  await navegador?.close()
  servidor.kill()
}
process.exit(falhou ? 1 : 0)
