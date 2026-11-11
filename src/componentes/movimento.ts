/**
 * Lê uma duração dos tokens CSS (por exemplo --duracao-lenta) e devolve em milissegundos.
 * Com "reduzir movimento" ligado no sistema, os tokens valem zero, e quem usa esta função
 * desliga a animação. Aceita "300ms", "0.3s" e "0s" (o build encurta "0ms" para "0s").
 */
export function duracaoDoToken(elemento: Element, token: string): number {
  const valor = getComputedStyle(elemento).getPropertyValue(token).trim()
  const ms = valor.endsWith('ms') ? parseFloat(valor) : parseFloat(valor) * 1000
  return Number.isFinite(ms) ? ms : 0
}
