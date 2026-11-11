import { AlertTriangle, Check, Minus, TrendingDown, TrendingUp, type IconNode } from 'lucide'
import type { Chart } from 'chart.js'
import { arredondarComoATela, formatar } from '../formatar'
import type { Indicador, Mes, ResumoIndicador } from '../tipos/dominio'
import { el, icone } from './dom'
import { graficoTendencia } from './graficoTendencia'
import { minigrafico } from './minigrafico'
import { contarAte } from './numero'

// Peças do cartão de indicador: número, selo da meta, variação, "O que é isso?" e os dois formatos de cartão.

export function textoDaMeta(indicador: Indicador) {
  if (!indicador.meta) return ''
  const valor = formatar.indicador(indicador, indicador.meta.valor)
  return indicador.meta.tipo === 'ate' ? `até ${valor}` : `mínimo de ${valor}`
}

interface Variacao {
  texto: string
  icone: IconNode
  tom: 'melhor' | 'pior' | 'neutro'
}

export function variacao(resumo: ResumoIndicador, mesAnterior: Mes | null): Variacao | null {
  const { indicador, valor, valorAnterior } = resumo
  if (valor === null || valorAnterior === null || !mesAnterior) return null
  const diferenca = arredondarComoATela(indicador, valor) - arredondarComoATela(indicador, valorAnterior)
  const nomeMes = formatar.mes(mesAnterior)
  if (Math.abs(diferenca) < 0.05) return { texto: `Igual a ${nomeMes}`, icone: Minus, tom: 'neutro' }
  const tamanho = Math.abs(diferenca)
  const quanto =
    indicador.formato === 'percentual'
      ? `${formatar.inteiro(tamanho)} ${tamanho === 1 ? 'ponto' : 'pontos'}`
      : formatar.decimal1(tamanho)
  const subiu = diferenca > 0
  const melhorou = indicador.sentido === 'maior-melhor' ? subiu : !subiu
  return {
    texto: `${subiu ? 'Subiu' : 'Caiu'} ${quanto} desde ${nomeMes}`,
    icone: subiu ? TrendingUp : TrendingDown,
    // Sem meta, não dizemos se a mudança é boa ou ruim.
    tom: indicador.meta ? (melhorou ? 'melhor' : 'pior') : 'neutro',
  }
}

/** Selo "Dentro da meta" ou "Fora da meta", com ícone e texto: a cor nunca é a única pista. */
export function seloDaMeta(resumo: ResumoIndicador) {
  if (resumo.situacao === 'sem-meta') return null
  const dentro = resumo.situacao === 'dentro-da-meta'
  return el(
    'p',
    { class: `selo selo--${dentro ? 'ok' : 'atencao'}` },
    icone(dentro ? Check : AlertTriangle, 16),
    el('span', { texto: `${dentro ? 'Dentro da meta' : 'Fora da meta'} (${textoDaMeta(resumo.indicador)})` }),
  )
}

export function linhaDaVariacao(resumo: ResumoIndicador, mesAnterior: Mes | null) {
  const v = variacao(resumo, mesAnterior)
  if (!v) return null
  return el('p', { class: `variacao variacao--${v.tom}` }, icone(v.icone, 16), el('span', { texto: v.texto }))
}

/** Guarda o último valor mostrado de cada indicador, para o número contar a partir dele. */
const valoresMostrados = new Map<string, number>()

function numero(resumo: ResumoIndicador) {
  const elemento = el('p', { class: 'cartao__valor numero' })
  if (resumo.valor === null) {
    elemento.textContent = '—'
    elemento.setAttribute('aria-label', 'Sem dados neste mês')
    return elemento
  }
  const chave = resumo.indicador.id
  contarAte(elemento, valoresMostrados.get(chave) ?? null, resumo.valor, (v) => formatar.indicador(resumo.indicador, v))
  valoresMostrados.set(chave, resumo.valor)
  return elemento
}

const temSerie = (resumo: ResumoIndicador) => resumo.serie.filter((s) => s.valor !== null).length >= 2

function mini(resumo: ResumoIndicador) {
  if (!temSerie(resumo)) return el('p', { class: 'sem-dados', texto: 'Dados insuficientes para o gráfico' })
  const primeiro = resumo.serie[0]!
  const ultimo = resumo.serie[resumo.serie.length - 1]!
  return minigrafico(resumo.serie.map((s) => s.valor), {
    meta: resumo.indicador.meta?.valor,
    descricao: `Tendência de ${resumo.indicador.nome.toLowerCase()} de ${formatar.mes(primeiro.mes)} a ${formatar.mes(ultimo.mes)}`,
  })
}

export function oQueE(indicador: Indicador) {
  return el(
    'details',
    { class: 'o-que-e' },
    el('summary', { texto: 'O que é isso?' }),
    el('p', { texto: indicador.oQueE }),
    el('p', { class: 'o-que-e__formula', texto: `Como é calculado: ${indicador.formula}` }),
  )
}

/** Quando o mês não tem números, o cartão diz isso com palavras, além do traço no lugar do valor. */
const semDadosNoMes = (resumo: ResumoIndicador) => (resumo.valor === null ? el('p', { class: 'sem-dados', texto: 'Sem dados neste mês' }) : null)

const cabecalho = (resumo: ResumoIndicador) => [
  el('h3', { class: 'cartao__nome', texto: resumo.indicador.nome }),
  el('div', { class: 'cartao__linha-valor' }, numero(resumo), el('p', { class: 'cartao__unidade', texto: resumo.indicador.unidade })),
]

/**
 * Cartão em destaque: número grande, selo, variação, gráfico de 12 meses e "O que é isso?".
 * Devolve também o gráfico, para quem chamou poder destruí-lo ao redesenhar.
 */
export function cartaoDestaque(resumo: ResumoIndicador, mesAnterior: Mes | null): { elemento: HTMLElement; iniciarGrafico(): Chart | null } {
  const canvas = el('canvas')
  const area = el('div', { class: 'cartao__grafico' }, temSerie(resumo) ? canvas : el('p', { class: 'sem-dados', texto: 'Dados insuficientes para o gráfico' }))
  const elemento = el(
    'article',
    { class: 'cartao cartao--destaque' },
    el('div', { class: 'cartao__topo' }, el('div', {}, ...cabecalho(resumo)), el('div', { class: 'cartao__estado' }, seloDaMeta(resumo), linhaDaVariacao(resumo, mesAnterior), semDadosNoMes(resumo))),
    area,
    oQueE(resumo.indicador),
  )
  // O gráfico lê os tokens do canvas, então só pode começar depois de o cartão entrar na página.
  return { elemento, iniciarGrafico: () => (temSerie(resumo) ? graficoTendencia(canvas, resumo) : null) }
}

/** Cartão compacto: número, selo ou variação, minigráfico e o botão "Ver tendência". */
export function cartaoCompacto(resumo: ResumoIndicador, mesAnterior: Mes | null, aoVerTendencia?: () => void) {
  const ver = aoVerTendencia
    ? el('button', { class: 'botao botao--texto', texto: 'Ver tendência', atributos: { type: 'button', 'aria-label': `Ver tendência de ${resumo.indicador.nome.toLowerCase()}` } })
    : null
  if (ver && aoVerTendencia) ver.addEventListener('click', aoVerTendencia)
  return el(
    'article',
    { class: 'cartao cartao--compacto' },
    el('div', { class: 'cartao__texto' }, ...cabecalho(resumo), seloDaMeta(resumo) ?? linhaDaVariacao(resumo, mesAnterior) ?? semDadosNoMes(resumo)),
    el('div', { class: 'cartao__lado' }, mini(resumo), ver),
  )
}
