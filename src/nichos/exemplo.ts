import type { ConfiguracaoNicho } from '../tipos/dominio'

// Configuração de EXEMPLO de gestão de enfermagem, usada na fase 1.
// [VALIDAR COM A PROFESSORA]: nomes, fórmulas, metas e textos abaixo são provisórios.
// Quando existir docs/SPEC.md, esta configuração passa a seguir a SPEC.
export const nichoExemplo: ConfiguracaoNicho = {
  id: 'enfermagem-exemplo',
  nome: 'Gestão de enfermagem (exemplo)',
  campos: [
    { id: 'pacientes_dia', rotulo: 'Pacientes-dia', ajuda: 'Soma dos pacientes internados em cada dia do mês.', sinonimos: ['pacientes dia', 'paciente-dia', 'pac dia'] },
    { id: 'leitos_dia', rotulo: 'Leitos-dia', ajuda: 'Soma dos leitos disponíveis em cada dia do mês.', sinonimos: ['leitos dia', 'leito-dia', 'leitos operacionais'] },
    { id: 'quedas', rotulo: 'Quedas', ajuda: 'Número de quedas de pacientes registradas no mês.', sinonimos: ['queda', 'n quedas', 'quedas de paciente'] },
    { id: 'lesoes_novas', rotulo: 'Lesões por pressão (casos novos)', ajuda: 'Casos novos de lesão por pressão registrados no mês.', sinonimos: ['lpp', 'lesao por pressao', 'ulcera por pressao'] },
    { id: 'higiene_oportunidades', rotulo: 'Higiene das mãos: oportunidades observadas', ajuda: 'Quantas oportunidades de higiene das mãos foram observadas.', sinonimos: ['oportunidades', 'observacoes higiene'] },
    { id: 'higiene_realizadas', rotulo: 'Higiene das mãos: realizadas', ajuda: 'Em quantas das oportunidades observadas a higiene foi feita.', sinonimos: ['adesoes', 'higiene realizada', 'conformes'] },
  ],
  indicadores: [
    {
      id: 'quedas',
      grupo: 'assistencia', // [VALIDAR COM A PROFESSORA]
      nome: 'Quedas',
      unidade: 'por 1.000 pacientes-dia',
      formato: 'taxa',
      sentido: 'menor-melhor',
      meta: { valor: 1.5, tipo: 'ate' },
      formula: 'Número de quedas no mês, dividido pelos pacientes-dia, vezes 1.000.',
      oQueE: 'Mostra com que frequência os pacientes caem no setor. Quanto menor, melhor. [VALIDAR COM A PROFESSORA]',
    },
    {
      id: 'lesao',
      grupo: 'assistencia', // [VALIDAR COM A PROFESSORA]
      nome: 'Lesão por pressão',
      unidade: 'por 1.000 pacientes-dia',
      formato: 'taxa',
      sentido: 'menor-melhor',
      meta: { valor: 1.0, tipo: 'ate' },
      formula: 'Casos novos de lesão por pressão no mês, divididos pelos pacientes-dia, vezes 1.000.',
      oQueE: 'Mostra com que frequência surgem lesões por pressão novas no setor. Quanto menor, melhor. [VALIDAR COM A PROFESSORA]',
    },
    {
      id: 'higiene',
      grupo: 'qualidade', // [VALIDAR COM A PROFESSORA]
      nome: 'Higiene das mãos',
      unidade: 'de adesão',
      formato: 'percentual',
      sentido: 'maior-melhor',
      meta: { valor: 80, tipo: 'minimo' },
      formula: 'Oportunidades em que a higiene foi feita, divididas pelas oportunidades observadas, vezes 100.',
      oQueE: 'Mostra em quantas das oportunidades observadas a equipe higienizou as mãos. Quanto maior, melhor. [VALIDAR COM A PROFESSORA]',
    },
    {
      id: 'ocupacao',
      grupo: 'operacao', // [VALIDAR COM A PROFESSORA]
      nome: 'Ocupação de leitos',
      unidade: 'dos leitos ocupados',
      formato: 'percentual',
      sentido: 'maior-melhor',
      formula: 'Pacientes-dia divididos pelos leitos-dia, vezes 100.',
      oQueE: 'Mostra quanto dos leitos disponíveis ficou ocupado no mês. [VALIDAR COM A PROFESSORA]',
    },
  ],
}
