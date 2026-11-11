import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { formatar } from '../formatar'
import type { ResumoIndicador } from '../tipos/dominio'
import { duracaoDoToken } from './movimento'

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip)

/**
 * Gráfico de tendência de um indicador, com a linha da meta.
 * As cores e a fonte vêm dos tokens CSS lidos no próprio canvas, então seguem o tema.
 * A fase 2 acrescenta o resumo em texto completo e a visão "Ver como tabela".
 */
export function graficoTendencia(canvas: HTMLCanvasElement, resumo: ResumoIndicador): Chart {
  const estilo = getComputedStyle(canvas)
  const token = (nome: string) => estilo.getPropertyValue(nome).trim()
  const { indicador, serie } = resumo
  const duracao = duracaoDoToken(canvas, '--duracao-lenta')
  const meta = indicador.meta?.valor

  const numeros = serie.map((s) => s.valor).filter((v): v is number => v !== null)
  // Limites e passo do eixo em números redondos, para as marcas baterem com os rótulos.
  const menor = Math.min(...numeros, meta ?? Infinity)
  const maior = Math.max(...numeros, meta ?? -Infinity)
  const eixo =
    indicador.formato === 'percentual'
      ? { min: Math.max(0, Math.floor((menor - 3) / 10) * 10), max: Math.min(100, Math.ceil((maior + 1) / 10) * 10), passo: 10 }
      : { min: 0, max: Math.ceil((maior * 1.2) / 0.5) * 0.5, passo: maior * 1.2 > 2 ? 1 : 0.5 }
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    `${indicador.nome}, ${indicador.unidade}, de ${formatar.mes(serie[0]!.mes)} a ${formatar.mes(serie[serie.length - 1]!.mes)}: ` +
      serie.map((s) => `${formatar.mes(s.mes)}, ${s.valor === null ? 'sem dados' : formatar.indicador(indicador, s.valor)}`).join('; ') +
      (meta === undefined ? '.' : `. Meta: ${formatar.indicador(indicador, meta)}.`),
  )

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: serie.map((s) => formatar.mesCurto(s.mes)),
      datasets: [
        {
          label: indicador.nome,
          data: serie.map((s) => s.valor),
          borderColor: token('--cor-destaque'),
          backgroundColor: token('--cor-destaque'),
          borderWidth: 2.5,
          pointRadius: serie.map((_, i) => (i === serie.length - 1 ? 5 : 0)),
          pointHoverRadius: 5,
          spanGaps: false,
        },
        ...(meta === undefined
          ? []
          : [
              {
                label: 'Meta',
                data: serie.map(() => meta),
                borderColor: token('--cor-texto-suave'),
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                pointHoverRadius: 0,
              },
            ]),
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: duracao === 0 ? false : { duration: duracao },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        tooltip: {
          displayColors: false,
          callbacks: { label: (item) => `${item.dataset.label}: ${formatar.indicador(indicador, Number(item.raw))}` },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: token('--cor-texto-suave'), font: { family: token('--fonte-texto'), size: 12 }, maxRotation: 0, autoSkipPadding: 12 } },
        y: {
          border: { display: false },
          grid: { color: token('--cor-borda') },
          min: eixo.min,
          max: eixo.max,
          ticks: { color: token('--cor-texto-suave'), font: { family: token('--fonte-texto'), size: 12 }, stepSize: eixo.passo, callback: (v) => formatar.indicador(indicador, Number(v)) },
        },
      },
    },
  })
}
