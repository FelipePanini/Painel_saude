// Decide se o robô vira 3D ou fica no pôster, e cuida do ciclo de vida da cena.
//
// O 3D só é baixado quando tudo isto vale:
//   - a primeira dobra está a uma tela de distância;
//   - o navegador tem WebGL;
//   - "reduzir movimento" está desligado no sistema;
//   - a pessoa não pausou a animação;
//   - o aparelho não pede economia (modo de economia de dados, pouca memória ou poucos núcleos).
// Em qualquer outro caso, o pôster fica, e nada quebra.
//
// O estado fica em <html data-robo="poster|carregando|vivo"> (os testes leem isso).
import type { Robo } from './robo3d'

// Definido pelo vite.config.ts: true quando existe public/3d/robo.glb.
declare const __ROBO_GLB__: boolean

type Estado = 'poster' | 'carregando' | 'vivo'

const html = document.documentElement
const definirEstado = (estado: Estado) => {
  html.dataset.robo = estado
}

function temWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

interface Navegador extends Navigator {
  connection?: { saveData?: boolean }
  deviceMemory?: number
}

function aparelhoPedeEconomia() {
  const nav = navigator as Navegador
  return Boolean(nav.connection?.saveData) || (nav.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4
}

export const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)')

/** Por que o robô fica no pôster, ou null se o 3D pode entrar. Útil para depurar. */
export function motivoParaFicarNoPoster(pausado: boolean): string | null {
  if (reduzirMovimento.matches) return 'reduzir movimento ligado'
  if (pausado) return 'animação pausada'
  if (!temWebGL()) return 'sem WebGL'
  if (aparelhoPedeEconomia()) return 'aparelho pede economia'
  return null
}

export function iniciarRobo(caixa: HTMLElement, estaPausado: () => boolean) {
  let robo: Robo | null = null
  let carregando: Promise<void> | null = null
  let naTela = false

  definirEstado('poster')

  const atualizar = () => {
    if (!robo) return
    if (naTela && !estaPausado() && document.visibilityState === 'visible') robo.tocar()
    else robo.parar()
  }

  async function carregar() {
    if (robo || carregando) return
    if (motivoParaFicarNoPoster(estaPausado())) return
    definirEstado('carregando')
    carregando = (async () => {
      try {
        const { criarRobo } = await import('./robo3d')
        robo = await criarRobo(caixa, { arquivo: __ROBO_GLB__ ? '/3d/robo.glb' : null })
        caixa.append(robo.canvas)
        // O canvas aparece por cima do pôster com um fade (ver landing.css). O espaço é o mesmo, sem pulo.
        requestAnimationFrame(() => definirEstado('vivo'))
        atualizar()
      } catch (erro) {
        robo = null
        definirEstado('poster')
        // Só no modo de desenvolvimento, e só sobre o 3D: nenhum dado de usuário passa por aqui.
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.warn('O robô 3D não carregou; o pôster continua no lugar.', erro)
      } finally {
        carregando = null
      }
    })()
  }

  // Baixa o 3D quando a primeira dobra estiver a uma tela de distância; para fora da tela.
  const observador = new IntersectionObserver(
    ([entrada]) => {
      naTela = Boolean(entrada?.isIntersecting)
      if (naTela) void carregar()
      atualizar()
    },
    { rootMargin: '100% 0px' },
  )
  observador.observe(caixa)

  document.addEventListener('visibilitychange', atualizar)
  reduzirMovimento.addEventListener('change', () => {
    if (reduzirMovimento.matches) robo?.parar()
    else void carregar()
    atualizar()
  })
  caixa.addEventListener('pointerdown', () => robo?.acenar())
  window.addEventListener('pagehide', () => {
    robo?.descartar()
    robo = null
  })

  return {
    /** Chame quando a pausa mudar. */
    aoMudarPausa() {
      if (!estaPausado()) void carregar()
      atualizar()
    },
  }
}
