// Página do painel (/painel/). Na fase 1 mostra a visão geral com dados fictícios.
// O roteador do painel (detalhe do indicador, central de entrada, preferências) entra aqui na Etapa 2.
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '../estilos/tokens.css'
import '../estilos/base.css'
import '../estilos/componentes.css'
import '../estilos/navegacao.css'
import '../vidro/vidro.css'
import '../estilos/painel.css'
import { Database, LayoutDashboard, Settings } from 'lucide'
import { mostrarToast } from '../componentes/controles'
import { montarNavegacao } from '../componentes/navegacao'
import { fonteDeDados } from '../fonte-de-dados'
import { aoMudarTema } from '../tema'
import type { Filtros } from '../tipos/dominio'
import { criarVisaoGeral } from './visaoGeral'

const meses = await fonteDeDados.meses()
const setores = await fonteDeDados.setores()
let filtros: Filtros = { mes: meses[meses.length - 1]!, setorId: 'todos' }

const visao = criarVisaoGeral(meses, setores)
document.getElementById('visao')!.append(visao.elemento)

const emBreve = () => mostrarToast('Esta parte do painel chega na próxima etapa.')
const navegacao = montarNavegacao({
  secoes: [
    { id: 'painel', rotulo: 'Painel', icone: LayoutDashboard, href: '/painel/' },
    { id: 'dados', rotulo: 'Dados', icone: Database, href: '/painel/#dados' },
    { id: 'preferencias', rotulo: 'Preferências', icone: Settings, href: '/painel/#preferencias' },
  ],
  atual: 'painel',
  meses,
  setores,
  filtros,
  aoFiltrar(novos) {
    filtros = novos
    void visao.desenhar(filtros)
  },
  aoAdicionar: emBreve,
})
document.body.prepend(navegacao.elemento)
for (const link of navegacao.elemento.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')) {
  link.addEventListener('click', (evento) => {
    evento.preventDefault()
    emBreve()
  })
}

aoMudarTema(() => {
  void visao.desenhar(filtros)
  void navegacao.atualizarVidro()
})

await visao.desenhar(filtros)
// O script da vitrine confere este marcador antes de capturar a tela.
const marcador = fonteDeDados.marcador()
if (marcador) document.documentElement.dataset.marcadorDeDados = marcador
await navegacao.aplicarVidro('vidro')
document.documentElement.dataset.vidroPronto = 'sim'
