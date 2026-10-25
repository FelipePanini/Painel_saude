// Cálculos do protótipo. Todo número e toda frase saem daqui, a partir dos dados fictícios,
// para que cartões, frases e gráficos nunca se contradigam.
import { hoje, hospitais, mesesPlantao, plantoes, unidade, type Plantao } from './dados'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const moedaCentavos = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const decimal1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

export const formatar = {
  moeda: (v: number) => moeda.format(v),
  moedaCentavos: (v: number) => moedaCentavos.format(v),
  decimal1: (v: number) => decimal1.format(v),
  inteiro: (v: number) => inteiro.format(v),
}

export type Situacao = 'ok' | 'atencao'

export interface Cartao {
  rotulo: string
  valor: string
  unidade?: string
  comparacao?: string
  situacao?: { tipo: Situacao; texto: string }
}

export interface Grafico {
  titulo: string
  resumo: string
  descricao: string // texto para leitor de tela, com todos os números
}

export interface Painel {
  titulo: string
  periodo: string
  cartoes: Cartao[]
  frases: string[]
  graficos: [Grafico, Grafico]
}

// ---------- utilidades ----------

const paraData = (ddmmaaaa: string) => {
  const [d, m, a] = ddmmaaaa.split('/').map(Number)
  return new Date(a!, m! - 1, d!)
}

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

const artigo = (nome: string) => (nome.startsWith('Clínica') ? 'a' : 'o')

const nomeCurto = (nome: string) => nome.replace(/^(Hospital|Clínica) /, '')

// "no Vale Verde", "na Bela Vista"
const noOuNa = (nome: string) => `${artigo(nome) === 'a' ? 'na' : 'no'} ${nomeCurto(nome)}`

const quantos = (n: number) => (n === 1 ? 'um' : n === 2 ? 'dois' : String(n))

const plantoesPorExtenso = (n: number) => `${quantos(n)} ${n === 1 ? 'plantão' : 'plantões'}`

const ordinais = ['', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto']

const aMaisOuMenos = (diferenca: number, formatado: string) =>
  diferenca >= 0 ? `${formatado} a mais` : `${formatado} a menos`

// ---------- plantonista ----------

export function resumoDoMes(mes: number, lista: Plantao[] = plantoes) {
  const doMes = lista.filter((p) => paraData(p.data).getMonth() + 1 === mes)
  const total = doMes.reduce((soma, p) => soma + p.valor, 0)
  const horas = doMes.reduce((soma, p) => soma + p.horas, 0)
  const porHospital = new Map(
    hospitais.map((h) => {
      const doHospital = doMes.filter((p) => p.hospital === h.nome)
      return [h.nome, { plantoes: doHospital.length, total: doHospital.reduce((s, p) => s + p.valor, 0) }]
    }),
  )
  return { total, horas, plantoes: doMes.length, valorHora: horas ? total / horas : 0, porHospital }
}

export function pagamentosAtrasados(lista: Plantao[] = plantoes, referencia = hoje) {
  const dataReferencia = paraData(referencia)
  return lista.filter((p) => !p.pago && paraData(p.pagamentoPrevisto) < dataReferencia)
}

export function valorHoraPorHospital() {
  return hospitais.map((h) => ({ nome: h.nome, valorHora: h.valorPorPlantao / h.horasPorPlantao }))
}

export function painelPlantonista(): Painel {
  const [mesAnterior, mesAtual] = mesesPlantao.slice(-2) as [(typeof mesesPlantao)[number], (typeof mesesPlantao)[number]]
  const atual = resumoDoMes(mesAtual.numero)
  const anterior = resumoDoMes(mesAnterior.numero)
  const atrasados = pagamentosAtrasados()
  const totalAtrasado = atrasados.reduce((s, p) => s + p.valor, 0)
  const porHora = valorHoraPorHospital().sort((a, b) => b.valorHora - a.valorHora)
  const maisPaga = porHora[0]!
  const menosPaga = porHora[porHora.length - 1]!

  // Frase 1: o que explica a diferença do total
  const diferencaTotal = atual.total - anterior.total
  const variacoes = hospitais.map((h) => {
    const a = atual.porHospital.get(h.nome)!
    const b = anterior.porHospital.get(h.nome)!
    return { nome: h.nome, plantoes: a.plantoes - b.plantoes, valor: a.total - b.total }
  })
  const maiorAlta = [...variacoes].sort((a, b) => b.valor - a.valor)[0]!
  const maiorQueda = [...variacoes].sort((a, b) => a.valor - b.valor)[0]!
  let frase1 = `${capitalizar(mesAtual.nome)} rendeu ${aMaisOuMenos(diferencaTotal, formatar.moeda(Math.abs(diferencaTotal)))} que ${mesAnterior.nome}.`
  if (maiorAlta.valor > 0 && maiorQueda.valor < 0) {
    frase1 += ` Você fez ${plantoesPorExtenso(maiorAlta.plantoes)} a mais ${noOuNa(maiorAlta.nome)} (${formatar.moeda(maiorAlta.valor)}) e ${quantos(-maiorQueda.plantoes)} a menos ${noOuNa(maiorQueda.nome)} (${formatar.moeda(-maiorQueda.valor)}).`
  }

  // Frase 2: quem paga mais por hora
  const frase2 = `${capitalizar(artigo(maisPaga.nome))} ${maisPaga.nome} paga ${formatar.moeda(maisPaga.valorHora)} por hora, ${formatar.moeda(maisPaga.valorHora - menosPaga.valorHora)} a mais que ${artigo(menosPaga.nome)} ${menosPaga.nome}.`

  // Frase 3: pagamentos atrasados
  const hospitaisAtrasados = [...new Set(atrasados.map((p) => p.hospital))]
  const previsto = atrasados[0]?.pagamentoPrevisto.slice(0, 5)
  const frase3 = atrasados.length
    ? `${capitalizar(plantoesPorExtenso(atrasados.length))} de ${mesAnterior.nome} ${hospitaisAtrasados.map(noOuNa).join(' e ')} ainda não ${atrasados.length === 1 ? 'foi pago' : 'foram pagos'}. São ${formatar.moeda(totalAtrasado)} que deviam ter caído em ${previsto}.`
    : 'Nenhum pagamento atrasado.'

  const totaisPorMes = mesesPlantao.map((m) => ({ mes: m.nome, total: resumoDoMes(m.numero).total }))
  const maiorMes = [...totaisPorMes].sort((a, b) => b.total - a.total)[0]!

  return {
    titulo: 'Seus plantões',
    periodo: `${capitalizar(mesAtual.nome)} de 2026, comparado a ${mesAnterior.nome}`,
    cartoes: [
      {
        rotulo: `Total de ${mesAtual.nome}`,
        valor: formatar.moeda(atual.total),
        unidade: `${atual.plantoes} plantões`,
        comparacao: `${aMaisOuMenos(diferencaTotal, formatar.moeda(Math.abs(diferencaTotal)))} que em ${mesAnterior.nome}`,
      },
      {
        rotulo: 'Horas trabalhadas',
        valor: `${formatar.inteiro(atual.horas)} h`,
        comparacao: `${aMaisOuMenos(atual.horas - anterior.horas, `${formatar.inteiro(Math.abs(atual.horas - anterior.horas))} h`)} que em ${mesAnterior.nome}`,
      },
      {
        rotulo: 'Valor médio por hora',
        valor: formatar.moedaCentavos(atual.valorHora),
        comparacao: `${aMaisOuMenos(atual.valorHora - anterior.valorHora, formatar.moedaCentavos(Math.abs(atual.valorHora - anterior.valorHora)))} que em ${mesAnterior.nome}`,
      },
      {
        rotulo: 'Pagamentos atrasados',
        valor: formatar.moeda(totalAtrasado),
        unidade: atrasados.length === 1 ? '1 plantão' : `${atrasados.length} plantões`,
        situacao: atrasados.length
          ? { tipo: 'atencao', texto: `Venceu em ${previsto}` }
          : { tipo: 'ok', texto: 'Tudo em dia' },
      },
    ],
    frases: [frase1, frase2, frase3],
    graficos: [
      {
        titulo: 'Total por mês',
        resumo: `${capitalizar(maiorMes.mes)} foi o melhor dos três meses.`,
        descricao: `Gráfico de barras com o total por mês: ${totaisPorMes.map((t) => `${t.mes}, ${formatar.moeda(t.total)}`).join('; ')}.`,
      },
      {
        titulo: 'Valor por hora em cada hospital',
        resumo: `${capitalizar(artigo(maisPaga.nome))} ${nomeCurto(maisPaga.nome)} paga mais por hora.`,
        descricao: `Gráfico de barras com o valor por hora: ${porHora.map((h) => `${h.nome}, ${formatar.moeda(h.valorHora)}`).join('; ')}.`,
      },
    ],
  }
}

export function dadosGraficosPlantonista() {
  return {
    totalPorMes: mesesPlantao.map((m) => ({ rotulo: capitalizar(m.nome.slice(0, 3)), valor: resumoDoMes(m.numero).total })),
    valorHora: valorHoraPorHospital().map((h) => ({ rotulo: nomeCurto(h.nome), valor: h.valorHora })),
  }
}

// ---------- gestão de enfermagem ----------

export const porMil = (casos: number, pacientesDia: number) => (casos / pacientesDia) * 1000
export const percentual = (parte: number, total: number) => (parte / total) * 100

export function indicadoresDoMes(indice: number) {
  const m = unidade.meses[indice]!
  return {
    mes: m.mes,
    pacientesDia: m.pacientesDia,
    lesoesPorPressao: m.lesoesPorPressao,
    quedas: porMil(m.quedas, m.pacientesDia),
    lesao: porMil(m.lesoesPorPressao, m.pacientesDia),
    higiene: percentual(m.higieneConformes, m.higieneObservacoes),
  }
}

export function serieDaUnidade() {
  return unidade.meses.map((_, i) => indicadoresDoMes(i))
}

export function painelEnfermagem(): Painel {
  const serie = serieDaUnidade()
  const atual = serie[serie.length - 1]!
  const anterior = serie[serie.length - 2]!
  const { metas } = unidade
  const arred = (v: number) => Math.round(v * 10) / 10

  const quedasOk = arred(atual.quedas) <= metas.quedasPorMil
  const quedasAntesOk = arred(anterior.quedas) <= metas.quedasPorMil
  const lesaoOk = arred(atual.lesao) <= metas.lesaoPorMil
  const higieneOk = Math.round(atual.higiene) >= metas.higienePercentual

  // Frase 1: quedas
  const subiuOuCaiu = atual.quedas < anterior.quedas ? 'caiu' : atual.quedas > anterior.quedas ? 'subiu' : 'ficou'
  let frase1 = `A taxa de quedas ${subiuOuCaiu} de ${formatar.decimal1(anterior.quedas)} para ${formatar.decimal1(atual.quedas)} por 1.000 pacientes-dia`
  if (quedasOk && !quedasAntesOk) frase1 += ` e voltou a ficar dentro da meta (até ${formatar.decimal1(metas.quedasPorMil)}).`
  else if (!quedasOk && quedasAntesOk) frase1 += ` e passou da meta (até ${formatar.decimal1(metas.quedasPorMil)}).`
  else frase1 += '.'

  // Frase 2: higiene das mãos, contando os meses seguidos abaixo da meta
  let mesesAbaixo = 0
  for (let i = serie.length - 1; i >= 0 && Math.round(serie[i]!.higiene) < metas.higienePercentual; i--) mesesAbaixo++
  const frase2 = higieneOk
    ? `A adesão à higiene das mãos ficou em ${formatar.inteiro(atual.higiene)}%, dentro da meta de ${metas.higienePercentual}%.`
    : `A adesão à higiene das mãos ficou em ${formatar.inteiro(atual.higiene)}%, abaixo da meta de ${metas.higienePercentual}%${mesesAbaixo > 1 ? ` pelo ${ordinais[mesesAbaixo] ?? `${mesesAbaixo}º`} mês seguido` : ''}.`

  // Frase 3: lesão por pressão, contando os meses com o mesmo número de casos
  const iguais: string[] = []
  for (let i = serie.length - 2; i >= 0 && serie[i]!.lesoesPorPressao === atual.lesoesPorPressao; i--) iguais.unshift(serie[i]!.mes)
  const casos = atual.lesoesPorPressao === 1 ? '1 caso novo' : `${atual.lesoesPorPressao} casos novos`
  const comoAntes = iguais.length ? `, como em ${iguais.length > 1 ? `${iguais.slice(0, -1).join(', ')} e ${iguais[iguais.length - 1]}` : iguais[0]}` : ''
  const frase3 = `Houve ${casos} de lesão por pressão em ${atual.mes}${comoAntes}. A taxa ficou em ${formatar.decimal1(atual.lesao)} por 1.000 pacientes-dia e ${lesaoOk ? 'está dentro' : 'segue acima'} da meta (até ${formatar.decimal1(metas.lesaoPorMil)}).`

  const primeiro = serie[0]!

  return {
    titulo: 'Indicadores da unidade',
    periodo: `${unidade.nome} · ${capitalizar(atual.mes)} de 2026, comparado a ${anterior.mes}`,
    cartoes: [
      {
        rotulo: 'Quedas',
        valor: formatar.decimal1(atual.quedas),
        unidade: 'por 1.000 pacientes-dia',
        comparacao: `Em ${anterior.mes}: ${formatar.decimal1(anterior.quedas)}`,
        situacao: quedasOk
          ? { tipo: 'ok', texto: `Dentro da meta (até ${formatar.decimal1(metas.quedasPorMil)})` }
          : { tipo: 'atencao', texto: `Acima da meta (até ${formatar.decimal1(metas.quedasPorMil)})` },
      },
      {
        rotulo: 'Lesão por pressão',
        valor: formatar.decimal1(atual.lesao),
        unidade: 'por 1.000 pacientes-dia',
        comparacao: `Em ${anterior.mes}: ${formatar.decimal1(anterior.lesao)}`,
        situacao: lesaoOk
          ? { tipo: 'ok', texto: `Dentro da meta (até ${formatar.decimal1(metas.lesaoPorMil)})` }
          : { tipo: 'atencao', texto: `Acima da meta (até ${formatar.decimal1(metas.lesaoPorMil)})` },
      },
      {
        rotulo: 'Higiene das mãos',
        valor: `${formatar.inteiro(atual.higiene)}%`,
        unidade: 'de adesão',
        comparacao: `Em ${anterior.mes}: ${formatar.inteiro(anterior.higiene)}%`,
        situacao: higieneOk
          ? { tipo: 'ok', texto: `Dentro da meta (mínimo de ${metas.higienePercentual}%)` }
          : { tipo: 'atencao', texto: `Abaixo da meta (mínimo de ${metas.higienePercentual}%)` },
      },
      {
        rotulo: 'Pacientes-dia',
        valor: formatar.inteiro(atual.pacientesDia),
        unidade: `em ${atual.mes}`,
        comparacao: `Em ${anterior.mes}: ${formatar.inteiro(anterior.pacientesDia)}`,
      },
    ],
    frases: [frase1, frase2, frase3],
    graficos: [
      {
        titulo: 'Quedas e lesão por pressão',
        resumo: `Por 1.000 pacientes-dia, de ${primeiro.mes} a ${atual.mes}.`,
        descricao: `Gráfico de linhas por mês. Quedas por 1.000 pacientes-dia: ${serie.map((s) => `${s.mes}, ${formatar.decimal1(s.quedas)}`).join('; ')}. Lesão por pressão por 1.000 pacientes-dia: ${serie.map((s) => `${s.mes}, ${formatar.decimal1(s.lesao)}`).join('; ')}.`,
      },
      {
        titulo: 'Adesão à higiene das mãos',
        resumo: `Meta de ${metas.higienePercentual}% ou mais.`,
        descricao: `Gráfico de barras com a adesão por mês: ${serie.map((s) => `${s.mes}, ${formatar.inteiro(s.higiene)}%`).join('; ')}. Meta de ${metas.higienePercentual}%.`,
      },
    ],
  }
}

export function dadosGraficosEnfermagem() {
  const serie = serieDaUnidade()
  return {
    rotulos: serie.map((s) => capitalizar(s.mes.slice(0, 3))),
    quedas: serie.map((s) => Math.round(s.quedas * 10) / 10),
    lesao: serie.map((s) => Math.round(s.lesao * 10) / 10),
    higiene: serie.map((s) => Math.round(s.higiene)),
    metaHigiene: unidade.metas.higienePercentual,
  }
}
