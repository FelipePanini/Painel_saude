// Partes da landing que usam dados: a sequência "da planilha ao painel", os grupos de indicadores
// e a demonstração de acessibilidade. Os números vêm da fonte de dados (fictícia na fase 1),
// nunca escritos à mão no HTML.
import { segmentado } from '../componentes/controles'
import { el } from '../componentes/dom'
import { cartaoCompacto } from '../componentes/indicador'
import { minigrafico } from '../componentes/minigrafico'
import { fonteDeDados } from '../fonte-de-dados'
import { capitalizar, formatar } from '../formatar'
import type { Filtros, Grupo, ResumoIndicador } from '../tipos/dominio'

const nomesDosGrupos: Record<Grupo, string> = {
  assistencia: 'Assistência',
  qualidade: 'Qualidade',
  operacao: 'Operação',
}

/** Troca o hífen comum pelo hífen que não quebra (U+2011), para "pacientes-dia" não se partir. */
const semQuebrarNoHifen = (texto: string) => texto.replace(/-/g, '\u2011')

async function dadosDoMes() {
  const meses = await fonteDeDados.meses()
  const mes = meses[meses.length - 1]!
  const filtros: Filtros = { mes, setorId: 'todos' }
  const [resumos, setores, registros] = await Promise.all([fonteDeDados.resumo(filtros), fonteDeDados.setores(), fonteDeDados.registros(filtros)])
  return { mes, mesAnterior: meses[meses.length - 2] ?? null, resumos, setores, registros }
}

// ---------- sequência "da planilha ao painel" ----------

function montarPalco(dados: Awaited<ReturnType<typeof dadosDoMes>>) {
  const { mes, resumos, setores, registros } = dados
  const nomeDoSetor = (id: string) => setores.find((s) => s.id === id)?.nome ?? id

  // Camada 1: uma planilha estilizada, com as colunas como a pessoa costuma ter.
  const linhas = registros.slice(0, 5)
  const planilha = el(
    'div',
    { class: 'planilha' },
    el('p', { class: 'planilha__arquivo', texto: `indicadores-${formatar.mesCurto(mes)}.xlsx` }),
    el(
      'table',
      {},
      el('thead', {}, el('tr', {}, ...['Setor', 'Pac-dia', 'Quedas', 'LPP novas'].map((t) => el('th', { texto: t })))),
      el(
        'tbody',
        {},
        ...linhas.map((r) =>
          el(
            'tr',
            {},
            el('td', { texto: nomeDoSetor(r.setorId) }),
            ...['pacientes_dia', 'quedas', 'lesoes_novas'].map((campo) => el('td', { class: 'numero', texto: formatar.inteiro(r.valores[campo] ?? 0) })),
          ),
        ),
      ),
    ),
  )
  document.getElementById('palco-planilha')!.replaceChildren(planilha)

  // Camada 2: os mesmos números viram cartões.
  const cartoes = resumos.slice(0, 3).map((r) =>
    el(
      'div',
      { class: 'cartao-mini' },
      el('p', { class: 'cartao-mini__nome', texto: r.indicador.nome }),
      el('p', { class: 'cartao-mini__valor numero', texto: r.valor === null ? '—' : formatar.indicador(r.indicador, r.valor) }),
      el('p', { class: 'cartao-mini__unidade', texto: semQuebrarNoHifen(r.indicador.unidade) }),
    ),
  )
  document.getElementById('palco-cartoes')!.replaceChildren(el('div', { class: 'cartoes-mini' }, ...cartoes))

  // Camada 3: e depois um gráfico de tendência.
  const destaque = resumos.find((r) => r.situacao === 'fora-da-meta') ?? resumos[0]!
  const primeiro = destaque.serie[0]!
  document.getElementById('palco-grafico')!.replaceChildren(
    el(
      'div',
      { class: 'grafico-palco' },
      el('p', { class: 'grafico-palco__nome', texto: destaque.indicador.nome }),
      el('p', { class: 'grafico-palco__valor numero', texto: destaque.valor === null ? '—' : formatar.indicador(destaque.indicador, destaque.valor) }),
      minigrafico(
        destaque.serie.map((s) => s.valor),
        { meta: destaque.indicador.meta?.valor, descricao: `Tendência de ${destaque.indicador.nome.toLowerCase()} de ${formatar.mes(primeiro.mes)} a ${formatar.mes(mes)}` },
      ),
      el('p', { class: 'grafico-palco__legenda', texto: `${capitalizar(formatar.mes(primeiro.mes))} a ${formatar.mes(mes)}` }),
    ),
  )
}

/** Cada passo, ao passar pelo meio da tela, troca a camada do palco. */
function acompanharPassos() {
  const palco = document.getElementById('palco')!
  const passos = [...document.querySelectorAll<HTMLElement>('.passo')]
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue
        const passo = (entrada.target as HTMLElement).dataset.passo!
        palco.dataset.passo = passo
        passos.forEach((p) => p.classList.toggle('passo--atual', p.dataset.passo === passo))
      }
    },
    // Só uma faixa estreita da tela conta, para trocar uma camada por vez. No computador é o meio;
    // no celular, o palco fica preso em cima, então a faixa fica mais para baixo, onde o passo aparece.
    { rootMargin: window.matchMedia('(min-width: 960px)').matches ? '-45% 0px -45% 0px' : '-66% 0px -22% 0px' },
  )
  passos.forEach((p) => observador.observe(p))
}

// ---------- grupos de indicadores ----------

function montarGrupos(resumos: ResumoIndicador[], mesAnterior: string | null) {
  const grupos = (Object.keys(nomesDosGrupos) as Grupo[]).map((grupo) => {
    const doGrupo = resumos.filter((r) => r.indicador.grupo === grupo)
    if (!doGrupo.length) return null
    return el(
      'section',
      { class: 'grupo revelar', atributos: { 'aria-labelledby': `grupo-${grupo}` } },
      el('h3', { class: 'grupo__titulo', texto: nomesDosGrupos[grupo], atributos: { id: `grupo-${grupo}` } }),
      el('div', { class: 'grupo__cartoes' }, ...doGrupo.map((r) => cartaoCompacto(r, mesAnterior))),
    )
  })
  document.getElementById('grupos')!.replaceChildren(...grupos.filter((g): g is HTMLElement => g !== null))
}

// ---------- demonstração de acessibilidade ----------

type Tamanho = 'normal' | 'maior' | 'bem-maior'
type TemaLocal = 'pagina' | 'claro' | 'escuro'

function montarDemo(resumos: ResumoIndicador[], mesAnterior: string | null) {
  const exemplo = resumos[0]!
  const vitrine = el('div', { class: 'demo__vitrine', atributos: { 'data-tamanho': 'normal' } }, cartaoCompacto(exemplo, mesAnterior))
  const controles = el(
    'div',
    { class: 'demo__controles' },
    segmentado<Tamanho>({
      nome: 'demo-tamanho',
      legenda: 'Tamanho do texto',
      valor: 'normal',
      opcoes: [
        { valor: 'normal', rotulo: 'Normal' },
        { valor: 'maior', rotulo: 'Maior' },
        { valor: 'bem-maior', rotulo: 'Bem maior' },
      ],
      aoMudar: (valor) => {
        vitrine.dataset.tamanho = valor
      },
    }),
    segmentado<TemaLocal>({
      nome: 'demo-tema',
      legenda: 'Tema deste exemplo',
      valor: 'pagina',
      opcoes: [
        { valor: 'pagina', rotulo: 'Igual à página' },
        { valor: 'claro', rotulo: 'Claro' },
        { valor: 'escuro', rotulo: 'Escuro' },
      ],
      aoMudar: (valor) => {
        if (valor === 'pagina') delete vitrine.dataset.temaLocal
        else vitrine.dataset.temaLocal = valor
      },
    }),
  )
  document.getElementById('demo')!.replaceChildren(controles, vitrine)
}

export async function montarSecoes() {
  const dados = await dadosDoMes()
  montarPalco(dados)
  acompanharPassos()
  montarGrupos(dados.resumos, dados.mesAnterior)
  montarDemo(dados.resumos, dados.mesAnterior)
}
