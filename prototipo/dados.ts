// Dados FICTÍCIOS do protótipo das entrevistas. Hospitais, unidade e números são inventados.
// ZZ-FICTICIO

export interface Plantao {
  data: string // dd/mm/aaaa
  hospital: string
  horas: number
  valor: number // reais
  pago: boolean
  pagamentoPrevisto: string // dd/mm/aaaa
}

export interface Hospital {
  nome: string
  horasPorPlantao: number
  valorPorPlantao: number
  diaDoPagamento: number // dia do mês seguinte
}

export const hospitais: Hospital[] = [
  { nome: 'Hospital Vale Verde', horasPorPlantao: 12, valorPorPlantao: 1320, diaDoPagamento: 5 },
  { nome: 'Hospital Monte Claro', horasPorPlantao: 12, valorPorPlantao: 1200, diaDoPagamento: 10 },
  { nome: 'Clínica Bela Vista', horasPorPlantao: 6, valorPorPlantao: 510, diaDoPagamento: 15 },
]

export const mesesPlantao = [
  { numero: 8, nome: 'agosto' },
  { numero: 9, nome: 'setembro' },
  { numero: 10, nome: 'outubro' },
]

// Dias de plantão de cada hospital em cada mês de 2026.
const escala: Record<string, Record<number, number[]>> = {
  'Hospital Vale Verde': { 8: [3, 10, 17, 24], 9: [7, 14, 21, 28], 10: [5, 12, 19, 26, 30] },
  'Hospital Monte Claro': { 8: [6, 13, 27], 9: [2, 9, 16, 23], 10: [7, 14, 21, 28] },
  'Clínica Bela Vista': { 8: [1, 8, 15, 22], 9: [5, 19, 26], 10: [10, 24] },
}

// Plantões de setembro no Monte Claro ainda não pagos (o pagamento era em 10/10).
const naoPagos = new Set(['16/09/2026|Hospital Monte Claro', '23/09/2026|Hospital Monte Claro'])

// Data de referência do protótipo: o painel é visto como se fosse 31/10/2026.
export const hoje = '31/10/2026'

const doisDigitos = (n: number) => String(n).padStart(2, '0')

export const plantoes: Plantao[] = hospitais.flatMap((hospital) =>
  mesesPlantao.flatMap(({ numero: mes }) =>
    (escala[hospital.nome]?.[mes] ?? []).map((dia) => {
      const data = `${doisDigitos(dia)}/${doisDigitos(mes)}/2026`
      const pagamentoPrevisto = `${doisDigitos(hospital.diaDoPagamento)}/${doisDigitos(mes + 1)}/2026`
      // Plantões de outubro só são pagos em novembro, então ainda estão em aberto (sem atraso).
      const jaPago = mes < 10 && !naoPagos.has(`${data}|${hospital.nome}`)
      return {
        data,
        hospital: hospital.nome,
        horas: hospital.horasPorPlantao,
        valor: hospital.valorPorPlantao,
        pago: jaPago,
        pagamentoPrevisto,
      }
    }),
  ),
)

export interface MesUnidade {
  mes: string
  pacientesDia: number
  quedas: number
  lesoesPorPressao: number // casos novos no mês
  higieneObservacoes: number
  higieneConformes: number
}

export const unidade = {
  nome: 'Clínica Médica, 3º andar',
  metas: {
    quedasPorMil: 1.5, // no máximo
    lesaoPorMil: 1.0, // no máximo
    higienePercentual: 80, // no mínimo
  },
  meses: [
    { mes: 'maio', pacientesDia: 820, quedas: 1, lesoesPorPressao: 1, higieneObservacoes: 200, higieneConformes: 156 },
    { mes: 'junho', pacientesDia: 790, quedas: 1, lesoesPorPressao: 1, higieneObservacoes: 200, higieneConformes: 162 },
    { mes: 'julho', pacientesDia: 845, quedas: 2, lesoesPorPressao: 0, higieneObservacoes: 200, higieneConformes: 166 },
    { mes: 'agosto', pacientesDia: 860, quedas: 2, lesoesPorPressao: 1, higieneObservacoes: 200, higieneConformes: 160 },
    { mes: 'setembro', pacientesDia: 830, quedas: 2, lesoesPorPressao: 1, higieneObservacoes: 200, higieneConformes: 154 },
    { mes: 'outubro', pacientesDia: 850, quedas: 1, lesoesPorPressao: 1, higieneObservacoes: 200, higieneConformes: 152 },
  ] satisfies MesUnidade[],
}
