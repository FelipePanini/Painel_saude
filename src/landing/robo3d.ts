// O robô em 3D, desenhado com o Three.js (licença MIT). Este arquivo só é baixado quando
// o carregador decide que o aparelho aguenta e que a pessoa não pediu menos movimento.
//
// Enquanto public/3d/robo.glb não existe, o robô é montado aqui mesmo com formas simples,
// nas cores da marca. Quando o arquivo do Spline chegar, ele é usado no lugar, e o código
// procura os objetos pelo nome: "robo", "cabeca", "olhos", "visor" e, se houver, "braco".
import {
  AmbientLight,
  CapsuleGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from 'three'

export interface Robo {
  canvas: HTMLCanvasElement
  /** Liga o desenho. Chame quando o robô estiver visível e a animação não estiver pausada. */
  tocar(): void
  /** Para o desenho, sem descartar a cena. */
  parar(): void
  /** Um aceno curto. */
  acenar(): void
  /** Libera a memória da placa de vídeo. Chame ao sair da página. */
  descartar(): void
}

interface Partes {
  robo: Object3D
  cabeca: Object3D
  braco: Object3D | null
}

const VINTE_GRAUS = MathUtils.degToRad(20)

function material(cor: string, opcoes: { rugosidade?: number; brilho?: string; intensidade?: number } = {}) {
  return new MeshStandardMaterial({
    color: cor,
    roughness: opcoes.rugosidade ?? 0.4,
    metalness: 0,
    emissive: opcoes.brilho ?? '#000000',
    emissiveIntensity: opcoes.intensidade ?? 0,
  })
}

/** O robô provisório, original, feito só com formas simples. */
function montarRoboProvisorio(): Partes {
  const branco = material('#f2f5f8', { rugosidade: 0.35 })
  const petroleo = material('#0b6b8a', { rugosidade: 0.45 })
  const visor = material('#0f1c24', { rugosidade: 0.2 })
  const olho = material('#5cc4e2', { brilho: '#5cc4e2', intensidade: 0.9 })
  const ambar = material('#e6b54a', { brilho: '#e6b54a', intensidade: 0.7 })

  const robo = new Group()
  robo.name = 'robo'

  const corpo = new Mesh(new CapsuleGeometry(0.62, 0.55, 8, 32), branco)
  corpo.position.y = -0.55
  robo.add(corpo)

  // "+" arredondado no peito
  const barraV = new Mesh(new CapsuleGeometry(0.07, 0.26, 4, 16), petroleo)
  const barraH = barraV.clone()
  barraH.rotation.z = Math.PI / 2
  for (const barra of [barraV, barraH]) {
    barra.position.set(0, -0.5, 0.6)
    robo.add(barra)
  }

  const cabeca = new Group()
  cabeca.name = 'cabeca'
  cabeca.position.y = 0.55
  const cranio = new Mesh(new SphereGeometry(0.62, 48, 32), branco)
  cranio.scale.set(1.25, 0.9, 0.95)
  cabeca.add(cranio)
  const tela = new Mesh(new SphereGeometry(0.5, 48, 32), visor)
  tela.name = 'visor'
  // O visor fica bem à frente do crânio, para a borda entre os dois sair limpa (sem serrilhado).
  tela.scale.set(1.18, 0.6, 0.5)
  tela.position.z = 0.4
  cabeca.add(tela)
  const olhos = new Group()
  olhos.name = 'olhos'
  for (const x of [-0.2, 0.2]) {
    const o = new Mesh(new SphereGeometry(0.085, 24, 16), olho)
    o.position.set(x, 0.02, 0.62)
    olhos.add(o)
  }
  cabeca.add(olhos)
  const haste = new Mesh(new CylinderGeometry(0.03, 0.03, 0.28, 12), petroleo)
  haste.position.y = 0.66
  cabeca.add(haste)
  const luz = new Mesh(new SphereGeometry(0.075, 24, 16), ambar)
  luz.position.y = 0.84
  cabeca.add(luz)
  robo.add(cabeca)

  const bracoEsquerdo = new Mesh(new CapsuleGeometry(0.14, 0.5, 6, 16), branco)
  bracoEsquerdo.position.set(-0.78, -0.55, 0)
  bracoEsquerdo.rotation.z = -0.12
  robo.add(bracoEsquerdo)

  // O braço direito gira a partir do ombro, para acenar.
  const braco = new Group()
  braco.name = 'braco'
  braco.position.set(0.76, -0.2, 0)
  const bracoDireito = new Mesh(new CapsuleGeometry(0.14, 0.5, 6, 16), branco)
  bracoDireito.position.y = -0.36
  braco.add(bracoDireito)
  braco.rotation.z = 0.12
  robo.add(braco)

  return { robo, cabeca, braco }
}

async function carregarRoboDoArquivo(endereco: string): Promise<Partes> {
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
  const carregador = new GLTFLoader()
  // O GLTFLoader lê as texturas embutidas com fetch() num endereço blob:, e a nossa CSP
  // só permite fetch para a própria origem. Trocamos pelo leitor de imagens comum,
  // que usa <img> (img-src já aceita blob:). Assim a CSP não precisa mudar.
  carregador.register((parser) => {
    parser.textureLoader = new TextureLoader(parser.options.manager)
    return { name: 'texturas-sem-fetch' }
  })
  const gltf = await carregador.loadAsync(endereco)
  const cena = gltf.scene
  const robo = cena.getObjectByName('robo') ?? cena
  const cabeca = cena.getObjectByName('cabeca') ?? robo
  return { robo, cabeca, braco: cena.getObjectByName('braco') ?? null }
}

export async function criarRobo(caixa: HTMLElement, opcoes: { arquivo: string | null }): Promise<Robo> {
  const canvas = document.createElement('canvas')
  canvas.className = 'robo__canvas'
  canvas.setAttribute('aria-hidden', 'true')
  canvas.tabIndex = -1

  const renderizador = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderizador.setClearColor(0x000000, 0) // fundo transparente: o claro e o escuro vêm do CSS
  renderizador.outputColorSpace = SRGBColorSpace
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const cena = new Scene()
  const camera = new PerspectiveCamera(30, 1, 0.1, 50)
  // Distância com folga para o braço caber no quadro durante o aceno.
  camera.position.set(0, 0.15, 7.4)
  cena.add(new HemisphereLight('#ffffff', '#b9cbd6', 1.6))
  cena.add(new AmbientLight('#ffffff', 0.35))
  const sol = new DirectionalLight('#ffffff', 2.2)
  sol.position.set(2.5, 3, 4)
  cena.add(sol)

  const partes = opcoes.arquivo ? await carregarRoboDoArquivo(opcoes.arquivo) : montarRoboProvisorio()
  const conjunto = new Group()
  conjunto.add(partes.robo)
  cena.add(conjunto)

  // ---------- estado da animação ----------
  const telaComCursor = window.matchMedia('(hover: hover) and (pointer: fine)')
  const alvo = { x: 0, y: 0 }
  let inicioDoAceno = -1
  let rodando = false
  let quadro = 0
  const relogio = performance.now()

  const aoMoverCursor = (evento: PointerEvent) => {
    if (!telaComCursor.matches) return
    const caixaDoRobo = caixa.getBoundingClientRect()
    const cx = caixaDoRobo.left + caixaDoRobo.width / 2
    const cy = caixaDoRobo.top + caixaDoRobo.height * 0.35
    alvo.x = MathUtils.clamp((evento.clientX - cx) / (window.innerWidth / 2), -1, 1)
    alvo.y = MathUtils.clamp((evento.clientY - cy) / (window.innerHeight / 2), -1, 1)
  }
  window.addEventListener('pointermove', aoMoverCursor, { passive: true })

  function ajustarTamanho() {
    const { width, height } = caixa.getBoundingClientRect()
    if (!width || !height) return
    renderizador.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  const observador = new ResizeObserver(ajustarTamanho)
  observador.observe(caixa)
  ajustarTamanho()

  function quadroDeAnimacao(agora: number) {
    const t = (agora - relogio) / 1000

    // Flutua devagar.
    partes.robo.position.y = Math.sin(t * 0.9) * 0.06

    // A cabeça segue o cursor, no máximo uns 20 graus, com amortecimento.
    partes.cabeca.rotation.y = MathUtils.lerp(partes.cabeca.rotation.y, alvo.x * VINTE_GRAUS, 0.08)
    partes.cabeca.rotation.x = MathUtils.lerp(partes.cabeca.rotation.x, alvo.y * VINTE_GRAUS * 0.6, 0.08)

    // Aceno: o braço sobe, balança duas vezes e volta, em 1,4 s.
    if (inicioDoAceno >= 0) {
      const p = (t - inicioDoAceno) / 1.4
      if (p >= 1) inicioDoAceno = -1
      const sobe = Math.sin(Math.min(p, 1) * Math.PI)
      const balanco = Math.sin(p * Math.PI * 4) * 0.35 * sobe
      if (partes.braco) partes.braco.rotation.z = 0.12 + sobe * 2.0 + balanco
      else partes.robo.rotation.z = balanco * 0.3
    }

    // Ao rolar para fora da primeira dobra, gira um pouco e encolhe, como quem se despede.
    // A posição de rolagem é lida aqui, uma vez por quadro, sem escutar o evento de rolagem.
    const saida = MathUtils.clamp(window.scrollY / Math.max(1, window.innerHeight * 0.8), 0, 1)
    conjunto.rotation.y = saida * 0.6
    conjunto.scale.setScalar(1 - saida * 0.25)

    renderizador.render(cena, camera)
    if (rodando) quadro = requestAnimationFrame(quadroDeAnimacao)
  }

  return {
    canvas,
    tocar() {
      if (rodando) return
      rodando = true
      quadro = requestAnimationFrame(quadroDeAnimacao)
    },
    parar() {
      rodando = false
      cancelAnimationFrame(quadro)
    },
    acenar() {
      inicioDoAceno = (performance.now() - relogio) / 1000
    },
    descartar() {
      rodando = false
      cancelAnimationFrame(quadro)
      observador.disconnect()
      window.removeEventListener('pointermove', aoMoverCursor)
      cena.traverse((objeto) => {
        if (objeto instanceof Mesh) {
          objeto.geometry.dispose()
          const materiais = Array.isArray(objeto.material) ? objeto.material : [objeto.material]
          materiais.forEach((m) => m.dispose())
        }
      })
      renderizador.dispose()
      renderizador.forceContextLoss()
    },
  }
}
