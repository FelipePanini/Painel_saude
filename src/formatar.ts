import type { Indicador, Mes } from './tipos/dominio'

// Formatação em português do Brasil, usada pelas telas e pelas frases.

const decimal1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

const nomesDosMeses = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export const formatar = {
  decimal1: (v: number) => decimal1.format(v),
  inteiro: (v: number) => inteiro.format(v),
  /** Valor de um indicador, do jeito que ele aparece na tela: "1,2" ou "76%". */
  indicador: (indicador: Pick<Indicador, 'formato'>, valor: number) =>
    indicador.formato === 'percentual' ? `${inteiro.format(valor)}%` : decimal1.format(valor),
  /** "outubro" */
  mes: (mes: Mes) => nomesDosMeses[Number(mes.slice(5, 7)) - 1] ?? mes,
  /** "out" */
  mesCurto: (mes: Mes) => (nomesDosMeses[Number(mes.slice(5, 7)) - 1] ?? mes).slice(0, 3),
  /** "outubro de 2026" */
  mesComAno: (mes: Mes) => `${formatar.mes(mes)} de ${mes.slice(0, 4)}`,
}

export const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

/** Arredonda como a tela mostra, para comparar com a meta sem divergência entre número e selo. */
export const arredondarComoATela = (indicador: Pick<Indicador, 'formato'>, valor: number) =>
  indicador.formato === 'percentual' ? Math.round(valor) : Math.round(valor * 10) / 10
