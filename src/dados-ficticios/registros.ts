import type { Mes, Registro, Setor } from '../tipos/dominio'

// Dados FICTÍCIOS. Setores, números e meses são inventados. ZZ-FICTICIO
// Só a fonte de dados fictícia importa este arquivo; as telas nunca importam daqui.

export const setoresFicticios: Setor[] = [
  { id: 'clinica-medica', nome: 'Clínica Médica' },
  { id: 'clinica-cirurgica', nome: 'Clínica Cirúrgica' },
  { id: 'uti-adulto', nome: 'UTI Adulto' },
  { id: 'pediatria', nome: 'Pediatria' },
  { id: 'pronto-socorro', nome: 'Pronto-Socorro' },
  // Setor novo: só tem dados a partir de agosto de 2026.
  { id: 'maternidade', nome: 'Maternidade' },
]

/** Doze meses, de novembro de 2025 a outubro de 2026. */
export const mesesFicticios: Mes[] = [
  '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04',
  '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10',
]

interface Perfil {
  leitos: number
  ocupacao: number
  /** Quedas esperadas por 1.000 pacientes-dia. */
  quedas: number
  lesoes: number
  /** Adesão à higiene das mãos, de 0 a 1. */
  higiene: number
  inicio?: Mes
}

const perfis: Record<string, Perfil> = {
  'clinica-medica': { leitos: 32, ocupacao: 0.86, quedas: 1.7, lesoes: 1.1, higiene: 0.77 },
  'clinica-cirurgica': { leitos: 28, ocupacao: 0.78, quedas: 1.1, lesoes: 0.6, higiene: 0.82 },
  'uti-adulto': { leitos: 12, ocupacao: 0.91, quedas: 0.4, lesoes: 2.2, higiene: 0.85 },
  pediatria: { leitos: 18, ocupacao: 0.64, quedas: 0.7, lesoes: 0.2, higiene: 0.84 },
  'pronto-socorro': { leitos: 22, ocupacao: 0.95, quedas: 2.1, lesoes: 0.5, higiene: 0.68 },
  maternidade: { leitos: 16, ocupacao: 0.71, quedas: 0.5, lesoes: 0.1, higiene: 0.81, inicio: '2026-08' },
}

// O Pronto-Socorro não lançou os números de março de 2026: serve para mostrar o estado "mês faltando".
const faltando = new Set(['pronto-socorro|2026-03'])

// Gerador simples e repetível: os mesmos números em toda execução, para os testes e as screenshots.
function sorteio(semente: number) {
  let estado = semente
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296
    return estado / 4294967296
  }
}

const diasNoMes = (mes: Mes) => {
  const [ano, m] = mes.split('-').map(Number)
  return new Date(ano!, m!, 0).getDate()
}

function gerar(): Registro[] {
  const registros: Registro[] = []
  setoresFicticios.forEach((setor, indiceSetor) => {
    const perfil = perfis[setor.id]!
    const acaso = sorteio(1000 + indiceSetor * 77)
    mesesFicticios.forEach((mes, indiceMes) => {
      const varia = (amplitude: number) => 1 + (acaso() - 0.5) * 2 * amplitude
      if (perfil.inicio && mes < perfil.inicio) return
      if (faltando.has(`${setor.id}|${mes}`)) return
      // Tendências leves ao longo do ano, para as frases terem o que contar.
      const progresso = indiceMes / (mesesFicticios.length - 1)
      const melhoraQuedas = setor.id === 'clinica-medica' ? 1 - 0.35 * progresso : 1
      const pioraHigiene = setor.id === 'pronto-socorro' ? 1 - 0.08 * progresso : 1

      const leitosDia = perfil.leitos * diasNoMes(mes)
      const pacientesDia = Math.round(leitosDia * Math.min(0.99, perfil.ocupacao * varia(0.05)))
      const oportunidades = 180 + Math.round(acaso() * 60)
      registros.push({
        mes,
        setorId: setor.id,
        origem: indiceMes % 3 === 0 ? 'lançamento manual' : 'indicadores-FICTICIO.xlsx',
        valores: {
          pacientes_dia: pacientesDia,
          leitos_dia: leitosDia,
          quedas: Math.max(0, Math.round((pacientesDia / 1000) * perfil.quedas * melhoraQuedas * varia(0.45))),
          lesoes_novas: Math.max(0, Math.round((pacientesDia / 1000) * perfil.lesoes * varia(0.5))),
          higiene_oportunidades: oportunidades,
          higiene_realizadas: Math.round(oportunidades * Math.min(0.98, perfil.higiene * pioraHigiene * varia(0.05))),
        },
      })
    })
  })
  return registros
}

export const registrosFicticios: Registro[] = gerar()
