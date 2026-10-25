import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '../src/estilos/tokens.css'
import '../src/estilos/base.css'
import './estilo.css'
import type { Chart } from 'chart.js'
import { painelEnfermagem, painelPlantonista, type Cartao, type Painel } from './calculos'
import { criarGrafico, type ChaveGrafico } from './graficos'

type Aba = 'plantonista' | 'enfermagem'

const paineis: Record<Aba, { dados: Painel; graficos: [ChaveGrafico, ChaveGrafico] }> = {
  plantonista: { dados: painelPlantonista(), graficos: ['plantonista-total', 'plantonista-hora'] },
  enfermagem: { dados: painelEnfermagem(), graficos: ['enfermagem-taxas', 'enfermagem-higiene'] },
}

const escapar = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

// Destaca os números dentro das frases (reais, porcentagens, decimais e datas),
// menos o "1.000" de "por 1.000 pacientes-dia", que é unidade e não resultado.
function destacarNumeros(texto: string) {
  let saida = ''
  let ultimo = 0
  for (const encontrado of texto.matchAll(/R\$\s?[\d.,]*\d|\d[\d.,/]*\d%?|\d%?/g)) {
    const inicio = encontrado.index
    const fim = inicio + encontrado[0].length
    const numero = escapar(encontrado[0])
    saida += semQuebrasRuins(texto.slice(ultimo, inicio))
    saida += texto.startsWith(' pacientes-dia', fim) ? numero : `<strong class="numero">${numero}</strong>`
    ultimo = fim
  }
  return saida + semQuebrasRuins(texto.slice(ultimo))
}

const icones = {
  ok: '<svg class="situacao__icone" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  atencao:
    '<svg class="situacao__icone" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8l6.6 11.7H1.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.2v3.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="11.6" r="0.9" fill="currentColor"/></svg>',
}

// Evita quebrar "pacientes-dia" no hífen e partir a meta entre parênteses.
const semQuebrasRuins = (texto: string) =>
  escapar(texto).replace(/(\S+-\S+|\([^)]+\))/g, '<span class="sem-quebra">$1</span>')

function cartaoHtml(cartao: Cartao) {
  return `
    <li class="cartao">
      <p class="cartao__rotulo">${escapar(cartao.rotulo)}</p>
      <p class="cartao__valor numero">${escapar(cartao.valor)}</p>
      ${cartao.unidade ? `<p class="cartao__unidade">${semQuebrasRuins(cartao.unidade)}</p>` : ''}
      <div class="cartao__rodape">
        ${cartao.comparacao ? `<p class="cartao__comparacao">${escapar(cartao.comparacao)}</p>` : ''}
        ${
          cartao.situacao
            ? `<p class="situacao situacao--${cartao.situacao.tipo}">${icones[cartao.situacao.tipo]}<span>${semQuebrasRuins(cartao.situacao.texto)}</span></p>`
            : ''
        }
      </div>
    </li>`
}

function painelHtml(aba: Aba) {
  const { dados } = paineis[aba]
  return `
    <div class="cabecalho">
      <div>
        <h1 class="cabecalho__titulo">${escapar(dados.titulo)}</h1>
        <p class="cabecalho__periodo">${escapar(dados.periodo)}</p>
      </div>
      <button class="botao" type="button" data-imprimir>Baixar PDF</button>
    </div>

    <ul class="cartoes" aria-label="Números principais">${dados.cartoes.map(cartaoHtml).join('')}</ul>

    <section class="mudancas" aria-labelledby="mudancas-${aba}">
      <h2 class="mudancas__titulo" id="mudancas-${aba}">O que mudou</h2>
      <ul class="mudancas__lista">${dados.frases.map((f) => `<li>${destacarNumeros(f)}</li>`).join('')}</ul>
    </section>

    <div class="graficos">
      ${dados.graficos
        .map(
          (g, i) => `
        <figure class="grafico">
          <figcaption>
            <h2 class="grafico__titulo">${escapar(g.titulo)}</h2>
            <p class="grafico__resumo">${escapar(g.resumo)}</p>
          </figcaption>
          <div class="grafico__area">
            <canvas role="img" aria-label="${escapar(g.descricao)}" data-grafico="${i}"></canvas>
          </div>
        </figure>`,
        )
        .join('')}
    </div>`
}

const graficosCriados = new Map<Aba, Chart[]>()

function criarGraficos(aba: Aba) {
  if (graficosCriados.has(aba)) return
  const painel = document.getElementById(`painel-${aba}`)!
  const canvases = painel.querySelectorAll<HTMLCanvasElement>('canvas[data-grafico]')
  graficosCriados.set(
    aba,
    [...canvases].map((canvas) => criarGrafico(canvas, paineis[aba].graficos[Number(canvas.dataset.grafico)]!)),
  )
}

function recriarGraficos() {
  for (const graficos of graficosCriados.values()) graficos.forEach((g) => g.destroy())
  const visiveis = [...graficosCriados.keys()]
  graficosCriados.clear()
  visiveis.forEach(criarGraficos)
}

const abas = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')]

function selecionar(aba: Aba, focar = false) {
  for (const botao of abas) {
    const ativa = botao.id === `aba-${aba}`
    botao.setAttribute('aria-selected', String(ativa))
    botao.tabIndex = ativa ? 0 : -1
    if (ativa && focar) botao.focus()
    document.getElementById(botao.getAttribute('aria-controls')!)!.hidden = !ativa
  }
  criarGraficos(aba)
  history.replaceState(null, '', `#${aba}`)
}

const abaDoBotao = (botao: HTMLButtonElement) => botao.id.replace('aba-', '') as Aba

for (const aba of Object.keys(paineis) as Aba[]) {
  document.getElementById(`painel-${aba}`)!.innerHTML = painelHtml(aba)
}

abas.forEach((botao, indice) => {
  botao.addEventListener('click', () => selecionar(abaDoBotao(botao)))
  botao.addEventListener('keydown', (evento) => {
    const destino =
      evento.key === 'ArrowRight' ? (indice + 1) % abas.length
      : evento.key === 'ArrowLeft' ? (indice - 1 + abas.length) % abas.length
      : evento.key === 'Home' ? 0
      : evento.key === 'End' ? abas.length - 1
      : -1
    if (destino === -1) return
    evento.preventDefault()
    selecionar(abaDoBotao(abas[destino]!), true)
  })
})

document.addEventListener('click', (evento) => {
  if ((evento.target as Element).closest('[data-imprimir]')) window.print()
})

// Os gráficos se ajustam à largura da folha antes de imprimir e voltam depois.
const redimensionar = () => graficosCriados.forEach((graficos) => graficos.forEach((g) => g.resize()))
window.addEventListener('beforeprint', redimensionar)
window.addEventListener('afterprint', redimensionar)

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recriarGraficos)

selecionar(location.hash === '#enfermagem' ? 'enfermagem' : 'plantonista')
