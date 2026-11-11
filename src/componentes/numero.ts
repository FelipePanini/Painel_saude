import { duracaoDoToken } from './movimento'

// Número que "conta" até o novo valor. O valor final fica no texto acessível desde o começo,
// então a animação nunca atrasa a leitura. A duração vem do token --duracao-lenta.

const emAndamento = new WeakMap<HTMLElement, number>()

export function contarAte(elemento: HTMLElement, de: number | null, ate: number, formatar: (v: number) => string) {
  const anterior = emAndamento.get(elemento)
  if (anterior) cancelAnimationFrame(anterior)

  const final = formatar(ate)
  elemento.setAttribute('aria-label', final)
  // O elemento ainda pode estar fora da página; os tokens são lidos na raiz do documento.
  const tempo = duracaoDoToken(document.documentElement, '--duracao-lenta')
  if (de === null || tempo === 0 || formatar(de) === final) {
    elemento.textContent = final
    return
  }

  const inicio = performance.now()
  const passo = (agora: number) => {
    const t = Math.min(1, (agora - inicio) / tempo)
    const suave = 1 - (1 - t) ** 3 // desacelera no fim
    elemento.textContent = t === 1 ? final : formatar(de + (ate - de) * suave)
    if (t < 1) emAndamento.set(elemento, requestAnimationFrame(passo))
  }
  emAndamento.set(elemento, requestAnimationFrame(passo))
}
