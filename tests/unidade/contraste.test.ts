import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Contraste dos textos da landing sobre o fundo desfocado.
// Pior caso: a forma desfocada com a opacidade dela, misturada ao fundo da página.
// Na prática o desfoque espalha a cor e o contraste fica maior; aqui medimos o ponto mais forte.

const css = readFileSync('src/estilos/tokens.css', 'utf8')
const [blocoClaro = '', blocoEscuro = ''] = css.split(":root[data-tema='escuro']")

function token(bloco: string, nome: string) {
  const achado = bloco.match(new RegExp(`--${nome}:\\s*([^;]+);`))?.[1]?.trim()
  if (!achado) throw new Error(`token --${nome} não encontrado`)
  return achado
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

function luminancia([r, g, b]: number[]) {
  const canal = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * canal(r!) + 0.7152 * canal(g!) + 0.0722 * canal(b!)
}

function contraste(a: string, b: number[]) {
  const [l1, l2] = [luminancia(rgb(a)), luminancia(b)].sort((x, y) => y - x)
  return (l1! + 0.05) / (l2! + 0.05)
}

const misturar = (frente: string, fundo: string, opacidade: number) =>
  rgb(frente).map((c, i) => Math.round(c * opacidade + rgb(fundo)[i]! * (1 - opacidade)))

describe('contraste do texto sobre o fundo desfocado da landing', () => {
  for (const [tema, bloco] of [
    ['claro', blocoClaro],
    ['escuro', blocoEscuro],
  ] as const) {
    it(`tema ${tema}: texto e texto suave com pelo menos 4,5:1 sobre cada forma`, () => {
      // O tema escuro herda do claro o que não redefine.
      const valor = (nome: string) => {
        try {
          return token(bloco, nome)
        } catch {
          return token(blocoClaro, nome)
        }
      }
      const opacidade = Number(valor('landing-forma-opacidade'))
      for (const forma of ['landing-forma-1', 'landing-forma-2', 'landing-forma-3']) {
        const fundo = misturar(valor(forma), valor('cor-fundo'), opacidade)
        for (const texto of ['cor-texto', 'cor-texto-suave']) {
          expect(contraste(valor(texto), fundo), `${texto} sobre ${forma}`).toBeGreaterThanOrEqual(4.5)
        }
      }
    })
  }
})
