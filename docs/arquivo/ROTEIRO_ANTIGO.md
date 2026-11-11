# Roteiro de prompts para o Claude Code

> **Arquivado em 11/11/2026.** Este roteiro foi substituído pelo plano de duas fases: `docs/BRIEFING_FASE_1.md`, `docs/BRIEFING_FASE_2.md` e `docs/PLANO.md`. Ele fica aqui só como histórico. Não siga os prompts abaixo: eles ainda falam de finanças, que saíram do escopo.

Este roteiro constrói o MVP em fases pequenas, na ordem do cronograma do projeto. O `CLAUDE.md` guarda as regras fixas, que o Claude Code lê sozinho em toda sessão. Aqui ficam os prompts, um por fase.

**Como usar**

- Cole um prompt por vez e só passe para a fase seguinte quando o critério de "pronto" estiver cumprido.
- Rode `/clear` entre fases. Uma sessão limpa com um bom prompt rende mais que uma sessão longa cheia de correções.
- Nas fases grandes, entre no modo de planejamento antes de colar o prompt: aperte `Shift+Tab` até aparecer `⏸ plan mode on`. Para editar o plano antes de aprovar, use `Ctrl+G`.
- Se você corrigir a mesma coisa duas vezes, pare: `/clear` e reescreva o prompt com o que aprendeu.
- Peça sempre evidência (saída dos testes, screenshots) em vez de aceitar "pronto".
- Nomeie a sessão de cada fase com `/rename` (por exemplo, `fase-4-leitura`) para retomar depois com `claude --resume`.

---

## Antes de começar (uma vez)

1. Crie a pasta do projeto no seu computador pessoal. Não use computador, contas ou horário do trabalho: a Lei do Software protege o que você cria sem recursos do empregador.
2. Rode `git init`, copie o `CLAUDE.md` para a raiz e, depois de abrir o Claude Code, confira com `/context` se ele foi carregado.
3. Crie o repositório no GitHub numa conta dos sócios (ou de uma organização dos dois), nunca numa conta ligada ao empregador.
4. Confira as skills instaladas com `/skills` e instale as que faltarem:
   - **Humanizer:** `git clone https://github.com/blader/humanizer.git ~/.claude/skills/humanizer`
   - **graphify** (precisa de Python 3.10 ou mais novo): `uv tool install graphifyy` (ou `pip install graphifyy`), depois `graphify install`
   - **xlsx e webapp-testing** (skills oficiais da Anthropic): no Claude Code, `/plugin marketplace add anthropics/skills` e escolha as duas pelo `/plugin`
   - **Apple design:** a que você já usa. Nos prompts ela aparece como `/apple-design`; troque pelo nome exato que aparece no seu `/skills`.

### Qual skill entra em cada fase

| Skill | Para que serve aqui | Fases |
| --- | --- | --- |
| Apple design | Hierarquia, espaçamento, tipografia e revisão das telas | 1, 5, 6, 8, 9 |
| Humanizer | Todo texto que o usuário lê, em português do Brasil e com a voz da professora | 1, 7, 9 |
| xlsx | Gerar as planilhas fictícias de teste | 3 |
| webapp-testing | Testes no navegador com Playwright e screenshots | 4 a 10 |
| graphify | Mapa do código para o Claude Code navegar e para mostrar a arquitetura à professora | Depois da 6 |
| verify (criada na Fase 0) | Roda `npm run check` antes de cada commit | Todas |
| `/code-review` e `/security-review` | Revisão de bugs e de segurança; já vêm no Claude Code | 10 e quando quiser |

O Humanizer foi pensado a partir de padrões de texto de IA em inglês. Por isso os prompts pedem português do Brasil explicitamente e usam um texto da professora como amostra de voz.

### Sobre o REA

Deixei o REA de fora. Ele (Reverse Engineer Anything) desmonta programas compilados, como apps de computador e de celular; para um site, não ajuda. E usar uma ferramenta assim para copiar o que a Apple fez (código, vídeos, imagens, fontes) num produto pago cria risco de direito autoral. Se instalar para outro projeto, baixe só do repositório oficial.

O caminho para ter animações com "cara de Apple" está na Fase 9: grave ou descreva o efeito que você gostou e peça para o Claude Code recriar a sensação com código próprio. Para aproveitar "algo pronto", use componentes de código aberto com licença MIT e mantenha a atribuição.

---

## Fase 0: esqueleto do projeto

**Quando:** agora, a qualquer momento antes de 16/nov. **Modo:** planejamento.

```text
Leia o CLAUDE.md. Estamos começando do zero.

Monte o esqueleto do projeto, ainda sem nenhuma funcionalidade:
1. Vite + TypeScript, sem framework de UI, com a estrutura de pastas do CLAUDE.md.
2. Dependências: Chart.js, idb-keyval, @fontsource/inter e SheetJS pelo CDN oficial. Confira em https://docs.sheetjs.com qual é a versão atual. Não instale o pacote `xlsx` do npm.
3. Vitest e Playwright configurados, com um teste de exemplo passando em cada um.
4. ESLint e o script `npm run check` rodando typecheck, lint, testes de unidade, testes de navegador e build, nessa ordem.
5. `public/_headers` com Content-Security-Policy restritiva: tudo em 'self', `connect-src 'self'`, nenhum script ou fonte externa, `object-src 'none'`, `frame-ancestors 'none'`. Inclua também Referrer-Policy, X-Content-Type-Options e Permissions-Policy. Garanta que a mesma política valha quando os testes do Playwright rodarem sobre o build.
6. Uma página inicial vazia com: pilha de fontes `system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif`; tokens de design em CSS (cores, espaçamentos, raios, tipografia); modo claro e escuro.
7. A skill de projeto `.claude/skills/verify/SKILL.md`, que roda `npm run check` e resume o resultado.
8. `docs/DECISOES.md` com as decisões desta fase e `.gitignore` incluindo `graphify-out/`.

Me mostre o plano antes de criar os arquivos.
Pronto quando: `npm run check` passa e você me mostra a saída. Faça o commit.
```

Com uma skill chamada `verify` no projeto, o Claude Code passa a rodá-la antes de cada commit.

---

## Fase 1: protótipo para as entrevistas

**Quando:** antes ou durante as entrevistas (2 a 15/nov). Mostrar algo concreto rende respostas melhores do que perguntar no abstrato. **Modo:** normal.

```text
Leia o CLAUDE.md. Crie em `prototipo/` um protótipo navegável e descartável para mostrar em entrevistas. Ele não lê arquivo nenhum: usa dados fictícios embutidos no código.

Duas abas, uma por hipótese de nicho:
- Plantonista: plantões em 3 hospitais fictícios ao longo de 3 meses. Total recebido, valor por hora de cada hospital, pagamentos atrasados e comparação com o mês anterior.
- Gestão de enfermagem: indicadores mensais de uma unidade fictícia. Quedas, lesão por pressão e adesão à higiene das mãos, com meta e tendência.

Cada aba tem cartões com os números principais no topo, 2 gráficos, 3 frases em português claro explicando o que mudou e um botão "Baixar PDF" que só abre a impressão.

Use a /apple-design para hierarquia, espaçamento e tipografia. Revise todos os textos com o /humanizer, em português do Brasil, sem cara de texto de IA.
Pronto quando: abre com `npm run dev` em /prototipo/, funciona em 390 px e 1280 px, e você me mostra screenshots das duas larguras tiradas com o Playwright.
```

---

## Fase 2: especificação do nicho

**Quando:** semana de 16/nov, logo depois de escolher o nicho. **Faça com a professora do lado:** é ela quem responde as perguntas da área.

Antes, crie `docs/entrevistas.md` com o resumo das conversas, sem nomes de pessoas nem dados de pacientes.

```text
Escolhemos o nicho: [ESCREVA AQUI O NICHO]. Leia o CLAUDE.md e o resumo das entrevistas em `docs/entrevistas.md`.

Me entreviste em detalhes usando a ferramenta AskUserQuestion para escrever `docs/SPEC.md`. Pergunte sobre:
- quem usa e em que momento do mês;
- as colunas que essas pessoas já têm nas planilhas e os vários nomes que dão a cada coluna;
- os 5 a 8 indicadores: fórmula exata, unidade, período, o que é bom e o que é ruim, metas e limites;
- as frases automáticas que fariam diferença e quando cada uma aparece;
- os alertas que valem a pena;
- o que fica fora do MVP.
Não pergunte o óbvio; vá nos pontos difíceis. Lembre a regra do CLAUDE.md: nada de diagnóstico ou conduta clínica.

No fim, escreva `docs/SPEC.md` com: nicho, colunas e sinônimos, indicadores (fórmula, unidade e um exemplo calculado à mão), frases, alertas, fora do escopo e um teste de ponta a ponta que prove que o MVP funciona.
```

Depois, revise a SPEC com a professora, faça o commit e rode `/clear`.

---

## Fase 3: planilhas de teste fictícias

**Quando:** a partir de 23/nov. **Modo:** normal.

```text
Leia o CLAUDE.md e o docs/SPEC.md. Use a skill xlsx (ou um script Node com SheetJS) para criar em `tests/fixtures/` de 15 a 20 planilhas FICTÍCIAS do nosso nicho, todas com `FICTICIO` no nome e o marcador `ZZ-FICTICIO` em alguma célula.

Uma planilha limpa, que será o nosso modelo oficial, e as outras imitando a bagunça real:
- cabeçalho fora da linha 1, com título e espaço para logotipo em cima;
- células mescladas no cabeçalho;
- datas como texto (05/10/2026, 5/10/26, out/26), datas como número de série do Excel e datas em branco;
- valores como "R$ 1.234,56", "1.234,56" e "1234.56", e células com texto no meio dos números;
- linhas de total e subtotal, linhas vazias, colunas extras sem nome;
- várias abas (uma por mês) e abas que não interessam;
- nomes de coluna variados: com e sem acento, maiúsculas, espaços sobrando;
- um CSV exportado do Excel em português, com separador `;` e codificação Windows-1252;
- um arquivo grande (20 mil linhas) e um arquivo vazio.

Gere também `tests/fixtures/ESPERADO.md` dizendo, para cada arquivo, o que a leitura deve encontrar: linhas válidas, totais e avisos.
Pronto quando: um script relê cada arquivo e confirma que o conteúdo bate com o ESPERADO.md. Mostre a saída e faça o commit.
```

---

## Fase 4: leitura e limpeza

**Modo:** planejamento.

```text
Leia o CLAUDE.md, o docs/SPEC.md e o tests/fixtures/ESPERADO.md. Implemente `src/leitura/` começando pelos testes: escreva os testes a partir do ESPERADO.md, veja falharem e só então implemente.

Requisitos:
- a leitura roda num Web Worker, e a interface não trava com o arquivo de 20 mil linhas;
- detecta a linha de cabeçalho e ignora títulos, linhas vazias e linhas de total;
- converte datas (texto em pt-BR e número de série do Excel) e valores em reais;
- lê o CSV com `;` e Windows-1252 sem estragar os acentos;
- recusa arquivos acima de 15 MB com mensagem clara;
- devolve as linhas válidas, as linhas descartadas com o motivo e avisos em português que digam o que fazer;
- nenhum conteúdo da planilha vai para o console nem para fora do navegador.

Pronto quando: todos os casos do ESPERADO.md passam e `npm run check` passa. Mostre a saída e faça o commit.
```

---

## Fase 5: mapeamento de colunas

**Modo:** planejamento.

```text
Leia o CLAUDE.md e o docs/SPEC.md. Implemente o mapeamento de colunas em `src/mapeamento/` e a tela correspondente em `src/ui/`.

Fluxo:
1. Depois da leitura, a ferramenta sugere qual coluna da planilha é cada campo do nicho, usando os sinônimos da SPEC (comparação sem acento e sem maiúsculas, com aproximação simples).
2. O usuário vê 5 linhas de amostra e confirma ou troca cada campo num seletor.
3. O mapeamento fica salvo no IndexedDB, identificado pela assinatura dos nomes das colunas. No próximo arquivo com a mesma assinatura, a tela é pulada e aparece só: "Usamos o mesmo formato do mês passado. Mudar?"
4. Nas configurações, um botão "Apagar tudo deste navegador".

Esta tela é o momento mais delicado da experiência: use a /apple-design para deixá-la óbvia em 10 segundos.
Pronto quando: os testes de unidade da sugestão passam, um teste do Playwright faz o fluxo completo com duas planilhas do mesmo formato (a segunda pula a tela) e `npm run check` passa. Faça o commit.
```

---

## Fase 6: indicadores e painel

**Modo:** planejamento.

```text
Leia o CLAUDE.md e o docs/SPEC.md. Proponha como ficam `src/nichos/[nicho].ts`, `src/indicadores/` e o painel. Depois de eu aprovar, implemente.

- Cada indicador da SPEC vira uma função pura, com teste usando o exemplo calculado à mão na SPEC.
- O painel mostra cartões com os números principais e a variação contra o mês anterior, gráficos com Chart.js, filtro de período e de local, estado vazio e estado de erro.
- Use a /apple-design para a hierarquia: um número principal por cartão, bastante espaço em branco, no máximo 2 cores de destaque, rótulos que dispensam legenda.
- Animações só na entrada (números contando, gráfico surgindo), curtas e desligadas com prefers-reduced-motion.
- Funciona em 390 px e 1280 px, nos modos claro e escuro.

Pronto quando: os testes dos indicadores batem com a SPEC, o Playwright carrega cada planilha de teste sem quebrar o painel, e você me mostra screenshots em 390 e 1280 px, claro e escuro. Faça o commit.
```

Depois desta fase, rode o graphify pela primeira vez (veja "Manutenção" no fim).

---

## Fase 7: frases, metas e alertas

**Modo:** normal. Se o tempo apertar, esta fase pode ir para janeiro.

```text
Leia o CLAUDE.md e o docs/SPEC.md. Implemente as frases automáticas, as metas pessoais e os alertas.

- Frases geradas por regras, sem IA e sem rede. Cada regra tem condição, prioridade e um texto com espaços para os números. Mostre no máximo 3 frases, as mais relevantes primeiro.
- Metas: o usuário define a meta de um indicador e o painel mostra o progresso.
- Alertas: os definidos na SPEC.
- Revise todos os modelos de frase com o /humanizer, em português do Brasil, com tom de colega da área e sem exagero. Use como amostra de voz este texto da professora: [COLE 2 OU 3 PARÁGRAFOS ESCRITOS POR ELA].
- Nenhuma frase pode soar como orientação clínica.

Pronto quando: cada regra tem um teste em que dispara e outro em que não dispara, e `npm run check` passa. Faça o commit.
```

---

## Fase 8: PDF e celular

**Modo:** normal.

```text
Leia o CLAUDE.md. Faça o relatório em PDF e a revisão para celular.

- PDF: folha de estilo de impressão que gera uma página A4 limpa, com cabeçalho (período e nome do relatório), cartões, gráficos, frases e rodapé "Gerado no seu navegador em dd/mm/aaaa". O botão "Baixar PDF" chama a impressão do navegador.
- Celular: revise todas as telas em 360 e 390 px. Alvos de toque com pelo menos 44 px, nenhuma rolagem horizontal, gráficos legíveis.
- Acessibilidade: contraste, foco visível e leitores de tela nos cartões e gráficos (texto alternativo com os números).
- Faça uma revisão final das telas com a /apple-design.

Pronto quando: você me mostra screenshots da prévia de impressão e das telas em 360 px, e `npm run check` passa. Faça o commit.
```

---

## Fase 9: página inicial e demonstração

**Modo:** planejamento.

```text
Leia o CLAUDE.md e o docs/SPEC.md. Crie a página inicial e a demonstração.

- Página inicial: o que é, para quem, a promessa "seus dados não saem do seu computador" explicada em 2 linhas, como funciona em 3 passos, um botão "Ver demonstração" e um botão "Entrar na lista de espera" que leva a um formulário externo (link, não um formulário dentro do site).
- Demonstração: o painel real carregado com uma planilha fictícia, sem cadastro, com o selo "dados de exemplo".
- Visual com a /apple-design. Textos revisados com o /humanizer, em português do Brasil.
- Animações de entrada e de rolagem sutis, feitas com CSS e código nosso. Quero esta sensação: [DESCREVA O EFEITO QUE VOCÊ GOSTOU OU ANEXE UM VÍDEO CURTO]. Recrie a sensação; não copie código, vídeos, imagens nem fontes de nenhum site, inclusive da Apple.
- Página de privacidade em linguagem simples, como rascunho para o advogado revisar.

Pronto quando: o Lighthouse dá acima de 95 em acessibilidade e boas práticas no celular, você me mostra screenshots em 390 e 1280 px e `npm run check` passa. Faça o commit.
```

---

## Fase 10: revisão de privacidade e segurança

**Quando:** antes do beta fechado (até 13/dez). **Modo:** normal.

```text
Leia o CLAUDE.md. Antes do beta, faça a revisão de privacidade e segurança.

1. Garanta o teste `tests/e2e/privacidade.spec.ts`. Ele carrega cada planilha de teste, percorre todas as telas e falha se: (a) alguma requisição sair para outra origem; (b) alguma requisição carregar o marcador `ZZ-FICTICIO` ou qualquer valor da planilha; (c) o console registrar conteúdo da planilha.
2. Confira que o `_headers` publicado tem a CSP restritiva e que nenhum script, estilo ou fonte vem de fora.
3. Confira as dependências: SheetJS do CDN oficial na versão mais recente, `npm audit` sem falhas altas, nenhum pacote abandonado.
4. Confira o que fica no IndexedDB: só mapeamentos, preferências e agregados com a opção ligada.
5. Use um subagente para revisar o código como um auditor de LGPD que não viu a implementação. Peça só problemas que afetam privacidade ou corretude, sem preferências de estilo.

Pronto quando: o teste de privacidade passa, cada achado do subagente está corrigido ou justificado em docs/DECISOES.md, e `npm run check` passa. Faça o commit.
```

Depois, com o repositório já no GitHub, rode `/security-review` e em seguida `/code-review --fix`.

---

## Manutenção: graphify

Rode `/graphify .` depois da Fase 6 e antes de cada fase grande. Ele monta em `graphify-out/` um mapa do código que o Claude Code consulta antes de sair procurando arquivos, e um relatório (`GRAPH_REPORT.md`) que serve para mostrar a arquitetura à professora.

Na instalação, o graphify acrescenta uma seção ao `CLAUDE.md` e um hook. Depois confira se o `CLAUDE.md` continua curto. Como ele também lê documentos e imagens da pasta, vale a regra de sempre: nenhum dado real no repositório.

---

## Se algo der errado

- `Esc` para o Claude Code no meio da ação, sem perder o contexto.
- `Esc` duas vezes ou `/rewind` volta a conversa e o código para um ponto anterior. Mudanças feitas por comandos no terminal não voltam: para isso, use o git.
- Pergunta rápida que não precisa ficar no histórico: `/btw`.
- Erro de build ou de teste: cole a mensagem inteira e peça para corrigir a causa, sem esconder o erro.
