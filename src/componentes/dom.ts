import { createElement, type IconNode } from 'lucide'

type Filho = Node | string | null | undefined | false

interface Opcoes {
  class?: string
  texto?: string
  /** Atributos HTML, como { href: '#', 'aria-label': '...' }. */
  atributos?: Record<string, string>
}

/** Cria um elemento sem usar innerHTML: o texto nunca é interpretado como HTML. */
export function el<K extends keyof HTMLElementTagNameMap>(tag: K, opcoes: Opcoes = {}, ...filhos: Filho[]): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag)
  if (opcoes.class) elemento.className = opcoes.class
  if (opcoes.texto !== undefined) elemento.textContent = opcoes.texto
  for (const [nome, valor] of Object.entries(opcoes.atributos ?? {})) elemento.setAttribute(nome, valor)
  for (const filho of filhos) if (filho) elemento.append(filho)
  return elemento
}

/** Ícone do Lucide (código aberto, licença ISC). Decorativo por padrão: o texto ao lado dá o significado. */
export function icone(no: IconNode, tamanho = 20): SVGElement {
  const svg = createElement(no, { width: tamanho, height: tamanho, 'aria-hidden': 'true', focusable: 'false' })
  svg.classList.add('icone')
  return svg
}
