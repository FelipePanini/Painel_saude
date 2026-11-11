// Galeria de componentes da fase 1: todas as peças do sistema de design, com dados fictícios.
// É por aqui que o Felipe revisa o design e que a fase 2 entende o sistema.
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '../src/estilos/tokens.css'
import '../src/estilos/base.css'
import '../src/estilos/componentes.css'
import '../src/estilos/navegacao.css'
import '../src/vidro/vidro.css'
import './galeria.css'
import type { Chart } from 'chart.js'
import { Database, Download, LayoutDashboard, Settings, Trash2, Upload } from 'lucide'
import { aviso, botao, campoTexto, chip, esqueleto, estado, mostrarToast, segmentado, seletor } from '../src/componentes/controles'
import { el } from '../src/componentes/dom'
import { cartaoCompacto, cartaoDestaque } from '../src/componentes/indicador'
import { montarNavegacao } from '../src/componentes/navegacao'
import { fonteDeDados } from '../src/fonte-de-dados'
import { capitalizar, formatar } from '../src/formatar'
import { aoMudarTema, definirTema, type Tema } from '../src/tema'
import type { Filtros } from '../src/tipos/dominio'
import type { Aparencia } from '../src/vidro/vidro'

const parametros = new URLSearchParams(location.search)
const umDe = <T extends string>(valor: string | null, opcoes: readonly T[], padrao: T) =>
  opcoes.includes(valor as T) ? (valor as T) : padrao

const meses = await fonteDeDados.meses()
const setores = await fonteDeDados.setores()

const estadoDaPagina = {
  tema: umDe<Tema>(parametros.get('tema'), ['sistema', 'claro', 'escuro'], 'sistema'),
  vidro: umDe<Aparencia>(parametros.get('vidro'), ['vidro', 'css', 'solida'], 'vidro'),
  filtros: { mes: meses[meses.length - 1]!, setorId: 'todos' } as Filtros,
  /** O indicador que ocupa o cartão grande. */
  destaqueId: null as string | null,
}

const secoes = document.getElementById('secoes')!
let graficoAtual: Chart | null = null

function secao(id: string, titulo: string, descricao: string, ...conteudo: (Node | null)[]) {
  return el(
    'section',
    { class: 'secao', atributos: { id, 'aria-labelledby': `${id}-titulo` } },
    el('h2', { class: 'secao__titulo', texto: titulo, atributos: { id: `${id}-titulo` } }),
    el('p', { class: 'secao__descricao', texto: descricao }),
    el('div', { class: 'secao__palco' }, ...conteudo),
  )
}

const linha = (...itens: (Node | null)[]) => el('div', { class: 'palco-linha' }, ...itens)

// ---------- navegação ----------

const navegacao = montarNavegacao({
  secoes: [
    { id: 'painel', rotulo: 'Painel', icone: LayoutDashboard, href: '#indicadores' },
    { id: 'dados', rotulo: 'Dados', icone: Database, href: '#estados' },
    { id: 'preferencias', rotulo: 'Preferências', icone: Settings, href: '#navegacao' },
  ],
  atual: 'painel',
  meses,
  setores,
  filtros: estadoDaPagina.filtros,
  aoFiltrar(filtros) {
    estadoDaPagina.filtros = filtros
    void desenharIndicadores()
  },
  aoAdicionar: () => mostrarToast('A central de entrada de dados chega na Etapa 2.'),
})
document.body.prepend(navegacao.elemento)

const nomesDasAparencias: Record<Aparencia, string> = {
  vidro: 'vidro de verdade (WebGL)',
  css: 'versão CSS (desfoque do navegador)',
  solida: 'versão sólida',
}
const estadoDoVidro = el('p', { class: 'secao__nota', atributos: { role: 'status' } })

async function aplicarVidro() {
  const emUso = await navegacao.aplicarVidro(estadoDaPagina.vidro)
  const caiu = estadoDaPagina.vidro === 'vidro' && emUso !== 'vidro'
  estadoDoVidro.textContent = `Navegação em uso: ${nomesDasAparencias[emUso]}.${caiu ? ' O vidro de verdade não funcionou neste navegador, então a versão CSS entrou no lugar.' : ''}`
  document.documentElement.dataset.vidroPronto = 'sim'
}

function guardarNoEndereco() {
  const novos = new URLSearchParams(location.search)
  novos.set('tema', estadoDaPagina.tema)
  novos.set('vidro', estadoDaPagina.vidro)
  history.replaceState(null, '', `?${novos}${location.hash}`)
}

// ---------- seções ----------

const secaoNavegacao = secao(
  'navegacao',
  'Navegação e vidro',
  'O vidro só aparece na camada de navegação: a barra do topo e, no celular, a barra de abas e o botão flutuante. Cartões, gráficos e tabelas usam superfícies comuns.',
  linha(
    segmentado<Tema>({
      nome: 'tema',
      legenda: 'Tema',
      valor: estadoDaPagina.tema,
      opcoes: [
        { valor: 'sistema', rotulo: 'Sistema' },
        { valor: 'claro', rotulo: 'Claro' },
        { valor: 'escuro', rotulo: 'Escuro' },
      ],
      aoMudar(valor) {
        estadoDaPagina.tema = valor
        guardarNoEndereco()
        definirTema(valor)
      },
    }),
    segmentado<Aparencia>({
      nome: 'vidro',
      legenda: 'Efeito de vidro',
      valor: estadoDaPagina.vidro,
      opcoes: [
        { valor: 'vidro', rotulo: 'Vidro' },
        { valor: 'css', rotulo: 'CSS' },
        { valor: 'solida', rotulo: 'Sólido' },
      ],
      aoMudar(valor) {
        estadoDaPagina.vidro = valor
        guardarNoEndereco()
        void aplicarVidro()
      },
    }),
  ),
  estadoDoVidro,
)

const cores: [string, string][] = [
  ['fundo', 'Fundo'],
  ['superficie', 'Superfície'],
  ['preenchimento', 'Preenchimento'],
  ['borda', 'Borda'],
  ['texto', 'Texto'],
  ['texto-suave', 'Texto suave'],
  ['destaque', 'Destaque'],
  ['destaque-suave', 'Destaque suave'],
  ['alerta', 'Atenção'],
  ['positivo', 'Positivo'],
  ['erro', 'Erro'],
]

const secaoCores = secao(
  'cores',
  'Cores',
  'Dois destaques, no máximo: azul-petróleo para as ações e âmbar para o que pede atenção. Verde e vermelho só aparecem em estado de meta e de erro, sempre com ícone e texto.',
  el('ul', { class: 'amostras' }, ...cores.map(([token, nome]) => el('li', { class: 'amostra' }, el('span', { class: `amostra__cor amostra__cor--${token}` }), el('span', { class: 'amostra__nome', texto: nome }), el('code', { class: 'amostra__token', texto: `--cor-${token}` })))),
)

const secaoTipografia = secao(
  'tipografia',
  'Tipografia',
  'Fonte do sistema, com a Inter como reserva. O texto corrido nunca fica abaixo de 16 px. Os números usam algarismos de largura igual, para alinhar em colunas.',
  el(
    'dl',
    { class: 'tipos' },
    ...(
      [
        ['Título de página', 'tipo--titulo', 'Outubro de 2026'],
        ['Número em destaque', 'tipo--numero-destaque numero', '79%'],
        ['Número de cartão', 'tipo--numero numero', '1,2'],
        ['Frase do painel', 'tipo--frase', 'A higiene das mãos caiu de 80% para 79% e saiu da meta.'],
        ['Texto', 'tipo--texto', 'Seus dados não saem do seu computador.'],
        ['Texto de apoio', 'tipo--apoio', 'por 1.000 pacientes-dia'],
      ] as const
    ).flatMap(([nome, classe, exemplo]) => [el('dt', { texto: nome }), el('dd', { class: classe, texto: exemplo })]),
  ),
)

const secaoBotoes = secao(
  'botoes',
  'Botões',
  'Um botão principal por tela. Todos têm pelo menos 44 px de altura e respondem na hora em que são apertados.',
  linha(
    botao('Importar planilha', { variante: 'primario', icone: Upload }),
    botao('Baixar modelo', { variante: 'secundario', icone: Download }),
    botao('Cancelar'),
    botao('Ver tendência', { variante: 'texto' }),
    botao('Apagar tudo', { variante: 'perigo', icone: Trash2 }),
    botao('Indisponível', { desabilitado: true }),
  ),
)

const secaoCampos = secao(
  'campos',
  'Campos',
  'O rótulo fica sempre visível, acima do campo. O erro aparece junto do campo, com ícone, e diz o que fazer.',
  el(
    'div',
    { class: 'palco-grade' },
    campoTexto({ id: 'exemplo-quedas', rotulo: 'Quedas', valor: '2', tipo: 'number', ajuda: 'Número de quedas de pacientes registradas no mês.' }),
    campoTexto({ id: 'exemplo-pacientes', rotulo: 'Pacientes-dia', valor: '8,5', erro: 'Use um número inteiro, sem vírgula. Por exemplo: 850.' }),
    seletor({ id: 'exemplo-setor', rotulo: 'Setor', opcoes: setores.map((s) => ({ valor: s.id, rotulo: s.nome })) }),
    campoTexto({ id: 'exemplo-visao', rotulo: 'Nome da visão', valor: 'Diretoria' }),
  ),
)

const secaoFiltros = secao(
  'filtros',
  'Filtros',
  'Chips ligam e desligam, e podem ficar vários ligados. O controle segmentado serve para escolher uma opção só.',
  el('div', { class: 'chips', atributos: { role: 'group', 'aria-label': 'Setores' } }, ...setores.map((s, i) => chip(s.nome, i < 2))),
  segmentado({
    nome: 'comparar',
    legenda: 'Comparar com',
    valor: 'mes',
    opcoes: [
      { valor: 'mes', rotulo: 'Mês anterior' },
      { valor: 'ano', rotulo: 'Mesmo mês do ano passado' },
    ],
    aoMudar: () => undefined,
  }),
)

const palcoDosIndicadores = el('div', { class: 'palco-indicadores' })
const secaoIndicadores = secao(
  'indicadores',
  'Cartões de indicador',
  'Um indicador em destaque, com o gráfico de 12 meses, e os outros ao lado. Os filtros de mês e de setor, na barra do topo, mudam estes cartões na hora.',
  palcoDosIndicadores,
)

async function desenharIndicadores() {
  graficoAtual?.destroy()
  graficoAtual = null
  const { filtros } = estadoDaPagina
  const [resumos, frases] = await Promise.all([fonteDeDados.resumo(filtros), fonteDeDados.frases(filtros)])
  const mesAnterior = meses[meses.indexOf(filtros.mes) - 1] ?? null
  const setor = filtros.setorId === 'todos' ? 'Todos os setores' : (setores.find((s) => s.id === filtros.setorId)?.nome ?? '')
  const destaque =
    resumos.find((r) => r.indicador.id === estadoDaPagina.destaqueId) ?? resumos.find((r) => r.situacao === 'fora-da-meta') ?? resumos[0]!
  const grande = cartaoDestaque(destaque, mesAnterior)
  const compactos = resumos
    .filter((r) => r !== destaque)
    .map((r) =>
      cartaoCompacto(r, mesAnterior, () => {
        estadoDaPagina.destaqueId = r.indicador.id
        void desenharIndicadores()
      }),
    )

  palcoDosIndicadores.replaceChildren(
    el('p', { class: 'palco-indicadores__periodo', texto: `${capitalizar(formatar.mesComAno(filtros.mes))} · ${setor}${mesAnterior ? `, comparado a ${formatar.mes(mesAnterior)}` : ''}` }),
    el('div', { class: 'grade-painel' }, grande.elemento, el('div', { class: 'grade-painel__coluna' }, ...compactos)),
    el(
      'section',
      { class: 'mudancas' },
      el('h3', { class: 'mudancas__titulo', texto: 'O que mudou' }),
      frases.length
        ? el('ul', { class: 'mudancas__lista' }, ...frases.map((f) => el('li', { texto: f })))
        : el('p', { class: 'sem-dados', texto: 'Nenhuma mudança importante neste mês.' }),
    ),
  )
  graficoAtual = grande.iniciarGrafico()
}

const secaoAvisos = secao(
  'avisos',
  'Avisos',
  'Cada tipo tem cor, ícone e título próprios. O texto diz o que aconteceu e, quando cabe, o que fazer.',
  el(
    'div',
    { class: 'palco-coluna' },
    aviso('info', 'Seus dados ficam só neste navegador.', 'Nada é enviado para a internet. Para usar em outro computador, faça um backup.'),
    aviso('sucesso', 'Planilha importada.', '6 setores e 12 meses entraram no painel.'),
    aviso('atencao', 'Ignoramos 2 colunas que parecem identificar pacientes.', 'O painel só usa contagens por setor. As outras colunas foram importadas normalmente.'),
    aviso('erro', 'Não conseguimos ler este arquivo.', 'Ele precisa ser uma planilha .xlsx ou .csv de até 15 MB. Confira o arquivo e tente de novo.'),
  ),
)

// Um cartão sem dados: o Pronto-Socorro não lançou março de 2026 nos dados fictícios.
const [semDados] = await fonteDeDados.resumo({ mes: '2026-03', setorId: 'pronto-socorro' })

const secaoEstados = secao(
  'estados',
  'Estados',
  'O que a pessoa vê quando ainda não há dados, enquanto carrega, quando algo dá errado e quando faltam números para um indicador.',
  el(
    'div',
    { class: 'palco-grade' },
    estado({ titulo: 'Ainda não há dados aqui', texto: 'Importe a planilha que você já usa ou lance os números do mês à mão.', acao: botao('Adicionar dados', { variante: 'primario' }) }),
    esqueleto(),
    estado({ tipo: 'erro', titulo: 'Não foi possível abrir seus dados', texto: 'Feche outras abas deste site e tente de novo. Seus dados continuam guardados neste navegador.', acao: botao('Tentar de novo') }),
    semDados ? cartaoCompacto(semDados, '2026-02') : null,
  ),
)

let registroApagado = false
const linhaDoRegistro = el('p', { class: 'secao__nota', texto: 'Registro de exemplo: Clínica Médica, outubro de 2026.' })
const secaoToast = secao(
  'toast',
  'Aviso rápido com "Desfazer"',
  'Em vez de perguntar "tem certeza?", o produto faz a ação e oferece "Desfazer" por alguns segundos.',
  linha(
    botao('Apagar registro de exemplo', {
      variante: 'secundario',
      aoClicar() {
        if (registroApagado) return
        registroApagado = true
        linhaDoRegistro.textContent = 'O registro de exemplo foi apagado.'
        mostrarToast('Registro apagado.', {
          aoDesfazer() {
            registroApagado = false
            linhaDoRegistro.textContent = 'Registro de exemplo: Clínica Médica, outubro de 2026.'
          },
        })
      },
    }),
  ),
  linhaDoRegistro,
)

const secaoDepois = secao(
  'depois',
  'Chegam na Etapa 2',
  'Estas peças entram na galeria junto com as telas que as usam.',
  el('ul', { class: 'lista-simples' }, ...['Tabela', 'Grade de lançamento', 'Área de arrastar arquivos', 'Barra de progresso', 'Folhas e modais de confirmação'].map((texto) => el('li', { texto }))),
)

secoes.replaceChildren(secaoNavegacao, secaoCores, secaoTipografia, secaoBotoes, secaoCampos, secaoFiltros, secaoIndicadores, secaoAvisos, secaoEstados, secaoToast, secaoDepois)

// Quando o tema muda, o gráfico e o vidro são refeitos com as cores novas.
aoMudarTema(() => {
  void desenharIndicadores()
  void navegacao.atualizarVidro()
})

definirTema(estadoDaPagina.tema)
await desenharIndicadores()
await aplicarVidro()
