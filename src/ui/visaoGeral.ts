import type { Chart } from 'chart.js'
import { el } from '../componentes/dom'
import { cartaoCompacto, cartaoDestaque } from '../componentes/indicador'
import { fonteDeDados } from '../fonte-de-dados'
import { capitalizar, formatar } from '../formatar'
import type { Filtros, Mes, Setor } from '../tipos/dominio'

/**
 * Visão geral do painel: um indicador em destaque com o gráfico de 12 meses, os outros ao lado
 * e o bloco "O que mudou". Lê tudo pela fonte de dados, então funciona igual com os dados
 * fictícios (fase 1) e com os reais (fase 2).
 */
export function criarVisaoGeral(meses: Mes[], setores: Setor[]) {
  const elemento = el('div', { class: 'visao-geral' })
  let grafico: Chart | null = null
  let destaqueId: string | null = null
  let ultimosFiltros: Filtros | null = null

  async function desenhar(filtros: Filtros) {
    ultimosFiltros = filtros
    grafico?.destroy()
    grafico = null
    const [resumos, frases] = await Promise.all([fonteDeDados.resumo(filtros), fonteDeDados.frases(filtros)])
    const mesAnterior = meses[meses.indexOf(filtros.mes) - 1] ?? null
    const setor = filtros.setorId === 'todos' ? 'Todos os setores' : (setores.find((s) => s.id === filtros.setorId)?.nome ?? '')
    const destaque = resumos.find((r) => r.indicador.id === destaqueId) ?? resumos.find((r) => r.situacao === 'fora-da-meta') ?? resumos[0]!
    const grande = cartaoDestaque(destaque, mesAnterior)
    const compactos = resumos
      .filter((r) => r !== destaque)
      .map((r) =>
        cartaoCompacto(r, mesAnterior, () => {
          destaqueId = r.indicador.id
          if (ultimosFiltros) void desenhar(ultimosFiltros)
        }),
      )

    elemento.replaceChildren(
      el('p', { class: 'visao-geral__periodo', texto: `${capitalizar(formatar.mesComAno(filtros.mes))} · ${setor}${mesAnterior ? `, comparado a ${formatar.mes(mesAnterior)}` : ''}` }),
      el('div', { class: 'grade-painel' }, grande.elemento, el('div', { class: 'grade-painel__coluna' }, ...compactos)),
      el(
        'section',
        { class: 'mudancas', atributos: { 'aria-label': 'O que mudou' } },
        el('h3', { class: 'mudancas__titulo', texto: 'O que mudou' }),
        frases.length
          ? el('ul', { class: 'mudancas__lista' }, ...frases.map((f) => el('li', { texto: f })))
          : el('p', { class: 'sem-dados', texto: 'Nenhuma mudança importante neste mês.' }),
      ),
    )
    grafico = grande.iniciarGrafico()
  }

  return { elemento, desenhar }
}
