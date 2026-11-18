# Decisões técnicas

Decisões não óbvias, com data. A mais recente fica no topo.

## 18/11/2026: landing page 3D, fatia 3 (vitrine e créditos)

- **Vitrine com as telas reais do painel.** O `npm run vitrine` faz o build, sobe o `vite preview`, abre o `/painel/` em computador (1280 px), tablet (768 px) e celular (390 px), nos dois temas, em 2x, e salva as imagens em `public/vitrine/`. A lista com o texto alternativo vai para `src/landing/vitrine.json`, e o build roda de novo no fim para levar as imagens novas.
- **Só dados fictícios nas capturas.** A fonte de dados ganhou o método `marcador()`, que a fictícia responde com `ZZ-FICTICIO`. O painel põe o marcador na página, e o script para com erro, sem salvar nada, se não encontrar.
- **WebP, sem AVIF.** O próprio navegador converte as capturas para WebP (canvas), em 1x e 2x. Gerar AVIF pede uma dependência nova (como o `sharp`), que precisa de aprovação; ficou como pendência no PLANO. As 12 imagens somam cerca de 600 KB e só baixam quando a vitrine chega perto da tela (`loading="lazy"`).
- **Texto alternativo a partir da tela**, montado pelo script com o que o painel mostra (mês, indicador em destaque, valor e meta), e não "captura de tela".
- **Moldura de tela** (`src/componentes/molduraDeTela.ts`): cantos arredondados, borda fina e a sombra dos tokens, sem imitar aparelho nenhum. A imagem escura entra pelo `<picture>` com `prefers-color-scheme: dark`. `width` e `height` reservam o espaço da imagem. No computador, as três telas ficam sobrepostas; no celular, a grande em cima e as duas menores lado a lado.
- **Sem capturas, a vitrine some no build** e mostra um aviso "Imagem do painel em breve" só no modo de desenvolvimento.
- **Página de créditos** em `/creditos/`, com o link no rodapé da landing: o robô provisório (próprio), o lugar das cenas do Spline (CC BY 4.0, quando chegarem), a fonte Inter (OFL 1.1) e as bibliotecas com a licença de cada uma, conferida no `package.json` de cada pacote. Ela só tem texto e não carrega 3D, gráfico nem dado.
- **Cenas 2 e 3 não entraram:** os arquivos GLB ainda não existem. As seções de privacidade e de vidro já têm o lugar delas (fundo desfocado e a ilustração da barra).
- **O Playwright roda no máximo 3 abas ao mesmo tempo.** Com 5, o navegador de teste fechou no meio de uma rodada: cada aba pode ter dois contextos WebGL desenhados por software. Com 3, a rodada inteira leva cerca de 20 s.
- **Regra do ESLint para `scripts/`:** os scripts de linha de comando podem usar `console`, porque rodam no Node e não leem dados de usuário. No site, `no-console` continua valendo.

## 18/11/2026: landing page 3D, fatia 2 (roteiro)

- **Seções feitas:** da planilha ao painel (palco preso na tela), os indicadores por área, privacidade, feito para todo mundo, vidro só onde ajuda, para quem é, chamada final e rodapé. Os textos estão no HTML; os números vêm da fonte de dados.
- **A vitrine (seção 7) foi para a fatia 3**, junto com as molduras e o `npm run vitrine`. Sem as capturas do painel, ela seria só molduras vazias.
- **Grupos dos indicadores.** O tipo `Indicador` ganhou o campo `grupo` (assistência, qualidade ou operação). Quedas e lesão por pressão ficaram em Assistência, higiene das mãos em Qualidade, ocupação de leitos em Operação, todos marcados [VALIDAR COM A PROFESSORA]. O briefing pede dois ou três indicadores por área, mas o nicho de exemplo só tem quatro, e a regra é não inventar indicador.
- **O Chart.js saiu do caminho da landing.** O cartão em destaque passou a carregar o gráfico grande sob demanda (`import()` dentro de `iniciarGrafico`). Assim a landing usa os cartões compactos de verdade sem baixar o Chart.js. O painel e a galeria continuam iguais.
- **Tema local.** O seletor dos tokens claros também vale para `[data-tema-local='claro']`, e o dos escuros para `[data-tema-local='escuro']`. É assim que a demonstração troca o tema só do cartão de exemplo, sem mexer no resto da página.
- **Palco da sequência.** No computador, o palco fica preso no meio da tela e os passos rolam ao lado. No celular, ele fica preso em cima, mais baixo (até 38% da tela), e o passo que conta é o que passa na faixa de baixo, onde ele aparece. Com "reduzir movimento", o palco deixa de ficar preso e os passos viram blocos comuns.
- **Revelações ao rolar com CSS** (`animation-timeline: view()`), dentro de `@supports` e só sem "reduzir movimento". Navegadores sem suporte usam um IntersectionObserver (`src/landing/revelar.ts`). Sem JavaScript, tudo aparece direto.
- **O fundo desfocado sobe devagar com a rolagem** (`animation-timeline: scroll()`). Ele é maior que a tela, para a borda de baixo não aparecer quando sobe. A pausa e "reduzir movimento" desligam esse movimento também.
- **A barra da seção "Vidro só onde ajuda" é uma ilustração** na aparência CSS do vidro, sobre um fundo próprio, e não o vidro WebGL: um segundo vidro de verdade na mesma página seria vidro fora da navegação e mais um contexto WebGL.
- **Hífen que não quebra** nos cartões pequenos do palco, para "pacientes-dia" não se partir no meio.
- **Capturas de página inteira** agora são tiradas com "reduzir movimento". Numa foto da página inteira, os blocos que aparecem com a rolagem ainda não "entraram" e saíam em branco. A captura da primeira dobra continua com o movimento e o robô 3D.
- **Testes novos:** a sequência troca a camada do palco a cada passo; os indicadores vêm da fonte de dados, agrupados por área; a demonstração aumenta o texto e troca o tema só do exemplo. O teste de teclado passou a contar também os grupos de opções (rádios), que o teclado alcança.
- **Textos.** Escritos em linguagem simples e sem promessa que não dá para provar (por exemplo, o modo de computador compartilhado aparece como "está nos planos", sem data). A revisão formal com o Humanizer fica para a fatia 4, junto com a amostra de texto da professora.

## 18/11/2026: landing page 3D, fatia 1 (base e robô)

- **O runtime do Spline foi descartado; o 3D usa o Three.js.** O `@splinetool/runtime` 2.0.194 não declara licença no `package.json`, não traz arquivo de licença, e o repositório indicado não é público. Sem licença, valem "todos os direitos reservados", e o briefing manda parar nesse caso. O código dele também traz endereços de `apis.spline.design`, `cdn.spline.design`, `hooks.spline.design`, `relayserver.spline.design`, `www.gstatic.com` (decodificador Draco) e `fonts.gstatic.com`. O Felipe aprovou trocar pelo **Three.js 0.187 (licença MIT)**, com as cenas exportadas do Spline em **GLB**, sem Draco.
- **A CSP não mudou.** O Three.js não usa WebAssembly nem `eval`, então o `'wasm-unsafe-eval'` do briefing deixou de ser necessário. Todas as páginas continuam com a mesma CSP, na seção `/*` do `public/_headers`, e não foi preciso separar seções por caminho. Um teste confere que `/`, `/painel/` e `/componentes/` recebem a CSP sem nenhum `unsafe`.
- **Texturas do GLB sem `fetch`.** O leitor de GLB do Three.js abre as texturas embutidas com `fetch()` num endereço `blob:`, e a CSP só permite `fetch` para a própria origem. Em `src/landing/robo3d.ts`, um pequeno plugin troca esse leitor pelo de imagens comum (`<img>`), que a CSP já aceita (`img-src blob:`). Ainda não deu para testar com um GLB de verdade, porque os arquivos do Spline não chegaram.
- **Robô provisório em 3D, feito no código.** Enquanto `public/3d/robo.glb` não existe, o robô é montado com formas simples do Three.js (cápsulas e esferas), original, nas cores da marca: corpo cinza-gelo, "+" arredondado em azul-petróleo no peito, visor escuro com olhos azul-claros e uma luz âmbar na antena. Ele já faz tudo o que o modelo final vai fazer: flutua, a cabeça segue o cursor (no máximo 20 graus, só em tela com mouse), acena ao clicar ou tocar, e gira e encolhe ao sair da primeira dobra. O pôster (`public/3d/robo-provisorio.svg`) tem o mesmo desenho, em SVG.
- **Troca automática para o GLB.** O `vite.config.ts` define `__ROBO_GLB__` como verdadeiro quando `public/3d/robo.glb` existe. Assim a página não precisa tentar baixar o arquivo e receber um erro 404 quando ele ainda não está lá. O código procura no GLB os objetos `robo`, `cabeca` e, se houver, `braco`.
- **Quando o 3D entra.** Só com a primeira dobra a uma tela de distância, WebGL disponível, "reduzir movimento" desligado, animação não pausada e aparelho sem pedido de economia (economia de dados, 4 GB de memória ou menos, ou 4 núcleos ou menos). Em qualquer outro caso, fica o pôster, que flutua devagar só com CSS. O desenho para quando a dobra sai da tela ou a aba fica escondida. Ao sair da página, a cena é descartada e libera a placa de vídeo. Contextos WebGL ao mesmo tempo: no máximo dois, o do robô e o do vidro.
- **Pausa.** O botão "Pausar animação" / "Retomar animação" para o robô e as formas do fundo, e fica salvo no `localStorage` (com `try/catch`). Com a pausa ligada, o 3D nem é baixado na próxima visita.
- **O painel foi para `/painel/`.** A visão geral (cartão em destaque, cartões compactos e "O que mudou") virou um componente compartilhado, `src/ui/visaoGeral.ts`, usado pelo painel e pela galeria. O painel não baixa nada da landing nem do 3D, e um teste confere isso.
- **Vidro na landing.** Só na barra do topo, que fica sobre a faixa fixa, como nas outras páginas. O robô fica abaixo da barra, então o vidro não precisa refratar o canvas do 3D, e o desempenho não sofre.
- **Contraste sobre o fundo desfocado.** Um teste de unidade (`tests/unidade/contraste.test.ts`) mede o texto e o texto suave contra cada forma de cor, no pior ponto, nos dois temas. Todos passam de 4,5:1.
- **Medições do build (gzip).** JavaScript inicial da landing: 1,5 KB, mais 0,8 KB do carregador de pedaços (o orçamento é 80 KB). O 3D, baixado só quando entra: 86 KB do robô com o Three.js, mais 59 KB do núcleo do Three.js, mais 14 KB do leitor de GLB, que só baixa quando houver `robo.glb`. CSS da landing: 1,5 KB. As medições de tempo (LCP e CLS com celular simulado) ficam para a fatia 4.
- **A captura de página inteira corta o fundo desfocado** depois da primeira tela, porque ele é fixo (`position: fixed`) e o Playwright só o desenha uma vez. Na página de verdade, o fundo acompanha a rolagem.
- **Capturas em `capturas/landing/`**, como pede o briefing, com essa pasta fora do git (`.gitignore`).
- **Nome do robô [VALIDAR].** Três propostas: **Prumo** (o fio de prumo, que mostra se as coisas estão no eixo), **Lume** (luz, clareza sobre os números) e **Teco** (curto, simpático e fácil de dizer). Até a decisão, os textos dizem "o robô".

## 11/11/2026: fase 1, fim da Etapa 1 (direção A, tokens e componentes)

- **Direção visual A, "Sereno", escolhida pelo Felipe.** Clara e arejada: azul-petróleo (`#0b6b8a` no tema claro, `#5cc4e2` no escuro) para as ações, âmbar para o que pede atenção, cantos de 20 px nos cartões, um indicador em destaque com o gráfico e os outros ao lado. A direção B foi para `docs/arquivo/direcoes-etapa-1/`. A ideia dela de pôr os indicadores em lista pode voltar como uma visão dentro da A.
- **Valores finais do vidro.** Preset "Regular Glass" (os padrões da biblioteca: `refraction 0.69`, `chromAberration 0.05`, `edgeHighlight 0.05`, `fresnel 1`, `zRadius 40`), com três ajustes: `blurAmount 0.2`, para o texto ficar legível nos dois temas; `shadowOpacity 0.18`, mais discreta que o padrão de 0,30; e `cornerRadius` lido dos tokens (`--raio-barra`, 28 px, na barra do topo e no botão flutuante; `--raio-abas`, 32 px, na barra de abas). Ficam em `AJUSTES_DO_VIDRO`, em `src/componentes/navegacao.ts`.
- **Tema definido antes da primeira pintura por `public/tema-inicial.js`**, um arquivo de 1 linha carregado no `<head>`. Sem ele, quem usa o tema escuro via a página piscar em claro. Ele é um arquivo próprio porque a CSP não permite script embutido no HTML. Depois, `src/tema.ts` assume.
- **A preferência de tema ainda não é guardada.** Ela vale enquanto a página está aberta e vai no endereço da galeria (`?tema=`). Guardar de verdade é da fase 2, junto com as outras preferências.
- **Token `--cor-borda-forte`** para o contorno de campos, seletores e chips: a borda comum (`--cor-borda`) é clara demais para marcar onde um campo começa.
- **Erro tem cor própria (`--cor-erro`)**, separada do âmbar de atenção, mas só aparece em erro de verdade (arquivo ilegível, campo inválido) e sempre com ícone e texto.
- **Cartão sem dados diz "Sem dados neste mês"** com palavras, além do traço no lugar do número.
- **O protótipo antigo ganhou uma cópia dos estilos de outubro** (`prototipo/estilos-antigos/`), para continuar igual enquanto o Felipe não decide se a pasta será apagada.

## 11/11/2026: fase 1, Etapa 1 (plano e direções visuais)

- **Plano novo de duas fases.** Fase 1 (visual, Fable 5.2) e fase 2 (engenharia, Opus 5.5). O roteiro antigo foi para `docs/arquivo/`. O "protótipo das entrevistas" abaixo é do plano antigo.
- **O vidro de verdade funciona com a CSP atual.** A `@ybouane/liquidglass` 1.0.3 foi testada no build, com a CSP de `public/_headers`, e não gerou nenhuma violação. Não foi preciso mudar a CSP. O único aviso é do driver gráfico do navegador de teste ("GL Driver Message"), que desenha o WebGL por software; o teste ignora só esse aviso.
- **`.npmrc` com `ignore-scripts=true`.** A biblioteca de vidro traz um `postinstall` (`patch-package`) que só serve para quem a desenvolve e quebra o `npm install`. Com a opção, nenhum pacote roda script na instalação, o que também é mais seguro. O arquivo publicado da biblioteca já vem pronto, então nada se perde.
- **Valores do vidro (provisórios, até a direção ser escolhida).** Preset "Regular Glass" (os padrões da biblioteca), com três ajustes: `blurAmount: 0.2`, para o texto ficar legível; `shadowOpacity: 0.18`, mais discreta que o padrão de 0,30; e `cornerRadius` igual ao raio de cada barra (28 e 32 px na direção A, 16 e 20 px na B).
- **O vidro fica sobre faixas de fundo fixas**, e não sobre o conteúdo que rola: uma faixa no topo e, no celular, uma faixa na base, onde o conteúdo some aos poucos. A biblioteca só fotografa as faixas, uma vez. Custa pouco e a rolagem não sofre.
- **No computador, "Adicionar dados" é um botão sólido dentro da barra de vidro**, e não um botão de vidro flutuante: sem uma faixa de fundo embaixo dele, o vidro não teria o que refratar. No celular ele é um botão de vidro flutuante, sobre a faixa da base.
- **Uma raiz de vidro só** (`#camada-nav`), com as faixas e os elementos de vidro como filhos diretos. O módulo `src/vidro/vidro.ts` carrega a biblioteca sob demanda, espera as fontes, e cai para a versão CSS sem WebGL ou se o init falhar.
- **Tema por `data-tema` no `<html>`**, resolvido pelo JavaScript a partir da preferência do sistema ou da escolha da pessoa. Assim as preferências podem oferecer "claro, escuro ou do sistema" sem duplicar os tokens.
- **Duração das animações lida dos tokens em milissegundos** (`src/componentes/movimento.ts`). O build encurta `0ms` para `0s`, e uma comparação de texto com `'0ms'` deixava o gráfico animar mesmo com "reduzir movimento" ligado. As capturas de tela mostraram o defeito.
- **Eixo do gráfico com limites e passo em números redondos**, para as marcas baterem com os rótulos (70%, 80%, 90%).
- **Frase de "setor não lançou os números" só vale para setor que já lançava antes.** Um setor novo não aparece como atrasado nos meses em que ainda não existia. Um teste de unidade pegou esse defeito.
- **Ícones: Lucide** (licença ISC). **Minigráficos em SVG próprio**, sem biblioteca; o Chart.js fica para os gráficos maiores.
- **`npm audit` aponta uma falha moderada no `minimatch`**, usado só pelo ESLint (ferramenta de desenvolvimento, não vai para o site). A correção automática rebaixaria o ESLint para a versão 9. Fica para revisar na fase 2.

## 24/10/2026: protótipo das entrevistas (plano antigo)

- **O protótipo entra no build** (`build.rolldownOptions.input` em `vite.config.ts`), em `/prototipo/`. Assim o Playwright o testa com a CSP de produção, e isso já mostrou que o Chart.js funciona sem `unsafe-inline`. Se o site for publicado antes das entrevistas, o link também serve para mostrar à professora. Remover a entrada e a pasta antes do lançamento.
- **Números e frases calculados a partir dos dados fictícios** (`prototipo/calculos.ts`), com testes que conferem os valores calculados à mão. Assim cartões, frases e gráficos nunca se contradizem quando alguém mexe nos dados.
- **Linhas retas no gráfico de linhas** (sem `tension`). A curva suavizada desenhava altos e baixos que não existem entre um mês e outro.
- **Aba "Enfermagem" em vez de "Gestão de enfermagem"**: o nome longo quebrava em duas linhas no celular. O título do painel continua dizendo do que se trata.
- **Metas com ícone e texto** ("Dentro da meta", "Acima da meta"), nunca só com cor.
- **Token novo `--cor-preenchimento`** para o fundo do controle segmentado e do selo.

## 24/10/2026: esqueleto do projeto (Fase 0)

- **Vite 8 + TypeScript, sem framework de UI.** O produto tem poucas telas e o ganho de um framework não paga o peso e a complexidade.
- **TypeScript 6.0, não 7.** O typescript-eslint 8 aceita TypeScript até 6.0 (`>=4.8.4 <6.1.0`). Subir para 7 quando o typescript-eslint suportar.
- **SheetJS 0.20.3 instalado do CDN oficial** (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`). O pacote `xlsx` do npm está parado na 0.18.5, vulnerável à CVE-2023-30533. O tarball entra no `package.json` e vai empacotado no build, então o site não carrega script externo. Para atualizar, troque a URL pela versão nova listada em https://docs.sheetjs.com.
- **Ordem do `npm run check`: typecheck, lint, unidade, build, navegador.** O roteiro listava os testes de navegador antes do build, mas o Playwright testa o build de produção (`vite preview`), então o build precisa vir antes.
- **Cabeçalhos de segurança numa única fonte.** `public/_headers` é o arquivo que o Cloudflare Pages ou o Netlify leem em produção. Um plugin em `vite.config.ts` lê o mesmo arquivo e aplica os cabeçalhos no `vite preview`. Assim os testes do Playwright rodam com a CSP real. O servidor de desenvolvimento (`npm run dev`) não recebe a CSP, porque o recarregamento automático do Vite usa scripts que ela bloquearia.
- **CSP sem `unsafe-inline`.** `assetsInlineLimit: 0` no build impede que o Vite embuta arquivos no HTML. `worker-src` aceita `blob:` porque o Web Worker de leitura (Fase 4) pode precisar.
- **Fontes:** pilha do sistema com a Inter auto-hospedada (@fontsource, subconjunto latino, pesos 400 a 700). A SF Pro não pode ser embutida em site; em aparelhos Apple, `system-ui` e `-apple-system` já mostram a fonte do sistema.
- **`no-console` como erro no ESLint**, para reforçar a regra de que conteúdo de planilha nunca vai para o console.
- **Playwright em duas larguras (390 e 1280 px)** como projetos separados, para que todo teste de navegador rode no celular e no computador.
