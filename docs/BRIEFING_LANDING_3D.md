> **Nota de 18/11/2026.** O `@splinetool/runtime` foi descartado: o pacote não declara licença e traz endereços de servidores da Spline e do Google. Com a aprovação do Felipe, o 3D usa o **Three.js** (licença MIT), com as cenas exportadas do Spline em **GLB**, sem Draco. Por isso: na parte A, exporte `robo.glb`, `cena-2.glb` e `cena-3.glb` (Export → 3D → GLTF Binary, sem compressão Draco) em vez dos `.splinecode`; a flutuação, o "olhar para o cursor" e o aceno são feitos no código; e **a CSP não muda** (sem `'wasm-unsafe-eval'`), então todas as páginas seguem com a mesma CSP. O resto do briefing vale como está. Detalhes em `docs/DECISOES.md`.

# Briefing: landing page 3D com o robô como marca

Este arquivo tem duas partes. A **parte A** é para o Felipe: o que preparar no Spline antes de rodar o Claude Code. A **parte B** é o prompt em si, que o Claude Code lê daqui.

---

## Parte A: antes de rodar (Felipe)

### A1. Spline: o que fazer com as três cenas

1. **Plano.** O código para web (`.splinecode` + runtime) só sai nos planos pagos com exportação de código (Pro ou superior). No plano grátis a exportação tem marca d'água. Assine só no mês em que for exportar, se quiser economizar.
2. **Remix.** Abra cada arquivo da comunidade e use "Remix" para ter uma cópia na sua conta:
   - Robô (marca, usado na primeira dobra): https://community.spline.design/file/615b9422-9985-43f6-8593-d7d7bc3b0be1
   - Cena 2: https://community.spline.design/file/3afbbf73-d552-4dcc-a0fb-73d369a63e71
   - Cena 3: https://community.spline.design/file/3ff7b617-2fe9-46c7-8e06-b6d7c382f4db
3. **Licença.** Na página de cada arquivo, confirme que a licença é CC BY 4.0 e anote: título, nome do autor, link e licença. Isso vai para a página de créditos (a licença exige a atribuição e a indicação do que foi modificado).
4. **Robô com cara de saúde** (no editor do Spline, na sua cópia):
   - Corpo branco clínico ou cinza-gelo (#f2f5f8), detalhes em azul-petróleo (#0b6b8a), um toque de âmbar (#8a5a00 / #e6b54a) no máximo em um ponto (luz de status, por exemplo).
   - No peito ou no visor: um símbolo de "+" arredondado em azul-petróleo, ou um mini gráfico de barras. **Nunca uma cruz vermelha sobre fundo branco**: o emblema da Cruz Vermelha tem uso protegido por lei.
   - Evite estetoscópio pendurado, seringa ou jaleco com nome: o produto é de gestão, não de atendimento.
   - Apague qualquer texto 3D da cena (texto no Spline puxa fonte de fora).
   - Fundo da cena **transparente** (desligue a cor de fundo), para o blur do site aparecer atrás.
   - Renomeie os objetos principais para nomes simples: `robo`, `cabeca`, `olhos`, `visor`. O código usa esses nomes.
   - Eventos no próprio Spline: flutuação suave em repouso; "Look At" do cursor na `cabeca`; ao clicar (`mouseDown`) no `robo`, um aceno curto.
5. **Exportar.** Em cada cena: Export → Code → Vanilla JS → baixe o arquivo `.splinecode` (não use o link hospedado no Spline: a regra do projeto é tudo local).
6. **Pôsteres.** Exporte também uma imagem PNG de cada cena no enquadramento final (2560 px de largura). Ela aparece enquanto o 3D carrega e substitui o 3D em celulares fracos.
7. **Onde colocar.** Crie a pasta `public/3d/` no projeto e salve:
   - `robo.splinecode`, `robo-poster.png`
   - `cena-2.splinecode`, `cena-2-poster.png`
   - `cena-3.splinecode`, `cena-3-poster.png`
   - `CREDITOS.txt` com o título, autor, link e licença de cada uma.

Se ainda não tiver os arquivos, pode rodar mesmo assim: o Claude Code monta tudo com os pôsteres no lugar e deixa o 3D pronto para encaixar.

### A2. O que você aprova ao rodar este prompt

As regras do CLAUDE.md pedem sua aprovação para estes três pontos. O prompt já os dá como aprovados, então rode só se concordar:

- **Dependência nova:** `@splinetool/runtime` (o motor que desenha as cenas, ~800 KB comprimido, carregado só na landing e só quando precisa).
- **CSP mais aberta só na landing:** `'wasm-unsafe-eval'` em `script-src`, porque o 3D usa um decodificador em WebAssembly. O painel continua com a CSP atual, sem mudança.
- **Estrutura nova:** a landing vira a página inicial (`/`) e o painel vai para `/painel/`.

### A3. Qual modelo e como chamar

- É trabalho visual, então é da fase 1: **Claude Fable 5.2, esforço alto**. Se o limite do Fable acabar no meio, dá para continuar com o Opus 5.5 com esforço alto; o prompt já traz a lista do que evitar.
- O prazo da fase 1 é 22/11. O prompt divide o trabalho em fatias, e a primeira (o robô na primeira dobra) fica pronta e testada antes das outras.
- Mensagem para colar no Claude Code:

```
Leia docs/BRIEFING_LANDING_3D.md (parte B) e execute. Comece pelo plano curto em docs/PLANO.md e siga as fatias na ordem, sem parar para pedir aprovação do que o briefing já aprova.
```

---

## Parte B: prompt para o Claude Code

### 1. Seu papel

Você é o responsável pela landing page do Painel Saúde, de ponta a ponta: direção de arte, código, textos, 3D, desempenho e testes. Trabalhe até a landing estar completa, testada e documentada, fatia por fatia. Não pare para pedir aprovação do que este briefing já aprova; pare só nos pontos listados em "Continua pedindo aprovação".

Antes de qualquer código, leia `CLAUDE.md`, `docs/PLANO.md`, `docs/DECISOES.md` e `docs/BRIEFING_FASE_1.md`. Todas as regras do CLAUDE.md continuam valendo. Este briefing só acrescenta o que está escrito aqui.

### 2. Objetivo

Uma landing page no estilo das páginas de produto da Apple (tipografia grande, muito respiro, uma ideia por tela, histórias contadas com o rolar da página), com mais profundidade e 3D, numa temática de blur. Ela mostra o que o painel faz para gestores e profissionais da saúde. O robô é a marca e aparece logo na primeira dobra. A cara tem que ser de produto da área da saúde: limpo, clínico, confiável, calmo. Mais tarde a landing vai receber fotos do painel pronto, então já nasce com os espaços para elas.

Estilo da Apple quer dizer padrão de composição e ritmo. Não copie código, imagens, vídeos, fontes, ícones ou molduras de aparelhos da Apple (nem SF Pro, nem SF Symbols, nem foto de iPhone ou MacBook). Tudo é desenhado aqui ou vem das três cenas do Spline.

### 3. Aprovações já dadas por Felipe

- Instalar `@splinetool/runtime` como dependência. Antes, confira a licença em `node_modules/@splinetool/runtime/package.json`. Se não for permissiva (MIT, Apache, BSD ou parecida), não use: pare, explique e proponha o plano B (pôsteres com movimento em CSS).
- Mudar a CSP **só para as páginas da landing**, acrescentando `'wasm-unsafe-eval'` em `script-src` e mantendo `worker-src 'self' blob:`. O painel e a galeria de componentes continuam com a CSP atual. Nada de `'unsafe-eval'`, `'unsafe-inline'` ou origem externa.
- Reorganizar as páginas: `index.html` vira a landing; o painel vai para `painel/index.html`. Atualize `vite.config.ts`, os testes e o CLAUDE.md (seções Stack, Estrutura e Liquid glass) para refletir isso.

### 4. Continua pedindo aprovação

- Qualquer outra dependência (por exemplo GSAP, Lenis, Three.js, bibliotecas de rolagem suave). Use CSS e as APIs do navegador.
- Qualquer outra mudança de CSP ou de regra.
- Push, deploy, publicar, ou qualquer formulário que envie dados para fora.
- Apagar arquivos fora de `src/`, `tests/` e `docs/`.

### 5. Páginas e pastas

- `/` → `index.html`: a landing.
- `/painel/` → `painel/index.html`: o produto (o roteador do painel, previsto no PLANO, mora aqui).
- `/creditos/` → `creditos/index.html`: créditos dos modelos 3D, das fontes e das bibliotecas.
- `componentes/` e `prototipo/` continuam como estão.
- Código da landing em `src/landing/` (seções, carregador do 3D, animações de rolagem). Estilos em `src/estilos/landing.css`, usando só tokens de `tokens.css`. Se faltar um token, crie em `tokens.css`, nos dois temas.
- Arquivos 3D em `public/3d/`. O decodificador WebAssembly do runtime é copiado de `node_modules` para `public/3d/` num passo do build (script ou plugin do Vite, sem dependência nova) e apontado pela opção de caminho do wasm do runtime. Confirme o nome exato da opção na versão instalada.

**Cabeçalhos por página.** Hoje `public/_headers` tem uma seção `/*` e o plugin do `vite.config.ts` lê só ela. Atenção: no Cloudflare Pages, quando duas seções casam com a mesma URL, os valores do mesmo cabeçalho são juntados com vírgula, e duas CSPs juntas valem as duas (a mais restrita vence). Então não dá para "abrir" a CSP com uma seção a mais por cima da `/*`. Monte as seções para que cada URL receba exatamente uma CSP (cabeçalhos comuns em `/*`, CSP em seções por caminho), atualize o plugin para aplicar a mesma lógica no `vite preview` e teste as duas CSPs (seção 13). Registre em DECISOES como ficou e por quê.

### 6. Direção de arte

Base: a direção A, "Sereno", já aprovada. Mesmos tokens, mesma tipografia (pilha do sistema com Inter local), mesmas cores. A landing é a versão mais expressiva dessa direção, não outra marca.

- **Clima:** área da saúde moderna. Branco clínico e cinza-gelo, azul-petróleo como cor de ação, âmbar só para chamar atenção num ponto. No escuro, os mesmos tokens do tema escuro.
- **Blur:** o fundo de cada seção tem formas grandes de cor muito desfocadas (azul-petróleo claro, verde-água, lavanda suave, como as da `--faixa-topo`), que se movem devagar com a rolagem. Os painéis de texto curto podem ter `backdrop-filter` (aparência "CSS" do vidro), sempre com contraste de texto de pelo menos 4,5:1 medido sobre o pior ponto do fundo.
- **Liquid glass (@ybouane/liquidglass):** só na barra de navegação da landing, seguindo as regras do CLAUDE.md. Teste se a biblioteca refrata bem o canvas do Spline e se o conjunto mantém 60 fps num notebook comum. Se não, use a aparência CSS na barra da landing e registre em DECISOES. Nunca vidro sobre vidro, nunca vidro em cartão.
- **Tipografia:** títulos enormes e curtos (até `--texto-numero-destaque` e além, só na landing), com `--entreletra-titulo`. Frases de apoio em `--texto-md`. Nunca menos de 16 px em texto corrido.
- **Números:** quando aparecerem indicadores de exemplo, use `Intl.NumberFormat('pt-BR')` e dados de `src/fonte-de-dados/`, nunca valores escritos à mão no HTML.
- **Ícones:** Lucide, como no resto do projeto.

**Evite** (são os vícios de landing genérica): degradê roxo e rosa, neon ou estética "cyberpunk", ícones de emoji, "IA" como argumento, cartões de vidro por toda parte, parallax forte que dá enjoo, tudo centralizado, três colunas de "benefícios" com ícone redondo, números inventados de impacto ("reduz 40% dos erros"), fotos de banco de imagem de médicos sorrindo, rolagem sequestrada.

### 7. O robô como marca

O robô é a assinatura visual. Ele não é um assistente de conversa e nunca "fala" sobre pacientes, diagnóstico ou conduta.

- **Primeira dobra:** robô grande, à direita no desktop (cerca de metade da largura), acima do título no celular. À esquerda, o título, uma frase e dois botões.
- **Comportamento:**
  - Em repouso, flutua devagar.
  - No desktop, a cabeça segue o cursor (evento Look At da cena; se a cena não tiver, faça pelo código com `findObjectByName('cabeca')` e rotação limitada a uns 20 graus).
  - Ao clicar ou tocar no robô, acena uma vez.
  - Ao rolar para fora da primeira dobra, ele gira levemente e encolhe, como quem se despede. Use a posição de rolagem lida em `requestAnimationFrame`, sem escutar `scroll` a cada pixel.
  - No celular não existe cursor: só flutuação e toque.
- **Aparições depois:** uma versão pequena do robô (o pôster recortado, não outro canvas 3D) volta como selo em duas ou três seções e no rodapé, para costurar a marca.
- **Acessibilidade do 3D:** o canvas é decorativo (`aria-hidden="true"`, sem foco). Tudo o que importa está no texto da página.
- **Pausa:** como o robô se mexe sozinho por mais de 5 segundos, ponha um botão visível "Pausar animação" / "Retomar animação" (WCAG 2.2.2). Ele para o 3D e as formas de fundo, e a escolha fica salva nas preferências locais (`localStorage`, com try/catch).
- **Nome:** o nome do robô não está definido. Use "o robô" nos textos e proponha três nomes em DECISOES, marcados `[VALIDAR]`.

### 8. Roteiro da página

Uma ideia por tela. Cada seção tem um título curto, uma frase e um elemento visual. Todos os textos passam pela skill Humanizer, em português do Brasil, em linguagem simples e sem promessas que não dá para provar.

1. **Primeira dobra (robô).** Título na linha de "Sua planilha vira um painel." Frase sobre ver assistência, qualidade e operação num lugar só. Botões: "Ver o painel de exemplo" (abre `/painel/` com dados fictícios) e "Quero testar o beta" (por enquanto rola até a seção final; ver item 9). Linha pequena embaixo: "Seus dados não saem do seu computador."
2. **Da planilha ao painel.** Sequência presa na tela enquanto se rola (`position: sticky`): uma planilha estilizada (desenhada em HTML/CSS com dados fictícios) se transforma em cartões de indicador e depois num gráfico. Três passos com legenda: importe, confira as colunas, veja o painel.
3. **Os indicadores.** Três blocos: assistência, qualidade, operação, com dois ou três indicadores de exemplo cada, tirados do nicho de exemplo (`src/nichos/exemplo.ts`). Use os componentes reais do projeto (cartão de indicador, minigráfico), não imagens.
4. **Privacidade.** Uma das cenas do Spline como fundo (a que tiver partículas, se houver: a ideia de que os dados ficam ali, no seu aparelho). Título na linha de "Fica tudo no seu computador." Três frases curtas e verdadeiras: a leitura da planilha acontece no navegador; nada é enviado para servidor; dá para usar em computador compartilhado sem deixar rastro (o modo de computador compartilhado é da fase 2: escreva só o que já existe ou o que está no plano, sem prometer data).
5. **Feito para todo mundo.** Texto grande ou pequeno, claro ou escuro, mais contraste, menos movimento. Mostre isso ao vivo: um controle que aumenta o texto de um cartão de exemplo e outro que troca o tema da própria seção.
6. **A interface de vidro.** A outra cena do Spline, se combinar com vidro, ao lado de um recorte da barra de navegação do painel. Se nenhuma das duas cenas combinar com esta seção, use só o recorte e explique em DECISOES.
7. **Vitrine do produto.** Três ou quatro molduras grandes (item 10) com as telas do painel. Por enquanto, os espaços com um aviso discreto "Imagem do painel em breve" só no modo de desenvolvimento; no build, as molduras mostram a captura mais recente gerada pelo script.
8. **Para quem é.** Coordenação de enfermagem, gestão de unidade, núcleo de qualidade. Uma frase para cada, sem fotos de pessoas.
9. **Chamada final.** Título curto, robô pequeno, botão "Quero testar o beta". Ainda não há lista de espera: o botão leva a um texto "As inscrições para o beta abrem em breve." Não crie formulário que envie dados. A forma de inscrição é decisão do Felipe (registre como pendência).
10. **Rodapé.** Link para créditos, aviso fixo "Ferramenta de gestão. Não faz diagnóstico e não indica conduta.", e o selo do robô.

Não coloque preço, plano, depoimento ou logotipo de cliente: nada disso existe ainda, e depoimento inventado não pode.

### 9. O 3D por dentro

- **Carregamento:** a página abre com o pôster de cada cena (imagem otimizada em AVIF e WebP, com `width`, `height` e `fetchpriority="high"` só no pôster do robô). O runtime do Spline é importado sob demanda (`import()` dinâmico), num pedaço separado do build, só quando:
  - a seção está a uma tela de distância (IntersectionObserver), e
  - o navegador tem WebGL, e
  - "reduzir movimento" está desligado no sistema, e
  - a pausa não foi ligada pelo usuário, e
  - o aparelho não pede economia (`navigator.connection?.saveData`, `navigator.deviceMemory <= 4` ou `navigator.hardwareConcurrency <= 4` → fica no pôster).
- Quando a cena termina de carregar, o canvas aparece por cima do pôster com um fade de `--duracao-lenta`. Se der erro, o pôster fica e nada quebra (sem mensagem para o visitante, só um aviso no modo de desenvolvimento).
- **Uma cena viva por vez.** Fora da tela, a cena para (`stop()`); ao voltar, `play()`. Com a aba escondida (`visibilitychange`), para também. Se a versão do runtime tiver um método para liberar a cena da memória, use ao sair de vez. Nunca mais de dois contextos WebGL ao mesmo tempo contando o liquid glass.
- **Tema:** a cena tem fundo transparente; o claro e o escuro vêm do CSS por trás. Se o robô ficar ruim no escuro, use uma variável da cena (`setVariable`) para trocar os materiais, e registre como fez.
- **Sem rede de fora:** nada de URL `prod.spline.design` ou qualquer outra origem. Todos os arquivos vêm de `public/3d/`. Se o runtime tentar buscar algo fora (fonte, decodificador, telemetria), descubra o quê, desligue pela configuração ou pela cena e, se não houver como, pare e avise o Felipe com o detalhe da requisição.
- **Sem os arquivos ainda:** se `public/3d/` estiver vazio, monte tudo com pôsteres provisórios desenhados em SVG (silhueta simples de robô, nas cores da marca, original) e deixe o carregador pronto. Liste em PLANO o que falta.

### 10. Vitrine: espaço para as fotos do painel

- Um componente `moldura-de-tela` desenhado em CSS (cantos arredondados, borda fina, sombra dos tokens; nada que imite um aparelho real), em três formatos: desktop, tablet e celular.
- Um script `npm run vitrine` usa o Playwright para abrir `/painel/` com dados fictícios e salvar capturas em `public/vitrine/` (claro e escuro, 2x, em AVIF e WebP, nos tamanhos que as molduras usam). A landing usa `<picture>` com essas imagens e `srcset`.
- As capturas só podem mostrar dados fictícios. O script confere se o marcador `ZZ-FICTICIO` está nos dados carregados antes de capturar, e falha se não estiver.
- Cada imagem tem `alt` que descreve o que a tela mostra ("Painel com a taxa de ocupação da UTI Adulto subindo nos últimos seis meses"), não "captura de tela".

### 11. Movimento

- Animações ligadas à rolagem com CSS (`animation-timeline: view()` e `scroll()`), com `@supports` e uma versão via IntersectionObserver para navegadores sem suporte. As durações e curvas saem dos tokens.
- As revelações são curtas: aparecer subindo 16 a 24 px com fade. Nada de texto que voa da lateral, nada que gire.
- Com "reduzir movimento" ligado: sem 3D vivo (só pôster), sem formas se mexendo, sem seção presa na tela (vira uma sequência normal de blocos), revelações só com fade de opacidade ou sem nada.
- A rolagem é a do navegador. Sem rolagem suave por biblioteca, sem travar ou acelerar a rolagem.

### 12. Desempenho (orçamento)

Medido no `vite preview`, com o Playwright simulando um celular médio (CPU 4x mais lenta, rede 4G rápida):

- A maior imagem da primeira dobra (o pôster do robô) aparece em até 2,5 s.
- O layout não pula quando o 3D entra (CLS abaixo de 0,1): o pôster e o canvas ocupam o mesmo espaço reservado.
- O JavaScript inicial da landing, sem o runtime do Spline, fica abaixo de 80 KB comprimido.
- Cada `.splinecode` com até 2 MB; se passar, peça ao Felipe para simplificar a cena (menos polígonos, texturas menores) e anote em PLANO.
- O painel (`/painel/`) não carrega nada do Spline nem da landing.

Registre as medições em `docs/DECISOES.md`.

### 13. Testes e verificação

Acrescente aos testes do Playwright (sem afrouxar nenhum dos que existem):

- **Rede:** em `/`, `/painel/` e `/creditos/`, qualquer requisição para fora da origem faz o teste falhar. Liste a URL na falha.
- **CSP:** a landing recebe a CSP com `'wasm-unsafe-eval'`; o painel e a galeria recebem a CSP atual, sem ela. Nenhum erro de CSP no console em nenhuma das páginas.
- **Sem WebGL** (contexto criado com WebGL desligado): só pôsteres, nenhum erro.
- **Reduzir movimento:** o runtime do Spline não é baixado (confira pelas requisições).
- **Pausa:** o botão para e retoma o 3D, e a escolha continua depois de recarregar.
- **Capturas:** a landing inteira em 375, 768, 1280 e 1440 px, claro e escuro, salvas em `capturas/landing/`.
- **Básico de acessibilidade da fase 1:** uma `h1`, títulos em ordem, todos os botões e links alcançáveis pelo teclado com foco visível, alvos de pelo menos 44 px, contraste dos textos sobre o blur conferido.
- Rode `npm run check` (skill verify) antes de dar cada fatia por pronta.

### 14. Skills

- **Apple design:** composição, ritmo e hierarquia de cada seção, e a revisão visual de cada fatia pelas capturas.
- **Humanizer:** todos os textos da landing e dos créditos.
- **webapp-testing:** testes de rede, CSP, pausa, sem WebGL, e as capturas.
- **verify:** `npm run check` antes de cada commit.
- **graphify:** mapa do código ao fim da landing (saída em `graphify-out/`, fora do git).
- **REA:** só para auditar o nosso build de produção (o que está em `dist/`, o que pesa, o que faz requisição). Nunca para copiar código, animação ou arquivo da Apple ou de qualquer site.

### 15. Fatias (nesta ordem)

1. **Base e robô.** Plano curto em PLANO. Reorganização das páginas, cabeçalhos por página, dependência instalada e licença conferida, decodificador copiado no build. Primeira dobra completa com o robô (ou o pôster provisório), pausa, tema claro e escuro, testes de rede e CSP. Commit.
2. **Roteiro.** Seções 2 a 10 com textos, blur, movimento por rolagem e componentes reais do painel. Commit.
3. **Cenas 2 e 3 e vitrine.** As outras cenas nas seções que combinarem, molduras e o script `npm run vitrine`. Página de créditos. Commit.
4. **Acabamento.** Orçamento de desempenho, versão sem movimento, capturas finais, revisão com Apple design e Humanizer, graphify. Commit.

Se o prazo da fase 1 (22/11) apertar, termine a fatia em andamento num estado limpo, testado e com commit, e escreva em PLANO o que ficou para depois.

Ao fim de cada fatia: atualize `docs/PLANO.md` e `docs/DECISOES.md` e faça um commit local. Dê um aviso curto de progresso ao terminar cada fatia.

### 16. Pendências para registrar em PLANO (decisões do Felipe e da professora)

- Nome do robô (três propostas, `[VALIDAR]`).
- Como será a inscrição no beta (e-mail, formulário de terceiro, outro), lembrando que tudo que envia dado para fora muda a promessa e a CSP.
- Créditos com os dados reais dos autores das cenas.
- Robô próprio antes da pré-venda (ver nota abaixo).

> Nota para o PLANO: o robô vem de um arquivo da comunidade com licença CC BY 4.0. Qualquer pessoa pode usar o mesmo modelo, e a licença não dá direito de marca. Serve bem para o beta, mas para a pré-venda vale encomendar ou modificar o robô a ponto de ele ser nosso, se a ideia for registrar a marca.

### 17. Relatório final

Ao terminar, escreva em `docs/ENTREGA_LANDING.md` um relatório que se entenda sozinho, sem precisar desta conversa:

- o que foi feito em cada fatia e onde está no código;
- as decisões tomadas sem consultar e o motivo de cada uma;
- as medições de desempenho;
- o resultado dos testes e do `npm run check`;
- as capturas principais (caminhos);
- o que ficou pendente e quem decide cada item;
- qualquer requisição externa ou limitação do runtime do Spline que tenha aparecido.
