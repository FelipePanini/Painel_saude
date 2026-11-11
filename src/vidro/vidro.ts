// Liquid glass da camada de navegação, em três aparências:
//   "vidro"  — WebGL, com a biblioteca @ybouane/liquidglass (carregada sob demanda);
//   "css"    — backdrop-filter com preenchimento translúcido;
//   "solida" — superfície opaca.
// A aparência em uso fica em <html data-vidro="...">, e o CSS (vidro.css) faz o resto.
// Sem WebGL, ou se a biblioteca falhar, a aparência cai sozinha para "css".

export type Aparencia = 'vidro' | 'css' | 'solida'

interface Instancia {
  destroy(): void
  markChanged(elemento?: HTMLElement): void
}

let instancia: Instancia | null = null
// Cada chamada ganha um número; se outra chamada começar antes de esta terminar, esta desiste.
let pedidoAtual = 0

function temWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

const estaVisivel = (elemento: HTMLElement) => elemento.getClientRects().length > 0

function desligar() {
  instancia?.destroy()
  instancia = null
}

/**
 * Aplica a aparência pedida à raiz da navegação e devolve a aparência que ficou valendo.
 * A raiz segue as regras da biblioteca: os elementos de vidro são filhos diretos dela,
 * e o fundo que o vidro refrata é um elemento irmão, também dentro da raiz.
 */
export async function aplicarAparencia(raiz: HTMLElement, pedida: Aparencia): Promise<Aparencia> {
  const pedido = ++pedidoAtual
  const html = document.documentElement
  desligar()

  if (pedida !== 'vidro' || !temWebGL()) {
    const efetiva = pedida === 'vidro' ? 'css' : pedida
    html.dataset.vidro = efetiva
    return efetiva
  }

  // Enquanto o vidro carrega, a versão CSS aparece. O init não bloqueia a primeira pintura.
  html.dataset.vidro = 'css'
  try {
    await document.fonts.ready
    const { LiquidGlass } = await import('@ybouane/liquidglass')
    if (pedido !== pedidoAtual) return html.dataset.vidro as Aparencia
    const elementos = [...raiz.querySelectorAll<HTMLElement>(':scope > [data-config]')].filter(estaVisivel)
    // O vidro WebGL desenha o próprio fundo; a classe abaixo tira o fundo CSS antes da captura.
    html.dataset.vidro = 'vidro'
    const nova = await LiquidGlass.init({ root: raiz, glassElements: elementos })
    if (pedido !== pedidoAtual) {
      nova.destroy()
      return html.dataset.vidro as Aparencia
    }
    instancia = nova
    return 'vidro'
  } catch {
    if (pedido === pedidoAtual) html.dataset.vidro = 'css'
    return 'css'
  }
}

/** Avisa o vidro de que o fundo mudou (tema, direção visual), para ele fotografar de novo. */
export function fundoMudou() {
  instancia?.markChanged()
}

/** Chame ao sair da tela. */
export function destruirVidro() {
  pedidoAtual++
  desligar()
}
