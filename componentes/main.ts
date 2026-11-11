// Galeria da fase 1. Nesta etapa ela mostra as duas direções visuais do painel, lado a lado,
// para o Felipe escolher uma. Depois da escolha, vira a galeria de componentes.
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '../src/estilos/tokens.css'
import '../src/estilos/base.css'
import '../src/vidro/vidro.css'
import './galeria.css'
import './direcao-a.css'
import './direcao-b.css'
import type { Chart } from 'chart.js'
import { AlertTriangle, Check, Database, LayoutDashboard, Minus, Plus, Settings, TrendingDown, TrendingUp, type IconNode } from 'lucide'
import { el, icone } from '../src/componentes/dom'
import { graficoTendencia } from '../src/componentes/graficoTendencia'
import { minigrafico } from '../src/componentes/minigrafico'
import { contarAte } from '../src/componentes/numero'
import { fonteDeDados } from '../src/fonte-de-dados'
import { arredondarComoATela, capitalizar, formatar } from '../src/formatar'
import type { Filtros, Indicador, ResumoIndicador } from '../src/tipos/dominio'
import { aplicarAparencia, fundoMudou, type Aparencia } from '../src/vidro/vidro'

type Direcao = 'a' | 'b'
type Tema = 'sistema' | 'claro' | 'escuro'

const direcoes: Record<Direcao, { nome: string; descricao: string; raioBarra: number; raioAbas: number }> = {
  a: {
    nome: 'A · Sereno',
    descricao:
      'Claro e arejado. Azul-petróleo, cantos bem arredondados, um indicador em destaque com o gráfico e os outros ao lado. A navegação é uma cápsula de vidro sobre um fundo suave.',
    raioBarra: 28,
    raioAbas: 32,
  },
  b: {
    nome: 'B · Boletim',
    descricao:
      'Direto como um relatório. Verde-escuro, cantos mais retos, as frases sobre o que mudou vêm primeiro e os indicadores ficam numa lista, fácil de comparar. A navegação é vidro sobre uma faixa verde.',
    raioBarra: 16,
    raioAbas: 20,
  },
}

const parametros = new URLSearchParams(location.search)
const umDe = <T extends string>(valor: string | null, opcoes: readonly T[], padrao: T) =>
  opcoes.includes(valor as T) ? (valor as T) : padrao

const meses = await fonteDeDados.meses()
const setores = await fonteDeDados.setores()

const estado = {
  direcao: umDe<Direcao>(parametros.get('direcao'), ['a', 'b'], 'a'),
  tema: umDe<Tema>(parametros.get('tema'), ['sistema', 'claro', 'escuro'], 'sistema'),
  vidro: umDe<Aparencia>(parametros.get('vidro'), ['vidro', 'css', 'solida'], 'vidro'),
  filtros: { mes: meses[meses.length - 1]!, setorId: 'todos' } as Filtros,
  /** Na direção A, o indicador que ocupa o cartão grande. */
  destaqueId: null as string | null,
}

const camadaNav = document.getElementById('camada-nav')!
const painel = document.getElementById('painel')!
const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)')
const telaEstreita = window.matchMedia('(max-width: 719px)')
let graficoAtual: Chart | null = null
/** Guarda o último valor mostrado de cada indicador, para o número contar a partir dele. */
const valoresMostrados = new Map<string, number>()

// ---------- textos derivados dos dados ----------

function textoDaMeta(indicador: Indicador) {
  if (!indicador.meta) return ''
  const valor = formatar.indicador(indicador, indicador.meta.valor)
  return indicador.meta.tipo === 'ate' ? `até ${valor}` : `mínimo de ${valor}`
}

function variacao(resumo: ResumoIndicador, mesAnterior: string | null): { texto: string; icone: IconNode; tom: 'melhor' | 'pior' | 'neutro' } | null {
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

function seloDaMeta(resumo: ResumoIndicador) {
  if (resumo.situacao === 'sem-meta') return null
  const dentro = resumo.situacao === 'dentro-da-meta'
  return el(
    'p',
    { class: `selo selo--${dentro ? 'ok' : 'atencao'}` },
    icone(dentro ? Check : AlertTriangle, 16),
    el('span', { texto: `${dentro ? 'Dentro da meta' : 'Fora da meta'} (${textoDaMeta(resumo.indicador)})` }),
  )
}

function linhaDaVariacao(resumo: ResumoIndicador, mesAnterior: string | null) {
  const v = variacao(resumo, mesAnterior)
  if (!v) return null
  return el('p', { class: `variacao variacao--${v.tom}` }, icone(v.icone, 16), el('span', { texto: v.texto }))
}

function numero(resumo: ResumoIndicador, classe: string) {
  const elemento = el('p', { class: `${classe} numero` })
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

function mini(resumo: ResumoIndicador) {
  const valores = resumo.serie.map((s) => s.valor)
  if (valores.filter((v) => v !== null).length < 2) return el('p', { class: 'sem-dados', texto: 'Dados insuficientes para o gráfico' })
  const primeiro = resumo.serie[0]!
  const ultimo = resumo.serie[resumo.serie.length - 1]!
  return minigrafico(valores, {
    meta: resumo.indicador.meta?.valor,
    descricao: `Tendência de ${resumo.indicador.nome.toLowerCase()} de ${formatar.mes(primeiro.mes)} a ${formatar.mes(ultimo.mes)}`,
  })
}

function oQueE(indicador: Indicador) {
  return el(
    'details',
    { class: 'o-que-e' },
    el('summary', { texto: 'O que é isso?' }),
    el('p', { texto: indicador.oQueE }),
    el('p', { class: 'o-que-e__formula', texto: `Como é calculado: ${indicador.formula}` }),
  )
}

// ---------- direção A: um indicador em destaque e os outros ao lado ----------

function painelA(resumos: ResumoIndicador[], frases: string[], titulo: string, subtitulo: string, mesAnterior: string | null) {
  const destaque =
    resumos.find((r) => r.indicador.id === estado.destaqueId) ?? resumos.find((r) => r.situacao === 'fora-da-meta') ?? resumos[0]!
  const outros = resumos.filter((r) => r !== destaque)

  const areaDoGrafico = el('div', { class: 'cartao__grafico' })
  const temSerie = destaque.serie.filter((s) => s.valor !== null).length >= 2
  const canvas = el('canvas')
  areaDoGrafico.append(temSerie ? canvas : el('p', { class: 'sem-dados', texto: 'Dados insuficientes para o gráfico' }))

  const cartaoDestaque = el(
    'article',
    { class: 'cartao cartao--destaque' },
    el('div', { class: 'cartao__topo' },
      el('div', {},
        el('h3', { class: 'cartao__nome', texto: destaque.indicador.nome }),
        el('div', { class: 'cartao__linha-valor' }, numero(destaque, 'cartao__valor'), el('p', { class: 'cartao__unidade', texto: destaque.indicador.unidade })),
      ),
      el('div', { class: 'cartao__estado' }, seloDaMeta(destaque), linhaDaVariacao(destaque, mesAnterior)),
    ),
    areaDoGrafico,
    oQueE(destaque.indicador),
  )

  const compactos = outros.map((resumo) => {
    const ver = el('button', { class: 'botao-texto', texto: 'Ver tendência', atributos: { type: 'button', 'aria-label': `Ver tendência de ${resumo.indicador.nome.toLowerCase()}` } })
    ver.addEventListener('click', () => {
      estado.destaqueId = resumo.indicador.id
      void desenharPainel()
    })
    return el(
      'article',
      { class: 'cartao cartao--compacto' },
      el('div', { class: 'cartao__texto' },
        el('h3', { class: 'cartao__nome', texto: resumo.indicador.nome }),
        el('div', { class: 'cartao__linha-valor' }, numero(resumo, 'cartao__valor'), el('p', { class: 'cartao__unidade', texto: resumo.indicador.unidade })),
        seloDaMeta(resumo) ?? linhaDaVariacao(resumo, mesAnterior),
      ),
      el('div', { class: 'cartao__lado' }, mini(resumo), ver),
    )
  })

  painel.replaceChildren(
    el('header', { class: 'painel__cabecalho' }, el('h2', { class: 'painel__titulo', texto: titulo }), el('p', { class: 'painel__subtitulo', texto: subtitulo })),
    el('div', { class: 'grade-a' }, cartaoDestaque, el('div', { class: 'grade-a__coluna' }, ...compactos)),
    el('section', { class: 'mudancas' },
      el('h3', { class: 'mudancas__titulo', texto: 'O que mudou' }),
      frases.length
        ? el('ul', { class: 'mudancas__lista' }, ...frases.map((f) => el('li', { texto: f })))
        : el('p', { class: 'sem-dados', texto: 'Nenhuma mudança importante neste mês.' }),
    ),
  )
  if (temSerie) graficoAtual = graficoTendencia(canvas, destaque)
}

// ---------- direção B: as frases primeiro, os indicadores em lista ----------

function painelB(resumos: ResumoIndicador[], frases: string[], titulo: string, subtitulo: string, mesAnterior: string | null) {
  const [manchete, ...outras] = frases
  const linhas = resumos.map((resumo) =>
    el(
      'details',
      { class: 'linha' },
      el('summary', { class: 'linha__resumo' },
        el('div', { class: 'linha__nome' }, el('h3', { texto: resumo.indicador.nome }), el('p', { texto: resumo.indicador.unidade })),
        el('div', { class: 'linha__grafico' }, mini(resumo)),
        numero(resumo, 'linha__valor'),
        el('div', { class: 'linha__estado' }, seloDaMeta(resumo), linhaDaVariacao(resumo, mesAnterior)),
      ),
      el('div', { class: 'linha__detalhe' },
        el('p', { texto: resumo.indicador.oQueE }),
        el('p', { class: 'o-que-e__formula', texto: `Como é calculado: ${resumo.indicador.formula}` }),
      ),
    ),
  )

  painel.replaceChildren(
    el('header', { class: 'boletim' },
      el('p', { class: 'boletim__periodo', texto: `${titulo} · ${subtitulo}` }),
      el('h2', { class: 'boletim__manchete', texto: manchete ?? 'Nenhuma mudança importante neste mês.' }),
      outras.length ? el('ul', { class: 'boletim__frases' }, ...outras.map((f) => el('li', { texto: f }))) : null,
    ),
    el('section', { class: 'lista' },
      el('div', { class: 'lista__cabecalho' }, el('h3', { texto: 'Indicadores' }), el('p', { texto: 'Toque num indicador para ver o que ele significa.' })),
      ...linhas,
    ),
  )
}

// ---------- desenho ----------

async function desenharPainel() {
  graficoAtual?.destroy()
  graficoAtual = null
  const { filtros } = estado
  const [resumos, frases] = await Promise.all([fonteDeDados.resumo(filtros), fonteDeDados.frases(filtros)])
  const mesAnterior = meses[meses.indexOf(filtros.mes) - 1] ?? null
  const titulo = capitalizar(formatar.mesComAno(filtros.mes))
  const setor = filtros.setorId === 'todos' ? 'Todos os setores' : (setores.find((s) => s.id === filtros.setorId)?.nome ?? '')
  const subtitulo = mesAnterior ? `${setor}, comparado a ${formatar.mes(mesAnterior)}` : setor
  painel.dataset.direcao = estado.direcao
  if (estado.direcao === 'a') painelA(resumos, frases, titulo, subtitulo, mesAnterior)
  else painelB(resumos, frases, titulo, subtitulo, mesAnterior)
}

function temaEfetivo() {
  return estado.tema === 'sistema' ? (prefereEscuro.matches ? 'escuro' : 'claro') : estado.tema
}

const nomesDasAparencias: Record<Aparencia, string> = {
  vidro: 'vidro de verdade (WebGL)',
  css: 'versão CSS (desfoque do navegador)',
  solida: 'versão sólida',
}

async function aplicarVidro() {
  const { raioBarra, raioAbas } = direcoes[estado.direcao]
  const configurar = (seletor: string, cornerRadius: number) => {
    const elemento = camadaNav.querySelector<HTMLElement>(seletor)!
    // Preset "Regular Glass" da biblioteca (valores padrão), com um pouco de desfoque para o texto ficar legível.
    elemento.dataset.config = JSON.stringify({ cornerRadius, blurAmount: 0.2, shadowOpacity: 0.18 })
  }
  configurar('.barra-topo', raioBarra)
  configurar('.botao-flutuante', raioBarra)
  configurar('.barra-abas', raioAbas)

  const emUso = await aplicarAparencia(camadaNav, estado.vidro)
  const aviso = estado.vidro === 'vidro' && emUso !== 'vidro' ? ' O vidro de verdade não funcionou neste navegador, então a versão CSS entrou no lugar.' : ''
  document.getElementById('estado-vidro')!.textContent = `Navegação em uso: ${nomesDasAparencias[emUso]}.${aviso}`
  document.documentElement.dataset.vidroPronto = 'sim'
}

function guardarNoEndereco() {
  const novos = new URLSearchParams(location.search)
  novos.set('direcao', estado.direcao)
  novos.set('tema', estado.tema)
  novos.set('vidro', estado.vidro)
  history.replaceState(null, '', `?${novos}`)
}

async function aplicarTudo() {
  document.documentElement.dataset.tema = temaEfetivo()
  document.body.dataset.direcao = estado.direcao
  for (const campo of ['direcao', 'tema', 'vidro'] as const) {
    const radio = document.querySelector<HTMLInputElement>(`input[name="${campo}"][value="${estado[campo]}"]`)
    if (radio) radio.checked = true
  }
  await desenharPainel()
  await aplicarVidro()
}

// ---------- montagem inicial ----------

function montarComparacao() {
  const amostras = (Object.keys(direcoes) as Direcao[]).map((id) => {
    const cores = ['fundo', 'superficie', 'texto', 'destaque', 'positivo', 'alerta']
    const ver = el('button', { class: 'botao-secundario', texto: 'Ver esta direção', atributos: { type: 'button' } })
    ver.addEventListener('click', () => {
      estado.direcao = id
      guardarNoEndereco()
      void aplicarTudo()
      painel.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return el(
      'article',
      { class: 'amostra', atributos: { 'data-direcao': id } },
      el('h2', { class: 'amostra__nome', texto: direcoes[id].nome }),
      el('p', { class: 'amostra__texto', texto: direcoes[id].descricao }),
      el('ul', { class: 'amostra__cores', atributos: { 'aria-label': 'Paleta' } }, ...cores.map((cor) => el('li', { class: `amostra__cor amostra__cor--${cor}`, atributos: { title: cor } }))),
      el('div', { class: 'amostra__tipo' }, el('p', { class: 'amostra__numero numero', texto: '1,2' }), el('p', { class: 'amostra__rotulo', texto: 'Quedas por 1.000 pacientes-dia' })),
      ver,
    )
  })
  document.getElementById('comparacao')!.replaceChildren(...amostras)
}

function montarFiltros() {
  const seletorMes = document.querySelector<HTMLSelectElement>('#filtro-mes')!
  const seletorSetor = document.querySelector<HTMLSelectElement>('#filtro-setor')!
  // No celular o mês aparece curto ("Out/2026"), para os dois filtros caberem na barra.
  const rotuloDoMes = (mes: string) =>
    telaEstreita.matches ? `${capitalizar(formatar.mesCurto(mes))}/${mes.slice(0, 4)}` : capitalizar(formatar.mesComAno(mes))
  const preencherMeses = () => {
    seletorMes.replaceChildren(...[...meses].reverse().map((mes) => el('option', { texto: rotuloDoMes(mes), atributos: { value: mes } })))
    seletorMes.value = estado.filtros.mes
  }
  preencherMeses()
  telaEstreita.addEventListener('change', preencherMeses)
  seletorSetor.replaceChildren(
    el('option', { texto: 'Todos os setores', atributos: { value: 'todos' } }),
    ...setores.map((s) => el('option', { texto: s.nome, atributos: { value: s.id } })),
  )
  seletorMes.value = estado.filtros.mes
  seletorMes.addEventListener('change', () => {
    estado.filtros.mes = seletorMes.value
    void desenharPainel()
  })
  seletorSetor.addEventListener('change', () => {
    estado.filtros.setorId = seletorSetor.value
    void desenharPainel()
  })
}

function montarNavegacao() {
  const icones: Record<string, IconNode> = { painel: LayoutDashboard, dados: Database, preferencias: Settings }
  for (const link of camadaNav.querySelectorAll<HTMLElement>('[data-icone]')) link.prepend(icone(icones[link.dataset.icone!]!, 22))
  for (const botao of camadaNav.querySelectorAll<HTMLElement>('[data-adicionar]')) botao.prepend(icone(Plus, 18))
  // Nesta etapa os links da navegação são só visuais.
  for (const link of camadaNav.querySelectorAll('a')) link.addEventListener('click', (evento) => evento.preventDefault())
}

for (const radio of document.querySelectorAll<HTMLInputElement>('.segmentado input')) {
  radio.addEventListener('change', () => {
    if (radio.name === 'direcao') estado.direcao = radio.value as Direcao
    if (radio.name === 'tema') estado.tema = radio.value as Tema
    if (radio.name === 'vidro') estado.vidro = radio.value as Aparencia
    guardarNoEndereco()
    void aplicarTudo()
  })
}

prefereEscuro.addEventListener('change', () => {
  if (estado.tema === 'sistema') void aplicarTudo()
})
// Ao cruzar a largura em que a navegação muda (barra de abas no celular), o vidro é refeito.
telaEstreita.addEventListener('change', () => void aplicarVidro())
window.addEventListener('beforeprint', fundoMudou)

if (parametros.get('limpo') === '1') document.body.classList.add('sem-controles')
montarComparacao()
montarFiltros()
montarNavegacao()
await aplicarTudo()
