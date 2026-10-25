# Projeto: painel de indicadores a partir de planilhas (área da saúde)

Site estático em que o profissional de saúde arrasta a planilha que já usa (.xlsx ou .csv) e vê um painel com os indicadores do seu nicho. Felipe cuida do produto e do código; a professora, do conteúdo da área. O nicho, as colunas e os indicadores estão em `docs/SPEC.md`: leia antes de mexer em indicadores.

## Regras invioláveis

- IMPORTANT: a planilha do usuário nunca sai do navegador. Nada de fetch, beacon, websocket, analytics, gravação de tela (session replay) ou serviço externo de erros com conteúdo da planilha. Toda leitura e todo cálculo rodam no cliente.
- Nunca usar, pedir ou commitar dados reais de pacientes. As planilhas de teste são fictícias, têm `FICTICIO` no nome do arquivo e o marcador `ZZ-FICTICIO` em alguma célula (o teste de privacidade procura por ele).
- Os indicadores são de gestão: contagens, taxas, valores, prazos. Nunca gerar diagnóstico, risco de um paciente ou sugestão de conduta, porque isso enquadraria o software como dispositivo médico na ANVISA (RDC 657/2022). Se uma tarefa pedir isso, pare e avise.
- Nunca copiar código, imagens, vídeos ou fontes de sites de terceiros, inclusive da Apple. Inspiração sim, cópia não.
- Não embutir a fonte SF Pro (a licença da Apple não permite em site). Usar a pilha de fontes do sistema com Inter auto-hospedada.

## Stack

- Vite + TypeScript, sem framework de UI. Chart.js para gráficos. idb-keyval para IndexedDB. Inter via @fontsource.
- SheetJS instalado pelo CDN oficial (https://cdn.sheetjs.com), na versão mais recente. Nunca o pacote `xlsx` do npm: está parado na 0.18.5, vulnerável à CVE-2023-30533.
- Leitura do arquivo dentro de um Web Worker.
- PDF via folha de estilo de impressão + `window.print()`. Sem biblioteca de PDF.
- Testes: Vitest (unidade) e Playwright (fluxos e privacidade).
- Hospedagem estática (Cloudflare Pages ou Netlify) com cabeçalhos de segurança em `public/_headers`.

## Comandos

- `npm run dev`: servidor local
- `npm test`: testes de unidade (Vitest)
- `npm run test:e2e`: testes de navegador (Playwright), inclui `tests/e2e/privacidade.spec.ts`
- `npm run build`: build de produção em `dist/`
- `npm run check`: typecheck, lint, testes de unidade, testes de navegador e build. Rode antes de dizer que terminou.

## Estrutura

- `src/leitura/`: ler o arquivo, achar o cabeçalho, limpar valores. Funções puras, sem DOM.
- `src/mapeamento/`: sugerir e lembrar qual coluna é data, local, valor etc.
- `src/nichos/`: um arquivo de configuração por nicho (colunas esperadas e sinônimos, indicadores, frases, limites).
- `src/indicadores/`: cálculos puros, todos com teste.
- `src/ui/`: telas e componentes.
- `src/armazenamento/`: IndexedDB. Guarda só mapeamentos, preferências e, com a opção ligada pelo usuário, agregados mensais. Nunca linhas brutas.
- `tests/fixtures/`: planilhas fictícias. `prototipo/`: protótipo descartável das entrevistas.
- `docs/SPEC.md`: nicho e indicadores. `docs/DECISOES.md`: decisões técnicas com data.

## Convenções

- Interface toda em português do Brasil. Números e moeda com `Intl.NumberFormat('pt-BR')`, datas em dd/mm/aaaa.
- Mobile first: tudo funciona a partir de 360 px de largura.
- Acessibilidade: contraste AA, foco visível, navegação por teclado. Cor nunca é a única pista; usar texto ou ícone junto.
- Movimento: animações curtas (150 a 300 ms) e sutis, desligadas com `prefers-reduced-motion`. Animação nunca atrasa a leitura de um número.
- Modo escuro via `prefers-color-scheme`.
- Mensagens de erro dizem o que fazer, por exemplo: "A coluna de datas tem textos que não são datas, como 'abc' na linha 14."
- Nomes de arquivos e funções em português sem acento. Código claro vale mais que código esperto.

## Como trabalhar

- Mudança em mais de um arquivo: mostre o plano antes de editar.
- Uma fatia pequena por vez, com teste, e commit ao final de cada fatia.
- Antes de dizer que terminou, rode `npm run check` e mostre a saída. Em mudança visual, tire screenshots em 390 px e 1280 px e compare com o pedido.
- Registre decisões não óbvias em `docs/DECISOES.md`.
- Ao compactar a conversa, preserve a lista de arquivos alterados, os comandos de teste e a fatia atual.

## Skills deste projeto

- Telas e revisão visual: skill de Apple design (princípios das Human Interface Guidelines aplicados à web).
- Qualquer texto que o usuário lê: Humanizer, sempre em português do Brasil.
- Testes no navegador: webapp-testing. Planilhas de teste: xlsx.
- Mapa do código: graphify. A pasta `graphify-out/` fica fora do git.
