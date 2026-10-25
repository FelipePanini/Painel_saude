import { describe, expect, it } from 'vitest'
import {
  indicadoresDoMes,
  pagamentosAtrasados,
  painelEnfermagem,
  painelPlantonista,
  resumoDoMes,
} from '../../prototipo/calculos'

// O Intl.NumberFormat separa "R$" do número com espaço não separável.
const texto = (frases: string[]) => frases.map((f) => f.replace(/\u00a0/g, ' '))

// Valores conferidos à mão a partir de prototipo/dados.ts.
describe('protótipo: plantonista', () => {
  it('soma os plantões de cada mês', () => {
    // agosto: 4×1.320 + 3×1.200 + 4×510; setembro: 4×1.320 + 4×1.200 + 3×510; outubro: 5×1.320 + 4×1.200 + 2×510
    expect(resumoDoMes(8).total).toBe(10920)
    expect(resumoDoMes(9).total).toBe(11610)
    expect(resumoDoMes(10).total).toBe(12420)
    expect(resumoDoMes(10).horas).toBe(120) // 5×12 + 4×12 + 2×6
    expect(resumoDoMes(10).valorHora).toBeCloseTo(103.5)
  })

  it('encontra os dois plantões atrasados do Monte Claro', () => {
    const atrasados = pagamentosAtrasados()
    expect(atrasados).toHaveLength(2)
    expect(atrasados.every((p) => p.hospital === 'Hospital Monte Claro')).toBe(true)
    expect(atrasados.reduce((s, p) => s + p.valor, 0)).toBe(2400)
  })

  it('gera três frases com os números certos', () => {
    const frases = texto(painelPlantonista().frases)
    expect(frases).toHaveLength(3)
    expect(frases[0]).toContain('R$ 810')
    expect(frases[1]).toContain('R$ 110')
    expect(frases[1]).toContain('R$ 25')
    expect(frases[2]).toContain('R$ 2.400')
  })
})

describe('protótipo: gestão de enfermagem', () => {
  it('calcula as taxas de outubro', () => {
    const outubro = indicadoresDoMes(5)
    expect(outubro.quedas).toBeCloseTo(1.18, 2) // 1 / 850 × 1.000
    expect(outubro.lesao).toBeCloseTo(1.18, 2)
    expect(outubro.higiene).toBe(76) // 152 / 200
  })

  it('marca a situação de cada meta', () => {
    const { cartoes } = painelEnfermagem()
    expect(cartoes[0]!.situacao?.tipo).toBe('ok') // quedas 1,2 ≤ 1,5
    expect(cartoes[1]!.situacao?.tipo).toBe('atencao') // lesão 1,2 > 1,0
    expect(cartoes[2]!.situacao?.tipo).toBe('atencao') // higiene 76% < 80%
  })

  it('gera três frases com os números certos', () => {
    const frases = texto(painelEnfermagem().frases)
    expect(frases[0]).toContain('2,4 para 1,2')
    expect(frases[1]).toContain('76%')
    expect(frases[1]).toContain('segundo mês seguido')
    expect(frases[2]).toContain('agosto e setembro')
  })
})
