import { Plus, type IconNode } from 'lucide'
import { capitalizar, formatar } from '../formatar'
import type { Filtros, Mes, Setor } from '../tipos/dominio'
import { aplicarAparencia, destruirVidro, type Aparencia } from '../vidro/vidro'
import { el, icone } from './dom'

export interface Secao {
  id: string
  rotulo: string
  icone: IconNode
  href: string
}

export interface OpcoesNavegacao {
  secoes: Secao[]
  /** id da seção em que a pessoa está. */
  atual: string
  meses: Mes[]
  setores: Setor[]
  filtros: Filtros
  aoFiltrar(filtros: Filtros): void
  aoAdicionar(): void
}

export interface Navegacao {
  /** A raiz do vidro. Coloque no <body>, antes do conteúdo. */
  elemento: HTMLElement
  /** Aplica "vidro", "css" ou "solida" e devolve a aparência que ficou valendo. */
  aplicarVidro(pedida: Aparencia): Promise<Aparencia>
  /** Refaz o vidro depois de uma mudança de tema, para ele fotografar o fundo novo. */
  atualizarVidro(): Promise<Aparencia>
  destruir(): void
}

// Preset "Regular Glass" da biblioteca (os valores padrão), com dois ajustes:
// um pouco de desfoque, para o texto ficar legível, e uma sombra mais discreta.
const AJUSTES_DO_VIDRO = { blurAmount: 0.2, shadowOpacity: 0.18 }

/**
 * Monta a camada de navegação: barra do topo, e no celular a barra de abas e o botão flutuante.
 * Segue as regras da biblioteca de vidro: uma raiz só, elementos de vidro como filhos diretos
 * e as faixas de fundo como irmãs deles.
 */
export function montarNavegacao(opcoes: OpcoesNavegacao): Navegacao {
  const telaEstreita = window.matchMedia('(max-width: 719px)')
  const filtros = { ...opcoes.filtros }
  let aparenciaPedida: Aparencia = 'css'

  const link = (secao: Secao, comIcone: boolean) =>
    el(
      'a',
      { atributos: { href: secao.href, ...(secao.id === opcoes.atual ? { 'aria-current': 'page' } : {}) } },
      comIcone ? icone(secao.icone, 22) : null,
      secao.rotulo,
    )

  // No celular o mês aparece curto ("Out/2026"), para os dois filtros caberem na barra.
  const rotuloDoMes = (mes: Mes) =>
    telaEstreita.matches ? `${capitalizar(formatar.mesCurto(mes))}/${mes.slice(0, 4)}` : capitalizar(formatar.mesComAno(mes))

  const seletorMes = el('select', { atributos: { id: 'filtro-mes' } })
  const preencherMeses = () => {
    seletorMes.replaceChildren(...[...opcoes.meses].reverse().map((mes) => el('option', { texto: rotuloDoMes(mes), atributos: { value: mes } })))
    seletorMes.value = filtros.mes
  }
  preencherMeses()
  seletorMes.addEventListener('change', () => {
    filtros.mes = seletorMes.value
    opcoes.aoFiltrar({ ...filtros })
  })

  const seletorSetor = el(
    'select',
    { atributos: { id: 'filtro-setor' } },
    el('option', { texto: 'Todos os setores', atributos: { value: 'todos' } }),
    ...opcoes.setores.map((s) => el('option', { texto: s.nome, atributos: { value: s.id } })),
  )
  seletorSetor.value = filtros.setorId
  seletorSetor.addEventListener('change', () => {
    filtros.setorId = seletorSetor.value
    opcoes.aoFiltrar({ ...filtros })
  })

  const adicionar = el('button', { class: 'botao botao--primario barra-topo__adicionar', atributos: { type: 'button' } }, icone(Plus, 18), 'Adicionar dados')
  const flutuante = el('button', { class: 'vidro botao-flutuante', atributos: { type: 'button' } }, icone(Plus, 18), 'Adicionar dados')
  adicionar.addEventListener('click', opcoes.aoAdicionar)
  flutuante.addEventListener('click', opcoes.aoAdicionar)

  const barraTopo = el(
    'header',
    { class: 'vidro barra-topo' },
    el('span', { class: 'marca', texto: 'Painel Saúde' }),
    el('nav', { class: 'barra-topo__nav', atributos: { 'aria-label': 'Seções' } }, ...opcoes.secoes.map((s) => link(s, false))),
    el(
      'div',
      { class: 'barra-topo__filtros' },
      el('label', { class: 'seletor' }, el('span', { class: 'so-leitor', texto: 'Mês' }), seletorMes),
      el('label', { class: 'seletor' }, el('span', { class: 'so-leitor', texto: 'Setor' }), seletorSetor),
      adicionar,
    ),
  )
  const barraAbas = el('nav', { class: 'vidro barra-abas', atributos: { 'aria-label': 'Seções' } }, ...opcoes.secoes.map((s) => link(s, true)))

  const elemento = el(
    'div',
    { class: 'camada-nav' },
    el('div', { class: 'faixa faixa--topo', atributos: { 'aria-hidden': 'true' } }),
    el('div', { class: 'faixa faixa--base', atributos: { 'aria-hidden': 'true' } }),
    barraTopo,
    flutuante,
    barraAbas,
  )

  // O raio de cada elemento de vidro vem dos tokens, para o vidro e o CSS terem o mesmo contorno.
  function configurar() {
    const estilo = getComputedStyle(elemento)
    const raio = (token: string) => parseFloat(estilo.getPropertyValue(token)) || 0
    const config = (cornerRadius: number) => JSON.stringify({ cornerRadius, ...AJUSTES_DO_VIDRO })
    barraTopo.dataset.config = config(raio('--raio-barra'))
    flutuante.dataset.config = config(raio('--raio-barra'))
    barraAbas.dataset.config = config(raio('--raio-abas'))
  }

  async function aplicarVidro(pedida: Aparencia) {
    aparenciaPedida = pedida
    configurar()
    return aplicarAparencia(elemento, pedida)
  }

  // Ao cruzar a largura em que a navegação muda (barra de abas no celular), o vidro é refeito.
  const aoMudarLargura = () => {
    preencherMeses()
    void aplicarVidro(aparenciaPedida)
  }
  telaEstreita.addEventListener('change', aoMudarLargura)

  return {
    elemento,
    aplicarVidro,
    atualizarVidro: () => aplicarVidro(aparenciaPedida),
    destruir() {
      telaEstreita.removeEventListener('change', aoMudarLargura)
      destruirVidro()
      elemento.remove()
    },
  }
}
