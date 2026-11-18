import { el } from './dom'

export type FormatoDeTela = 'computador' | 'tablet' | 'celular'

export interface ImagemDeTela {
  formato: FormatoDeTela
  largura: number
  altura: number
  alt: string
  imagens: Record<'claro' | 'escuro', Record<'1x' | '2x', string>>
}

/**
 * Moldura de tela para as imagens do painel: cantos arredondados, borda fina e sombra dos tokens.
 * Não imita nenhum aparelho real. A imagem escura entra quando o sistema está no tema escuro.
 * width e height reservam o espaço da imagem, então a página não pula quando ela carrega.
 */
export function molduraDeTela(tela: ImagemDeTela) {
  const { claro, escuro } = tela.imagens
  const imagem = el('img', {
    atributos: {
      src: claro['1x'],
      srcset: `${claro['1x']} ${tela.largura}w, ${claro['2x']} ${tela.largura * 2}w`,
      sizes: tela.formato === 'computador' ? '(min-width: 960px) 64rem, 92vw' : tela.formato === 'tablet' ? '(min-width: 960px) 26rem, 70vw' : '(min-width: 960px) 14rem, 46vw',
      width: String(tela.largura),
      height: String(tela.altura),
      alt: tela.alt,
      loading: 'lazy',
      decoding: 'async',
    },
  })
  return el(
    'figure',
    { class: `moldura moldura--${tela.formato}` },
    el(
      'picture',
      {},
      el('source', { atributos: { media: '(prefers-color-scheme: dark)', srcset: `${escuro['1x']} ${tela.largura}w, ${escuro['2x']} ${tela.largura * 2}w`, sizes: imagem.getAttribute('sizes')! } }),
      imagem,
    ),
  )
}
