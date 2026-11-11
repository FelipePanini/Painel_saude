# Decisões técnicas

Decisões não óbvias, com data. A mais recente fica no topo.

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
