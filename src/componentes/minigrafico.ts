const SVG = 'http://www.w3.org/2000/svg'

interface Opcoes {
  /** Linha tracejada na altura da meta. */
  meta?: number
  /** Texto para leitores de tela. */
  descricao: string
}

/**
 * Minigráfico de tendência em SVG. Meses sem dados (null) viram um intervalo na linha.
 * As cores vêm do CSS (.minigrafico), então seguem os tokens e o tema.
 */
export function minigrafico(valores: (number | null)[], opcoes: Opcoes): SVGSVGElement {
  const largura = 120
  const altura = 36
  const margem = 4
  const numeros = valores.filter((v): v is number => v !== null)
  const todos = opcoes.meta === undefined ? numeros : [...numeros, opcoes.meta]
  const minimo = Math.min(...todos)
  const maximo = Math.max(...todos)
  const faixa = maximo - minimo || 1
  const x = (i: number) => margem + (i * (largura - margem * 2)) / Math.max(1, valores.length - 1)
  const y = (v: number) => altura - margem - ((v - minimo) / faixa) * (altura - margem * 2)

  const svg = document.createElementNS(SVG, 'svg')
  svg.setAttribute('viewBox', `0 0 ${largura} ${altura}`)
  svg.setAttribute('class', 'minigrafico')
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', opcoes.descricao)
  svg.setAttribute('preserveAspectRatio', 'none')

  if (opcoes.meta !== undefined) {
    const meta = document.createElementNS(SVG, 'line')
    meta.setAttribute('class', 'minigrafico__meta')
    meta.setAttribute('x1', String(margem))
    meta.setAttribute('x2', String(largura - margem))
    meta.setAttribute('y1', String(y(opcoes.meta)))
    meta.setAttribute('y2', String(y(opcoes.meta)))
    svg.append(meta)
  }

  // Cada trecho contínuo de meses com dados vira uma linha.
  let trecho: string[] = []
  const fechar = () => {
    if (trecho.length > 1) {
      const linha = document.createElementNS(SVG, 'polyline')
      linha.setAttribute('class', 'minigrafico__linha')
      linha.setAttribute('points', trecho.join(' '))
      svg.append(linha)
    }
    trecho = []
  }
  valores.forEach((valor, i) => {
    if (valor === null) fechar()
    else trecho.push(`${x(i).toFixed(1)},${y(valor).toFixed(1)}`)
  })
  fechar()

  const ultimo = valores.length - 1
  const valorFinal = valores[ultimo]
  if (valorFinal !== null && valorFinal !== undefined) {
    const ponto = document.createElementNS(SVG, 'circle')
    ponto.setAttribute('class', 'minigrafico__ponto')
    ponto.setAttribute('cx', String(x(ultimo)))
    ponto.setAttribute('cy', String(y(valorFinal)))
    ponto.setAttribute('r', '3')
    svg.append(ponto)
  }
  return svg
}
