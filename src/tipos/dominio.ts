// Tipos do domínio. As telas e a fonte de dados conversam só por estes tipos.
// A fase 2 troca a implementação da fonte de dados sem mudar nada aqui.

/** Mês no formato aaaa-mm, por exemplo "2026-10". */
export type Mes = string

/** Campo de entrada: uma contagem ou medida base que a pessoa lança ou importa. */
export interface Campo {
  id: string
  rotulo: string
  ajuda: string
  /** Outros nomes que a coluna costuma ter nas planilhas. */
  sinonimos: string[]
}

export type Sentido = 'menor-melhor' | 'maior-melhor'

export interface Meta {
  valor: number
  /** "ate": bom quando fica igual ou abaixo. "minimo": bom quando fica igual ou acima. */
  tipo: 'ate' | 'minimo'
}

export type Grupo = 'assistencia' | 'qualidade' | 'operacao'

export interface Indicador {
  id: string
  nome: string
  /** Área de gestão a que o indicador pertence. */
  grupo: Grupo
  /** Texto curto que acompanha o número, por exemplo "por 1.000 pacientes-dia". */
  unidade: string
  /** "taxa" mostra uma casa decimal; "percentual" mostra número inteiro com %. */
  formato: 'taxa' | 'percentual'
  sentido: Sentido
  meta?: Meta
  /** Fórmula em linguagem simples. */
  formula: string
  /** Texto do "O que é isso?". */
  oQueE: string
}

export interface ConfiguracaoNicho {
  id: string
  nome: string
  campos: Campo[]
  indicadores: Indicador[]
}

export interface Setor {
  id: string
  nome: string
}

/** Um registro guarda os números de um setor num mês. Nunca dados de uma pessoa. */
export interface Registro {
  mes: Mes
  setorId: string
  valores: Record<string, number>
  /** Nome da planilha de origem ou "lançamento manual". */
  origem: string
}

export interface Filtros {
  mes: Mes
  /** "todos" soma os setores. */
  setorId: string | 'todos'
}

export type Situacao = 'dentro-da-meta' | 'fora-da-meta' | 'sem-meta'

export interface ResumoIndicador {
  indicador: Indicador
  /** null quando faltam dados no período. */
  valor: number | null
  valorAnterior: number | null
  situacao: Situacao
  /** Valores dos últimos meses, do mais antigo ao mais recente. null = mês sem dados. */
  serie: { mes: Mes; valor: number | null }[]
}

export interface VisaoSalva {
  id: string
  nome: string
  indicadores: string[]
  filtros: Filtros
}
