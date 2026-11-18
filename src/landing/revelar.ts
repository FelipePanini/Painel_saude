// Revelações ao rolar: os blocos aparecem subindo um pouco, com fade.
// Onde o navegador entende animação ligada à rolagem (animation-timeline: view()), o CSS faz tudo.
// Nos outros, este arquivo usa um IntersectionObserver para pôr a classe "revelado".
// Sem JavaScript, ou com "reduzir movimento", tudo aparece direto.

export function iniciarRevelacoes() {
  const temSuporte = CSS.supports('animation-timeline: view()')
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (temSuporte || reduzir) return

  document.documentElement.classList.add('revelar-com-js')
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue
        entrada.target.classList.add('revelado')
        observador.unobserve(entrada.target)
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  // Os blocos criados depois (grupos de indicadores) também entram.
  const observarTodos = () => document.querySelectorAll('.revelar:not(.revelado)').forEach((e) => observador.observe(e))
  observarTodos()
  return observarTodos
}
