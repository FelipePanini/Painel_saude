import type { ConfiguracaoNicho, Filtros, Mes, Registro, ResumoIndicador, Setor } from '../tipos/dominio'
import { criarFonteFicticia } from './ficticia'

/**
 * A única porta por onde as telas leem dados.
 * Fase 1: implementação fictícia (./ficticia.ts).
 * Fase 2: implementação real (IndexedDB e cálculos da SPEC), sem mudar as telas.
 */
export interface FonteDeDados {
  nicho(): ConfiguracaoNicho
  setores(): Promise<Setor[]>
  /** Meses que têm pelo menos um registro, do mais antigo ao mais recente. */
  meses(): Promise<Mes[]>
  registros(filtros?: Partial<Filtros>): Promise<Registro[]>
  /** Um resumo por indicador, com valor do mês, valor do mês anterior, meta e série. */
  resumo(filtros: Filtros): Promise<ResumoIndicador[]>
  /** Até 3 frases em linguagem simples sobre o que mudou. */
  frases(filtros: Filtros): Promise<string[]>
  /**
   * "ZZ-FICTICIO" quando os dados carregados são fictícios. O script da vitrine só tira
   * capturas quando vê esse marcador, para nenhuma imagem pública mostrar dado real.
   */
  marcador(): string | null
}

export const fonteDeDados: FonteDeDados = criarFonteFicticia()
