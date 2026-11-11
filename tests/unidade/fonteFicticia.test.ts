import { describe, expect, it } from 'vitest'
import { fonteDeDados } from '../../src/fonte-de-dados'

// A fonte fictícia da fase 1 precisa cobrir os estados que as telas mostram.
describe('fonte de dados fictícia', () => {
  it('tem 12 meses e 6 setores', async () => {
    expect(await fonteDeDados.meses()).toHaveLength(12)
    expect(await fonteDeDados.setores()).toHaveLength(6)
  })

  it('devolve um resumo por indicador, com 12 meses de série', async () => {
    const resumo = await fonteDeDados.resumo({ mes: '2026-10', setorId: 'todos' })
    expect(resumo.map((r) => r.indicador.id)).toEqual(['quedas', 'lesao', 'higiene', 'ocupacao'])
    for (const item of resumo) {
      expect(item.valor).not.toBeNull()
      expect(item.serie).toHaveLength(12)
    }
  })

  it('tem um mês faltando: o Pronto-Socorro em março de 2026', async () => {
    const resumo = await fonteDeDados.resumo({ mes: '2026-03', setorId: 'pronto-socorro' })
    expect(resumo.every((r) => r.valor === null)).toBe(true)
    const frases = await fonteDeDados.frases({ mes: '2026-03', setorId: 'todos' })
    expect(frases[0]).toContain('Pronto-Socorro ainda não lançou os números de março')
  })

  it('tem um setor novo: a Maternidade só tem dados a partir de agosto de 2026', async () => {
    const antes = await fonteDeDados.registros({ mes: '2026-07', setorId: 'maternidade' })
    const depois = await fonteDeDados.registros({ mes: '2026-08', setorId: 'maternidade' })
    expect(antes).toHaveLength(0)
    expect(depois).toHaveLength(1)
  })

  it('gera no máximo 3 frases, sem dinheiro e sem nomes de pessoas', async () => {
    const frases = await fonteDeDados.frases({ mes: '2026-10', setorId: 'todos' })
    expect(frases.length).toBeGreaterThan(0)
    expect(frases.length).toBeLessThanOrEqual(3)
    expect(frases.join(' ')).not.toMatch(/R\$|reais/)
  })
})
