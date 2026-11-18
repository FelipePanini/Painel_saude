# Entrega da landing page 3D

Relatório de 18/11/2026. Ele se entende sem a conversa com o Claude Code. O briefing é o `docs/BRIEFING_LANDING_3D.md`; as decisões, com o motivo de cada uma, estão em `docs/DECISOES.md` (entradas de 18/11).

## Em resumo

- A landing está em `/`, com o robô em 3D na primeira dobra e oito seções depois dela. O painel de exemplo foi para `/painel/` e os créditos estão em `/creditos/`.
- O 3D usa o **Three.js** (licença MIT), não o runtime do Spline: o pacote do Spline não declara licença e traz endereços de servidores da Spline e do Google. O Felipe aprovou a troca.
- A **CSP não mudou**. Nada sai do navegador: um teste falha se qualquer página fizer uma requisição para fora.
- O robô é **provisório**, feito no código com formas simples. Quando `public/3d/robo.glb` existir, ele entra sozinho no lugar.
- O orçamento de desempenho passou com folga, e o `npm run check` passa: 15 testes de unidade e 74 de navegador.

## Como ver

```bash
npm run dev
```

Abra `http://localhost:5173/` (landing), `/painel/` (painel de exemplo), `/creditos/` e `/componentes/` (galeria de componentes).

## O que foi feito, fatia por fatia

### Fatia 1: base e robô

- **Páginas:** `index.html` virou a landing, `painel/index.html` é o produto. A visão geral do painel virou um componente compartilhado (`src/ui/visaoGeral.ts`), usado pelo painel e pela galeria.
- **Robô:** `src/landing/robo3d.ts` (a cena) e `src/landing/carregarRobo.ts` (quando ela entra).
  - Ele flutua, a cabeça segue o cursor (no máximo 20 graus, só em tela com mouse), acena ao clicar ou tocar, e gira e encolhe ao sair da primeira dobra.
  - O 3D só é baixado com WebGL, sem "reduzir movimento", sem pausa e em aparelho que não pede economia (economia de dados, 4 GB de memória ou menos, ou 4 núcleos ou menos). Fora disso, fica o pôster `public/3d/robo-provisorio.svg`, que flutua só com CSS.
  - Fora da tela ou com a aba escondida, o desenho para. Ao sair da página, a cena libera a placa de vídeo.
- **Pausa:** `src/landing/pausa.ts`. Para o robô e o fundo, e fica salva no navegador.
- **Vidro:** só na barra do topo, sobre a faixa fixa.

### Fatia 2: roteiro

As seções ficam no `index.html`, e as partes com dados em `src/landing/secoes.ts`:

1. **Da planilha ao painel:** um palco preso na tela, em que a planilha vira cartões e depois um gráfico, em três passos.
2. **Assistência, qualidade e operação:** os cartões reais do painel, agrupados por área.
3. **Fica tudo no seu computador:** três frases sobre privacidade, só com o que é verdade ou está no plano.
4. **Feito para todo mundo:** uma demonstração ao vivo, que aumenta o texto e troca o tema só do cartão de exemplo.
5. **Vidro só onde ajuda:** uma ilustração da barra de navegação.
6. **O painel por dentro:** a vitrine (fatia 3).
7. **Para quem cuida da gestão:** coordenação de enfermagem, gestão de unidade e núcleo de qualidade.
8. **Quero testar o beta**, e o rodapé com o aviso "Ferramenta de gestão. Não faz diagnóstico e não indica conduta."

As revelações ao rolar são feitas com CSS (`animation-timeline: view()`), e há uma versão com IntersectionObserver para navegadores sem suporte (`src/landing/revelar.ts`). O fundo desfocado sobe devagar com a rolagem. Com "reduzir movimento", nada se mexe e o palco vira blocos comuns.

### Fatia 3: vitrine e créditos

- **`npm run vitrine`** (`scripts/vitrine.mjs`): captura o `/painel/` em computador, tablet e celular, nos dois temas, em 2x, e salva WebP em `public/vitrine/`, com o texto alternativo em `src/landing/vitrine.json`. Antes de capturar, ele confere o marcador `ZZ-FICTICIO` dos dados e para com erro se não encontrar.
- **Moldura de tela:** `src/componentes/molduraDeTela.ts`. Não imita aparelho nenhum.
- **Créditos:** `creditos/index.html`, com as licenças conferidas no `package.json` de cada pacote.

### Fatia 4: acabamento

- **Desempenho:** `npm run desempenho` (`scripts/desempenho.mjs`) mede a landing com um celular simulado.
- **Textos:** revisados com o Humanizer. Quatro frases mudaram por repetição ou por falarem da própria página.
- **Revisão visual:** feita pelas capturas, com os princípios da skill de Apple design, em 375, 390, 768, 1280 e 1440 px e nos dois temas. Os defeitos achados foram corrigidos: borda do visor serrilhada, braço fora do quadro no aceno, robô grande demais no celular, borda do fundo desfocado à mostra, grupos de indicadores espremidos, hífen quebrando "pacientes-dia", palco cobrindo o passo no celular, barra ilustrativa saindo da tela e coluna da planilha cortada.
- **Mapa do código:** `graphify update .` gerou o mapa em `graphify-out/` (fora do git), com 492 nós, 891 ligações e 19 grupos.

## Medições de desempenho

`npm run desempenho`: celular simulado (Pixel 7), processador 4x mais lento, rede 4G rápida (9 Mbit/s, 40 ms), sobre o build.

| Medida | Com o 3D | Com "reduzir movimento" | Orçamento |
| --- | --- | --- | --- |
| LCP (maior elemento da primeira tela) | 244 ms | 228 ms | até 2,5 s |
| CLS (quanto o layout pula) | 0,000 | 0,000 | abaixo de 0,1 |
| JavaScript inicial, sem o 3D | 35 KB | 35 KB | até 80 KB |
| JavaScript do 3D, baixado depois | 142 KB | não baixa | — |

Limites desta medição:

- **Servidor local:** é o `vite preview` no próprio computador. Num servidor de verdade, a latência é maior.
- **Aparelho simulado:** o navegador simulado informa os núcleos e a memória do Mac. Num celular de verdade com 4 núcleos ou menos, o robô fica no pôster de propósito.
- **Arquivos 3D:** o orçamento de 2 MB por arquivo ainda não pôde ser medido, porque os GLB não chegaram.
- **Lighthouse:** não rodei, porque não está instalado e pediria uma dependência nova.

## Testes e verificação

O `npm run check` passa:

- typecheck e lint sem erros;
- 15 testes de unidade, entre eles o contraste do texto sobre o fundo desfocado (pelo menos 4,5:1 nos dois temas);
- build;
- 74 testes de navegador, com 8 pulados de propósito: as capturas rodam só no projeto "computador".

Os testes da landing (`tests/e2e/landing.spec.ts`) cobrem:

- **Rede e CSP:** `/`, `/painel/`, `/componentes/` e `/creditos/` sem nenhuma requisição para fora, sem `unsafe` na CSP e sem erro no console.
- **Painel isolado:** o painel não baixa nada da landing nem do 3D.
- **Robô:** com WebGL, ele entra no mesmo espaço do pôster e acena. Sem WebGL, fica só o pôster. Com "reduzir movimento", o 3D nem é baixado. A pausa continua depois de recarregar.
- **Seções:** o palco troca de camada a cada passo; os indicadores vêm da fonte de dados, por área; a vitrine mostra três telas com texto alternativo; a demonstração aumenta o texto e troca o tema só do exemplo; os créditos têm uma `h1` e são alcançáveis pelo rodapé.
- **Acessibilidade básica:** uma `h1`, títulos em ordem, e todos os links, botões e grupos de opções alcançáveis pelo teclado, com foco visível e alvo de pelo menos 44 px.

`npm audit --omit=dev`: nenhuma falha nas dependências que vão para o site.

## Capturas principais

Geradas pelo `npm run check`, em `capturas/landing/` (fora do git):

- primeira dobra com o robô 3D: `375-claro-dobra.png`, `1280-claro-dobra.png`, `1440-escuro-dobra.png` (e as outras larguras e temas);
- página inteira, com "reduzir movimento" para todos os blocos aparecerem: `375-escuro-pagina.png`, `1280-claro-pagina.png`.

As telas da vitrine estão em `public/vitrine/` (no git).

## Decisões tomadas sem consultar

| Decisão | Motivo |
| --- | --- |
| O robô provisório é 3D (feito no código), e não só um pôster em SVG | Com o Three.js aprovado, dava para testar já todo o comportamento pedido (cursor, aceno, despedida, pausa); o SVG ficou como pôster |
| A troca pelo GLB é automática, decidida no build | A página não precisa tentar baixar um arquivo que pode não existir e receber um erro 404 |
| Texturas do GLB lidas com `<img>`, e não com `fetch` | A CSP só permite `fetch` para a própria origem; assim ela não precisou mudar |
| O Chart.js do cartão em destaque passou a ser carregado sob demanda | A landing usa os cartões reais sem baixar o Chart.js |
| Indicadores por área: quedas e lesão por pressão em Assistência, higiene das mãos em Qualidade, ocupação de leitos em Operação | O nicho de exemplo só tem quatro indicadores, e a regra é não inventar. Está marcado [VALIDAR COM A PROFESSORA] |
| A barra da seção de vidro é uma ilustração em CSS, e não o vidro WebGL | Vidro de verdade fora da navegação quebraria a regra e abriria mais um contexto WebGL |
| A vitrine usa WebP, sem AVIF | AVIF pede uma dependência nova para converter (por exemplo, `sharp`) |
| As capturas de página inteira são tiradas com "reduzir movimento" | Numa foto da página inteira, os blocos que aparecem com a rolagem saíam em branco |
| O Playwright roda no máximo 3 abas ao mesmo tempo | Com 5, o navegador de teste fechou no meio: cada aba pode ter dois contextos WebGL desenhados por software |
| O ESLint libera `console` só em `scripts/` | Os scripts rodam no Node e não leem dados de usuário; no site, a regra continua valendo |

## Pendências e quem decide

| Pendência | Quem decide |
| --- | --- |
| Arquivos do Spline em `public/3d/`: `robo.glb`, `cena-2.glb`, `cena-3.glb` (GLTF Binary, sem Draco), os pôsteres PNG e o `CREDITOS.txt` | Felipe |
| Cenas 2 e 3 nas seções de privacidade e de vidro, quando os GLB chegarem | Claude Code, depois dos arquivos |
| Nome do robô: Prumo, Lume ou Teco [VALIDAR] | Felipe |
| Como será a inscrição no beta. Tudo que envia dado para fora muda a promessa e a CSP | Felipe |
| Créditos com os dados reais dos autores das cenas | Felipe, com os dados do Spline |
| Robô próprio antes da pré-venda. O modelo da comunidade (CC BY 4.0) não dá direito de marca | Felipe |
| Grupos e textos dos indicadores [VALIDAR COM A PROFESSORA] | A professora |
| Amostra de texto da professora, para a segunda revisão com o Humanizer | Felipe e a professora |
| Imagens da vitrine em AVIF (dependência nova) | Felipe |
| Lighthouse (dependência nova ou rodar à mão no Chrome) | Felipe |
| Protótipo antigo (`prototipo/`), que ainda mostra dinheiro: apagar ou manter | Felipe |
| Enviar os commits ao GitHub | Felipe |

## Requisições externas e limites do 3D

- **Spline:** o runtime oficial não foi usado. O código dele traz `apis.spline.design`, `cdn.spline.design`, `hooks.spline.design`, `relayserver.spline.design`, `www.gstatic.com` (decodificador Draco) e `fonts.gstatic.com`.
- **Three.js:** não faz nenhuma requisição para fora; só tem links em comentários. Os testes de rede passam com o robô 3D ligado.
- **GLB de verdade:** ainda não foi testado com o arquivo real, porque ele não chegou. Quando chegar:
  - exporte sem Draco, porque o decodificador viria do Google;
  - use texto em 3D só se for convertido em forma, porque texto do Spline puxa fonte de fora;
  - nomeie os objetos `robo`, `cabeca` e, se houver, `braco`.
