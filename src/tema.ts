// Tema claro, escuro ou do sistema. O tema em uso fica em <html data-tema="claro|escuro">.
// A fase 2 guarda a preferência junto com as outras (IndexedDB, ou só em memória no modo compartilhado).

export type Tema = 'sistema' | 'claro' | 'escuro'

const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)')
let preferencia: Tema = 'sistema'
const ouvintes = new Set<() => void>()

function aplicar() {
  const efetivo = preferencia === 'sistema' ? (prefereEscuro.matches ? 'escuro' : 'claro') : preferencia
  if (document.documentElement.dataset.tema === efetivo) return
  document.documentElement.dataset.tema = efetivo
  ouvintes.forEach((ouvinte) => ouvinte())
}

export function definirTema(novo: Tema) {
  preferencia = novo
  aplicar()
}

/** Avisa quando o tema em uso muda, para gráficos e vidro se redesenharem. */
export function aoMudarTema(ouvinte: () => void) {
  ouvintes.add(ouvinte)
}

prefereEscuro.addEventListener('change', aplicar)
aplicar()
