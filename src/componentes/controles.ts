import { AlertTriangle, Check, CircleX, Inbox, Info, type IconNode } from 'lucide'
import { el, icone } from './dom'

// Controles e avisos básicos. Cada função devolve um elemento HTML de verdade (button, label, fieldset),
// para teclado e leitores de tela funcionarem sem trabalho extra.

type Variante = 'neutro' | 'primario' | 'secundario' | 'perigo' | 'texto'

export function botao(texto: string, opcoes: { variante?: Variante; icone?: IconNode; desabilitado?: boolean; aoClicar?: () => void } = {}) {
  const variante = opcoes.variante ?? 'neutro'
  const elemento = el(
    'button',
    { class: variante === 'neutro' ? 'botao' : `botao botao--${variante}`, atributos: { type: 'button' } },
    opcoes.icone ? icone(opcoes.icone, 18) : null,
    texto,
  )
  elemento.disabled = Boolean(opcoes.desabilitado)
  if (opcoes.aoClicar) elemento.addEventListener('click', opcoes.aoClicar)
  return elemento
}

export function campoTexto(opcoes: { id: string; rotulo: string; valor?: string; ajuda?: string; erro?: string; tipo?: 'text' | 'number' }) {
  const descricoes: string[] = []
  const entrada = el('input', { class: 'campo__entrada', atributos: { id: opcoes.id, type: opcoes.tipo ?? 'text', inputmode: opcoes.tipo === 'number' ? 'numeric' : 'text' } })
  if (opcoes.valor !== undefined) entrada.value = opcoes.valor
  const ajuda = opcoes.ajuda ? el('p', { class: 'campo__ajuda', texto: opcoes.ajuda, atributos: { id: `${opcoes.id}-ajuda` } }) : null
  // O erro diz o que fazer, e vem com ícone: a borda vermelha não é a única pista.
  const erro = opcoes.erro ? el('p', { class: 'campo__erro', atributos: { id: `${opcoes.id}-erro` } }, icone(AlertTriangle, 16), el('span', { texto: opcoes.erro })) : null
  if (ajuda) descricoes.push(ajuda.id)
  if (erro) {
    descricoes.push(erro.id)
    entrada.setAttribute('aria-invalid', 'true')
  }
  if (descricoes.length) entrada.setAttribute('aria-describedby', descricoes.join(' '))
  return el(
    'div',
    { class: erro ? 'campo campo--com-erro' : 'campo' },
    el('label', { class: 'campo__rotulo', texto: opcoes.rotulo, atributos: { for: opcoes.id } }),
    entrada,
    ajuda,
    erro,
  )
}

export function seletor(opcoes: { id: string; rotulo: string; opcoes: { valor: string; rotulo: string }[]; valor?: string }) {
  const select = el('select', { atributos: { id: opcoes.id } }, ...opcoes.opcoes.map((o) => el('option', { texto: o.rotulo, atributos: { value: o.valor } })))
  if (opcoes.valor !== undefined) select.value = opcoes.valor
  return el('div', { class: 'campo' }, el('label', { class: 'campo__rotulo', texto: opcoes.rotulo, atributos: { for: opcoes.id } }), el('div', { class: 'seletor' }, select))
}

/** Chip de filtro: um botão que liga e desliga. */
export function chip(texto: string, ligado = false, aoMudar?: (ligado: boolean) => void) {
  const elemento = el('button', { class: 'chip', atributos: { type: 'button', 'aria-pressed': String(ligado) } }, icone(Check, 16), texto)
  elemento.addEventListener('click', () => {
    const novo = elemento.getAttribute('aria-pressed') !== 'true'
    elemento.setAttribute('aria-pressed', String(novo))
    aoMudar?.(novo)
  })
  return elemento
}

/** Controle segmentado: escolha única, feito com botões de rádio de verdade. */
export function segmentado<T extends string>(opcoes: { nome: string; legenda: string; opcoes: { valor: T; rotulo: string }[]; valor: T; aoMudar(valor: T): void }) {
  return el(
    'fieldset',
    { class: 'segmentado' },
    el('legend', { texto: opcoes.legenda }),
    ...opcoes.opcoes.map((o) => {
      const radio = el('input', { atributos: { type: 'radio', name: opcoes.nome, value: o.valor } })
      radio.checked = o.valor === opcoes.valor
      radio.addEventListener('change', () => opcoes.aoMudar(o.valor))
      return el('label', {}, radio, el('span', { texto: o.rotulo }))
    }),
  )
}

type TipoDeAviso = 'info' | 'sucesso' | 'atencao' | 'erro'
const iconesDeAviso: Record<TipoDeAviso, IconNode> = { info: Info, sucesso: Check, atencao: AlertTriangle, erro: CircleX }

export function aviso(tipo: TipoDeAviso, titulo: string, texto?: string) {
  return el(
    'div',
    { class: `aviso aviso--${tipo}`, atributos: { role: tipo === 'erro' ? 'alert' : 'status' } },
    icone(iconesDeAviso[tipo], 20),
    el('p', { class: 'aviso__titulo', texto: titulo }),
    texto ? el('p', { class: 'aviso__texto', texto }) : null,
  )
}

/** Estado vazio ou de erro: diz o que aconteceu e oferece o próximo passo. */
export function estado(opcoes: { tipo?: 'vazio' | 'erro'; titulo: string; texto: string; acao?: HTMLElement; icone?: IconNode }) {
  const tipo = opcoes.tipo ?? 'vazio'
  return el(
    'div',
    { class: `estado estado--${tipo}` },
    icone(opcoes.icone ?? (tipo === 'erro' ? CircleX : Inbox), 32),
    el('p', { class: 'estado__titulo', texto: opcoes.titulo }),
    el('p', { class: 'estado__texto', texto: opcoes.texto }),
    opcoes.acao,
  )
}

/** Carregando: blocos no formato do cartão que vai chegar. */
export function esqueleto() {
  return el(
    'div',
    { class: 'esqueleto', atributos: { role: 'status', 'aria-label': 'Carregando' } },
    el('div', { class: 'esqueleto__bloco esqueleto__bloco--curto' }),
    el('div', { class: 'esqueleto__bloco esqueleto__bloco--numero' }),
    el('div', { class: 'esqueleto__bloco esqueleto__bloco--grafico' }),
  )
}

let regiaoDeToasts: HTMLElement | null = null

/**
 * Aviso rápido no pé da tela, com "Desfazer". Some sozinho depois de alguns segundos.
 * É o padrão do produto para apagar e editar: desfazer em vez de perguntar "tem certeza?".
 */
export function mostrarToast(texto: string, opcoes: { aoDesfazer?: () => void; duracaoMs?: number } = {}) {
  if (!regiaoDeToasts) {
    regiaoDeToasts = el('div', { class: 'toasts', atributos: { role: 'status', 'aria-live': 'polite' } })
    document.body.append(regiaoDeToasts)
  }
  const toast = el('div', { class: 'toast' }, el('span', { texto }))
  const fechar = () => toast.remove()
  if (opcoes.aoDesfazer) {
    toast.append(
      botao('Desfazer', {
        aoClicar: () => {
          opcoes.aoDesfazer?.()
          fechar()
        },
      }),
    )
  }
  regiaoDeToasts.append(toast)
  window.setTimeout(fechar, opcoes.duracaoMs ?? 6000)
  return toast
}
