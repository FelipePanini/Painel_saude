// Landing page (/). O 3D do robô entra sob demanda (carregarRobo.ts); o resto da página é HTML comum.
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '../estilos/tokens.css'
import '../estilos/base.css'
import '../estilos/componentes.css'
import '../estilos/navegacao.css'
import '../vidro/vidro.css'
import '../estilos/landing.css'
import { aoMudarTema } from '../tema'
import { aplicarAparencia } from '../vidro/vidro'
import { iniciarRobo } from './carregarRobo'
import { criarPausa } from './pausa'
import { iniciarRevelacoes } from './revelar'
import { montarSecoes } from './secoes'

const caixaDoRobo = document.getElementById('robo')!
const botaoPausa = document.querySelector<HTMLButtonElement>('#pausa')!

let robo: ReturnType<typeof iniciarRobo> | null = null
const pausa = criarPausa(botaoPausa, () => robo?.aoMudarPausa())
robo = iniciarRobo(caixaDoRobo, pausa.estaPausado)

// Vidro só na barra de navegação. A barra fica sobre a faixa fixa do topo, nunca sobre o 3D.
const camadaNav = document.getElementById('camada-nav')!
const barra = camadaNav.querySelector<HTMLElement>('.barra-landing')!
const raio = parseFloat(getComputedStyle(camadaNav).getPropertyValue('--raio-barra')) || 28
barra.dataset.config = JSON.stringify({ cornerRadius: raio, blurAmount: 0.2, shadowOpacity: 0.18 })

async function aplicarVidro() {
  await aplicarAparencia(camadaNav, 'vidro')
  document.documentElement.dataset.vidroPronto = 'sim'
}
aoMudarTema(() => void aplicarVidro())
void aplicarVidro()

// Seções com dados: montadas depois da primeira dobra, sem atrasar o robô nem o título.
const observarRevelacoes = iniciarRevelacoes()
void montarSecoes().then(() => observarRevelacoes?.())
