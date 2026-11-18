import { mesesFicticios, registrosFicticios, setoresFicticios } from '../dados-ficticios/registros'
import { arredondarComoATela, capitalizar, formatar } from '../formatar'
import { nichoExemplo } from '../nichos/exemplo'
import type { Filtros, Indicador, Mes, Registro, ResumoIndicador, Situacao } from '../tipos/dominio'
import type { FonteDeDados } from './index'

// Implementação FICTÍCIA da fonte de dados (fase 1).
// As contas abaixo são simples e servem só para o visual ter números coerentes.
// A fase 2 escreve os cálculos reais em src/indicadores/, seguindo a SPEC.

type Soma = Record<string, number>

function somar(registros: Registro[]): Soma | null {
  if (registros.length === 0) return null
  const soma: Soma = {}
  for (const registro of registros) {
    for (const [campo, valor] of Object.entries(registro.valores)) soma[campo] = (soma[campo] ?? 0) + valor
  }
  return soma
}

const dividir = (a: number | undefined, b: number | undefined, vezes: number) =>
  a === undefined || !b ? null : (a / b) * vezes

const calculos: Record<string, (s: Soma) => number | null> = {
  quedas: (s) => dividir(s.quedas, s.pacientes_dia, 1000),
  lesao: (s) => dividir(s.lesoes_novas, s.pacientes_dia, 1000),
  higiene: (s) => dividir(s.higiene_realizadas, s.higiene_oportunidades, 100),
  ocupacao: (s) => dividir(s.pacientes_dia, s.leitos_dia, 100),
}

function situacaoDe(indicador: Indicador, valor: number | null): Situacao {
  if (!indicador.meta || valor === null) return 'sem-meta'
  const mostrado = arredondarComoATela(indicador, valor)
  const dentro = indicador.meta.tipo === 'ate' ? mostrado <= indicador.meta.valor : mostrado >= indicador.meta.valor
  return dentro ? 'dentro-da-meta' : 'fora-da-meta'
}

const doFiltro = (mes: Mes, setorId: Filtros['setorId']) =>
  registrosFicticios.filter((r) => r.mes === mes && (setorId === 'todos' || r.setorId === setorId))

function valorDe(indicador: Indicador, mes: Mes, setorId: Filtros['setorId']): number | null {
  const soma = somar(doFiltro(mes, setorId))
  return soma ? (calculos[indicador.id]?.(soma) ?? null) : null
}

const textoDaMeta = (indicador: Indicador) =>
  indicador.meta
    ? indicador.meta.tipo === 'ate'
      ? `até ${formatar.indicador(indicador, indicador.meta.valor)}`
      : `mínimo de ${formatar.indicador(indicador, indicador.meta.valor)}`
    : ''

export function criarFonteFicticia(): FonteDeDados {
  const mesAnteriorA = (mes: Mes) => mesesFicticios[mesesFicticios.indexOf(mes) - 1] ?? null

  async function resumo(filtros: Filtros): Promise<ResumoIndicador[]> {
    const anterior = mesAnteriorA(filtros.mes)
    const ate = mesesFicticios.indexOf(filtros.mes)
    const mesesDaSerie = mesesFicticios.slice(0, ate + 1)
    return nichoExemplo.indicadores.map((indicador) => {
      const valor = valorDe(indicador, filtros.mes, filtros.setorId)
      return {
        indicador,
        valor,
        valorAnterior: anterior ? valorDe(indicador, anterior, filtros.setorId) : null,
        situacao: situacaoDe(indicador, valor),
        serie: mesesDaSerie.map((mes) => ({ mes, valor: valorDe(indicador, mes, filtros.setorId) })),
      }
    })
  }

  async function frases(filtros: Filtros): Promise<string[]> {
    const anterior = mesAnteriorA(filtros.mes)
    const candidatas: { peso: number; texto: string }[] = []

    for (const item of await resumo(filtros)) {
      const { indicador, valor, valorAnterior } = item
      if (valor === null || valorAnterior === null || !anterior) continue
      const agora = formatar.indicador(indicador, valor)
      const antes = formatar.indicador(indicador, valorAnterior)
      const nome = indicador.formato === 'percentual' ? `A ${indicador.nome.toLowerCase()}` : `A taxa de ${indicador.nome.toLowerCase()}`
      const situacaoAntes = situacaoDe(indicador, valorAnterior)
      const verbo = agora === antes ? 'ficou em' : valor > valorAnterior ? `subiu de ${antes} para` : `caiu de ${antes} para`

      if (item.situacao === 'dentro-da-meta' && situacaoAntes === 'fora-da-meta') {
        candidatas.push({ peso: 3, texto: `${nome} ${verbo} ${agora} e voltou a ficar dentro da meta (${textoDaMeta(indicador)}).` })
      } else if (item.situacao === 'fora-da-meta' && situacaoAntes === 'dentro-da-meta') {
        candidatas.push({ peso: 3, texto: `${nome} ${verbo} ${agora} e saiu da meta (${textoDaMeta(indicador)}).` })
      } else if (item.situacao === 'fora-da-meta') {
        // Conta há quantos meses seguidos o indicador está fora da meta.
        let seguidos = 0
        for (let i = item.serie.length - 1; i >= 0 && situacaoDe(indicador, item.serie[i]!.valor) === 'fora-da-meta'; i--) seguidos++
        const haQuanto = seguidos > 1 ? `, fora da meta há ${seguidos} meses seguidos` : ', fora da meta'
        candidatas.push({ peso: 2, texto: `${nome} ${verbo} ${agora}${haQuanto} (${textoDaMeta(indicador)}).` })
      } else if (agora !== antes) {
        candidatas.push({ peso: 1, texto: `${nome} ${verbo} ${agora}.` })
      }
    }

    if (filtros.setorId === 'todos') {
      const comDados = new Set(doFiltro(filtros.mes, 'todos').map((r) => r.setorId))
      // Só conta como "faltando" o setor que já lançava antes. Setor novo ainda não devia nada.
      const jaLancava = new Set(registrosFicticios.filter((r) => r.mes < filtros.mes).map((r) => r.setorId))
      const semDados = setoresFicticios.filter((s) => !comDados.has(s.id) && jaLancava.has(s.id))
      if (semDados.length > 0) {
        candidatas.push({ peso: 4, texto: `${semDados.map((s) => s.nome).join(' e ')} ainda não ${semDados.length === 1 ? 'lançou' : 'lançaram'} os números de ${formatar.mes(filtros.mes)}.` })
      }
    }

    return candidatas.sort((a, b) => b.peso - a.peso).slice(0, 3).map((c) => capitalizar(c.texto))
  }

  return {
    nicho: () => nichoExemplo,
    setores: async () => setoresFicticios,
    meses: async () => mesesFicticios,
    registros: async (filtros = {}) =>
      registrosFicticios.filter(
        (r) => (!filtros.mes || r.mes === filtros.mes) && (!filtros.setorId || filtros.setorId === 'todos' || r.setorId === filtros.setorId),
      ),
    resumo,
    frases,
    marcador: () => 'ZZ-FICTICIO',
  }
}
