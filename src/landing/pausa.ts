// Botão "Pausar animação" / "Retomar animação" (WCAG 2.2.2: o que se mexe sozinho por mais de 5 s
// precisa poder ser pausado). Para o robô e as formas do fundo. A escolha fica salva neste navegador.
import { Pause, Play } from 'lucide'
import { icone } from '../componentes/dom'

const CHAVE = 'painel-saude:pausar-animacao'

function lerPreferencia() {
  try {
    return localStorage.getItem(CHAVE) === 'sim'
  } catch {
    return false
  }
}

function salvarPreferencia(pausado: boolean) {
  try {
    if (pausado) localStorage.setItem(CHAVE, 'sim')
    else localStorage.removeItem(CHAVE)
  } catch {
    // Sem acesso ao armazenamento (janela anônima, por exemplo): a pausa vale só nesta visita.
  }
}

export function criarPausa(botao: HTMLButtonElement, aoMudar: () => void) {
  let pausado = lerPreferencia()

  function desenhar() {
    document.documentElement.dataset.pausado = pausado ? 'sim' : 'nao'
    botao.setAttribute('aria-pressed', String(pausado))
    botao.replaceChildren(icone(pausado ? Play : Pause, 18), pausado ? 'Retomar animação' : 'Pausar animação')
  }

  botao.addEventListener('click', () => {
    pausado = !pausado
    salvarPreferencia(pausado)
    desenhar()
    aoMudar()
  })
  desenhar()

  return { estaPausado: () => pausado }
}
