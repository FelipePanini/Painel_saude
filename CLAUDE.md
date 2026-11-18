# Projeto: painel de indicadores de gestão em saúde

Site estático em que profissionais e gestores da saúde importam a planilha que já usam, ou lançam os números na própria ferramenta, e veem um painel dinâmico com os indicadores de gestão do setor: assistência, qualidade e operação. Precisa funcionar para todos: idades, familiaridade com tecnologia, visão e equipamentos diferentes. Felipe é o dono do produto; a professora define o conteúdo da área.

## Fases

- **Fase 1, visual (Claude Fable 5.2, até 22/11):** front-end completo com dados fictícios, atrás da interface `src/fonte-de-dados/`. Briefing: `docs/BRIEFING_FASE_1.md`.
- **Fase 2, engenharia (Claude Opus 5.5, de 23/11 a 13/12):** leitura de planilhas, armazenamento, cálculos, privacidade, acessibilidade completa e testes. O visual da fase 1 está aprovado: a aparência só muda para corrigir acessibilidade ou defeitos. Briefing: `docs/BRIEFING_FASE_2.md`.
- A fase atual e o status estão em `docs/PLANO.md`. Nicho, campos e fórmulas: `docs/SPEC.md`.

## Regras (valem sempre)

- IMPORTANT: os dados do usuário nunca saem do navegador. Nada de fetch para fora, beacon, websocket, analytics, gravação de tela ou serviço externo de erros. Nada de CDN, fontes externas ou scripts de terceiros: tudo é empacotado localmente. É a promessa do produto e o que nos mantém fora do papel de operador de dados de saúde na LGPD.
- Nada de finanças: nenhum campo, indicador, gráfico ou texto sobre dinheiro, nem nos dados fictícios. Colunas financeiras da planilha são ignoradas, com aviso.
- Os indicadores são de gestão, agregados por período e setor. A ferramenta nunca sugere diagnóstico, risco de paciente ou conduta, porque isso a enquadraria como dispositivo médico na ANVISA (RDC 657/2022).
- Nada que identifique uma pessoa (nome, CPF, prontuário, data de nascimento, telefone, endereço, cartão SUS) é guardado ou exibido, nem nos dados fictícios.
- Só dados fictícios no repositório e nos testes: `FICTICIO` no nome do arquivo e o marcador `ZZ-FICTICIO` em alguma célula.
- Não copiar código, imagens, vídeos ou fontes de sites de terceiros, inclusive da Apple. Bibliotecas de código aberto com licença permissiva, instaladas como dependência, são permitidas. Não usar a fonte SF Pro nem os ícones SF Symbols.
- Acessibilidade: o piso é o nível AA das WCAG 2.2, porque a Lei Brasileira de Inclusão (art. 63) obriga sites de empresas no Brasil a serem acessíveis. A verificação completa é na fase 2. Na fase 1, não feche portas: HTML semântico, texto de 16 px, foco visível, e cores e movimento só por tokens.

## Stack

- Vite + TypeScript, sem framework de UI.
- Fase 1: Chart.js, @ybouane/liquidglass, Inter via @fontsource, ícones de código aberto (Lucide ou Phosphor) e Playwright para screenshots.
- Landing: Three.js (licença MIT) para o robô 3D, carregado sob demanda e só na landing. As cenas do Spline entram como GLB (sem Draco) em `public/3d/`. O runtime do Spline não é usado: o pacote não declara licença.
- Fase 2: SheetJS pelo CDN oficial (https://cdn.sheetjs.com), na versão mais recente, e nunca o pacote `xlsx` do npm (0.18.5, CVE-2023-30533). Também idb-keyval, Vitest, @axe-core/playwright e, se entrar o modo sem internet, vite-plugin-pwa.
- Leitura de arquivo em Web Worker, com limite de 15 MB. O SheetJS e o vidro carregam sob demanda.
- PDF via folha de estilo de impressão e `window.print()`.
- Hospedagem estática, com a CSP em `public/_headers`.

## Comandos

- `npm run dev`, `npm test`, `npm run test:e2e`, `npm run build`
- `npm run check`: na fase 1, roda typecheck, lint, build e screenshots. Na fase 2, inclui também os testes de unidade, de navegador, o axe e a privacidade. Rode antes de dar algo por pronto.

## Estrutura

- Páginas:
  - `/` (`index.html`): a landing, com o código em `src/landing/` e o estilo em `src/estilos/landing.css`;
  - `/painel/` (`painel/index.html`): o produto, com o código em `src/ui/`. Não carrega nada da landing nem do 3D;
  - `/componentes/`: a galeria de componentes;
  - `/prototipo/`: o protótipo antigo de outubro;
  - `public/3d/`: modelos e pôsteres do robô e das cenas.

- Fase 1:
  - `src/estilos/`: tokens;
  - `src/componentes/`: componentes;
  - `src/ui/`: telas;
  - `src/vidro/`: liquid glass e as três aparências;
  - `src/tipos/` e `src/nichos/`: contratos e configuração do nicho;
  - `src/dados-ficticios/`: dados de exemplo;
  - `src/fonte-de-dados/`: a interface que as telas usam. As telas nunca importam dados fictícios direto.
- Fase 2:
  - `src/leitura/` e `src/mapeamento/`: funções puras, sem DOM;
  - `src/indicadores/`: cálculos puros, todos testados;
  - `src/entrada/`: lógica da central de entrada;
  - `src/armazenamento/`: IndexedDB com registros agregados, mapeamentos, preferências e visões. No modo computador compartilhado, tudo fica só em memória.
- `tests/fixtures/`: planilhas fictícias.
- `docs/`: SPEC, PLANO, DECISOES, briefings, ENTREGA_FASE_1 e TESTE_DE_USABILIDADE.

## Liquid glass

- Variante Regular da @ybouane/liquidglass, só na camada de navegação: barras, abas, botão flutuante e folhas de confirmação. Na landing, só na barra do topo, que fica sobre a faixa fixa e nunca sobre o 3D.
- Nunca em cartões, gráficos, tabelas, na grade de lançamento ou em texto longo. Nunca vidro sobre vidro.
- Regras da biblioteca:
  - uma única raiz `LiquidGlass.init`;
  - elementos de vidro como filhos diretos da raiz;
  - o fundo como elemento irmão dentro da raiz;
  - fontes carregadas antes do init;
  - nada de `:first-child` nos elementos de vidro.
- Três aparências: vidro, CSS (backdrop-filter) e sólida.
  - O interruptor "Efeito de vidro" alterna entre elas.
  - Sem WebGL, cai para a versão CSS.
  - Na impressão, usa a sólida.
  - A fase 2 liga o vidro às preferências do sistema: transparência reduzida e alto contraste.

## Convenções

- Interface em português do Brasil e em linguagem simples. Números e porcentagens com `Intl.NumberFormat('pt-BR')`; datas em dd/mm/aaaa.
- Mobile first, nos modos claro e escuro. Alvos de toque de pelo menos 44 px.
- Cor nunca é a única pista. Cada gráfico aceita um resumo em texto e a visão "Ver como tabela".
- Microinterações de 150 a 300 ms, definidas por tokens.
- Mensagens de erro dizem o que fazer. "Desfazer" em vez de "tem certeza?".
- Nomes de arquivos e funções em português sem acento.

## Como trabalhar

- Cada etapa começa com um plano curto em `docs/PLANO.md`.
- Dentro da etapa, siga sem pedir aprovação para:
  - criar e editar arquivos do projeto;
  - instalar as dependências listadas no briefing da fase;
  - rodar testes e o servidor local;
  - fazer commits locais.
- Peça aprovação antes de:
  - adicionar uma dependência fora da lista;
  - mudar estas regras ou a CSP;
  - na fase 2, mudar o visual além de correções;
  - apagar arquivos fora de `src/`, `tests/` e `docs/`;
  - fazer qualquer coisa que saia do computador (push, deploy, publicar).
- Não remova nem afrouxe testes para eles passarem. Se um teste estiver errado, avise.
- Atualize `docs/PLANO.md` e `docs/DECISOES.md` e faça um commit ao fim de cada fatia.
- Ao compactar a conversa, preserve os arquivos alterados, os comandos de teste e a etapa atual.

## Skills

- Fase 1:
  - Apple design: telas;
  - Humanizer: textos das telas, em português do Brasil;
  - webapp-testing: screenshots;
  - verify: roda o check;
  - graphify: mapa do código no fim da fase.
- Fase 2:
  - xlsx: planilhas de teste e modelo;
  - webapp-testing: testes de navegador;
  - graphify: no início e no fim;
  - Humanizer: textos novos;
  - Apple design: correções visuais;
  - REA: só para auditar o build de produção, nunca para copiar código ou arquivos de terceiros;
  - `/security-review` e `/code-review`;
  - verify: check completo antes de cada commit.
- A pasta `graphify-out/` fica fora do git.
