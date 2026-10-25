import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js'
import { dadosGraficosEnfermagem, dadosGraficosPlantonista, formatar } from './calculos'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip, Legend)

const moedaCompacta = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' })

// Cores vêm dos tokens CSS, então seguem o modo claro ou escuro.
function cores() {
  const estilo = getComputedStyle(document.documentElement)
  const ler = (nome: string) => estilo.getPropertyValue(nome).trim()
  return {
    destaque: ler('--cor-destaque'),
    texto: ler('--cor-texto'),
    textoSuave: ler('--cor-texto-suave'),
    borda: ler('--cor-borda'),
    fonte: ler('--fonte-texto'),
  }
}

function comTransparencia(hex: string, alfa: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`
}

const semMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function opcoesBase(c: ReturnType<typeof cores>) {
  Chart.defaults.font.family = c.fonte
  Chart.defaults.font.size = 12
  Chart.defaults.color = c.textoSuave
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: semMovimento() ? (false as const) : { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: { displayColors: false },
    },
  }
}

function eixoValores(c: ReturnType<typeof cores>, formatarTick: (v: number) => string) {
  return {
    beginAtZero: true,
    border: { display: false },
    grid: { color: c.borda },
    ticks: { maxTicksLimit: 5, callback: (v: string | number) => formatarTick(Number(v)) },
  }
}

const eixoCategorias = { grid: { display: false }, border: { display: false } }

export type ChaveGrafico = 'plantonista-total' | 'plantonista-hora' | 'enfermagem-taxas' | 'enfermagem-higiene'

export function configuracao(chave: ChaveGrafico): ChartConfiguration {
  const c = cores()
  const base = opcoesBase(c)

  if (chave === 'plantonista-total') {
    const { totalPorMes } = dadosGraficosPlantonista()
    const ultimo = totalPorMes.length - 1
    return {
      type: 'bar',
      data: {
        labels: totalPorMes.map((m) => m.rotulo),
        datasets: [
          {
            label: 'Total',
            data: totalPorMes.map((m) => m.valor),
            backgroundColor: totalPorMes.map((_, i) => (i === ultimo ? c.destaque : comTransparencia(c.destaque, 0.35))),
            borderRadius: 6,
            maxBarThickness: 56,
          },
        ],
      },
      options: {
        ...base,
        plugins: { ...base.plugins, tooltip: { ...base.plugins.tooltip, callbacks: { label: (i) => formatar.moeda(Number(i.raw)) } } },
        scales: { x: eixoCategorias, y: eixoValores(c, (v) => moedaCompacta.format(v)) },
      },
    }
  }

  if (chave === 'plantonista-hora') {
    const { valorHora } = dadosGraficosPlantonista()
    const maior = Math.max(...valorHora.map((h) => h.valor))
    return {
      type: 'bar',
      data: {
        labels: valorHora.map((h) => h.rotulo),
        datasets: [
          {
            label: 'Valor por hora',
            data: valorHora.map((h) => h.valor),
            backgroundColor: valorHora.map((h) => (h.valor === maior ? c.destaque : comTransparencia(c.destaque, 0.35))),
            borderRadius: 6,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        ...base,
        indexAxis: 'y',
        plugins: { ...base.plugins, tooltip: { ...base.plugins.tooltip, callbacks: { label: (i) => `${formatar.moeda(Number(i.raw))} por hora` } } },
        scales: { x: eixoValores(c, (v) => formatar.moeda(v)), y: eixoCategorias },
      },
    }
  }

  const enfermagem = dadosGraficosEnfermagem()

  if (chave === 'enfermagem-taxas') {
    return {
      type: 'line',
      data: {
        labels: enfermagem.rotulos,
        datasets: [
          {
            label: 'Quedas',
            data: enfermagem.quedas,
            borderColor: c.destaque,
            backgroundColor: c.destaque,
            pointStyle: 'circle',
            pointRadius: 4,
            borderWidth: 2.5,
          },
          {
            label: 'Lesão por pressão',
            data: enfermagem.lesao,
            borderColor: c.textoSuave,
            backgroundColor: c.textoSuave,
            borderDash: [6, 4],
            pointStyle: 'rect',
            pointRadius: 4,
            borderWidth: 2,
          },
        ],
      },
      options: {
        ...base,
        plugins: {
          ...base.plugins,
          legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxHeight: 8, padding: 16 } },
          tooltip: { ...base.plugins.tooltip, callbacks: { label: (i) => `${i.dataset.label}: ${formatar.decimal1(Number(i.raw))}` } },
        },
        scales: { x: eixoCategorias, y: { ...eixoValores(c, (v) => formatar.decimal1(v)), suggestedMax: 3 } },
      },
    }
  }

  return {
    type: 'bar',
    data: {
      labels: enfermagem.rotulos,
      datasets: [
        {
          type: 'bar',
          label: 'Adesão',
          data: enfermagem.higiene,
          backgroundColor: enfermagem.higiene.map((v) => (v >= enfermagem.metaHigiene ? c.destaque : comTransparencia(c.destaque, 0.35))),
          borderRadius: 6,
          maxBarThickness: 40,
          order: 2,
        },
        {
          type: 'line',
          label: `Meta (${enfermagem.metaHigiene}%)`,
          data: enfermagem.rotulos.map(() => enfermagem.metaHigiene),
          borderColor: c.texto,
          borderDash: [4, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          order: 1,
        },
      ],
    },
    options: {
      ...base,
      plugins: {
        ...base.plugins,
        // A legenda mostra só a linha da meta; as barras já têm título no gráfico.
        legend: { display: true, position: 'bottom', labels: { boxHeight: 8, padding: 16, filter: (item) => item.datasetIndex === 1 } },
        tooltip: { ...base.plugins.tooltip, callbacks: { label: (i) => `${i.dataset.label}: ${formatar.inteiro(Number(i.raw))}%` } },
      },
      scales: { x: eixoCategorias, y: { ...eixoValores(c, (v) => `${formatar.inteiro(v)}%`), max: 100 } },
    },
  }
}

export function criarGrafico(canvas: HTMLCanvasElement, chave: ChaveGrafico) {
  return new Chart(canvas, configuracao(chave))
}
