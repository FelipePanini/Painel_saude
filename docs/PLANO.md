# Plano do projeto

Este arquivo diz em que ponto o projeto está e qual é o próximo passo. Uma sessão nova consegue continuar lendo o `CLAUDE.md`, este plano e o `git log`.

## Onde estamos

- **Fase atual:** fase 1, visual (Claude Fable 5.2), de 11/11 a 22/11/2026.
- **Etapa atual:** a Etapa 1 terminou em 11/11. A próxima é a Etapa 2, protótipo para a validação, até 18/11.
- **Direção visual:** A, "Sereno", escolhida pelo Felipe em 11/11. Os tokens estão em `src/estilos/tokens.css`.
- **Próximo passo:** começar a Etapa 2 pelo roteador e pela tela do painel (`src/ui/`), usando os componentes de `src/componentes/` e a navegação de `src/componentes/navegacao.ts`. Depois, detalhe do indicador e central de entrada.
- **Como ver:** `npm run dev` e abrir `http://localhost:5173/componentes/` (galeria de componentes).
- **Briefings:** `docs/BRIEFING_FASE_1.md` e `docs/BRIEFING_FASE_2.md`.

### Para retomar depois de um `/clear`

```text
Leia o CLAUDE.md, o docs/BRIEFING_FASE_1.md, o docs/PLANO.md, o docs/DECISOES.md e o git log recente. Rode o npm run check para confirmar o estado atual. Depois continue pela próxima etapa da fase 1 do PLANO.md, seguindo o briefing.
```

## Decisões que tomei sem o Felipe (11/11)

Felipe avisou que não estaria disponível para responder e pediu para eu seguir. Em vez de perguntar, usei a opção que eu recomendaria. Qualquer uma pode ser trocada: é só dizer.

| Assunto | O que assumi | Para mudar |
| --- | --- | --- |
| Ícones | Lucide (licença ISC, permissiva) | "Troque para Phosphor" |
| Nome do produto | "Painel Saúde", provisório | Diga o nome definitivo |
| Como mostrar às 5 pessoas | No notebook do Felipe, com o servidor local. Nenhum deploy | "Quero um link público" (precisa de aprovação para publicar) |
| Voz dos textos | Tom neutro e direto, porque a amostra de texto da professora ainda não chegou | Envie 2 ou 3 parágrafos escritos por ela |
| Setores de exemplo | Clínica Médica, Clínica Cirúrgica, UTI Adulto, Pediatria e Pronto-Socorro, mais a Maternidade como setor novo [VALIDAR COM A PROFESSORA] | Diga os setores certos |
| Formato do site | Página inicial e galeria como páginas próprias; o produto (painel, entrada de dados, preferências) como um aplicativo de página única com um roteador pequeno, para as trocas de tela serem suaves e o vidro ter uma única raiz | "Prefiro uma página por tela" |

## Pendências que dependem do Felipe

1. **Protótipo antigo (`prototipo/`)**: a aba "Plantonista" mostra dinheiro, e a regra nova proíbe finanças até nos dados fictícios. Recomendo apagar a pasta inteira, porque a fase 1 a substitui. Não apaguei porque ela fica fora de `src/`, `tests/` e `docs/`, e o briefing pede aprovação nesse caso. Enquanto isso, ela usa uma cópia dos estilos de outubro (`prototipo/estilos-antigos/`), para não mudar junto com o sistema de design novo.
2. **Amostra de texto da professora**, para o Humanizer pegar a voz dela. Os textos das telas ainda não passaram pelo Humanizer; reviso todos quando a amostra chegar.
3. **`docs/SPEC.md`**: ainda não existe. A fase 1 usa a configuração de exemplo; a fase 2 não começa sem a SPEC.
4. **Commits locais ainda não enviados ao GitHub.** Enviar exige aprovação.

## Personas [VALIDAR COM A PROFESSORA]

- **Coordenadora de enfermagem de uma unidade.** 40 a 55 anos. Usa Excel no básico, num computador do hospital que outras pessoas também usam. No começo do mês, fecha os números do mês anterior. Quer lançar rápido e saber se a unidade está dentro da meta.
- **Analista de qualidade.** 30 a 40 anos. Domina planilhas, junta os números de vários setores e monta a apresentação para a diretoria. Quer importar a planilha que já tem, comparar setores e gerar o relatório.
- **Enfermeira de plantão.** 25 a 35 anos. Usa só o celular, em poucos minutos livres. Quer olhar um indicador e entender o que mudou.
- **Gerente ou diretora.** 50 anos ou mais. Vê o painel projetado numa reunião. Precisa de números grandes, poucos por tela, e de frases que expliquem o que mudou.

## Jornadas principais

1. **Primeira vez.** Página inicial → "Ver demonstração" ou "Comece aqui" → pergunta "Este computador é usado por outras pessoas?" → tour de até 3 passos (opcional) → painel com dados de exemplo.
2. **Importar planilha.** Central de entrada → "Importar planilha" → arrastar o arquivo → progresso → mapeamento (5 linhas de amostra, um seletor por coluna) → resumo com colunas ignoradas e linhas descartadas → confirmar → painel atualizado.
3. **Lançar o mês à mão.** Central de entrada → "Lançar à mão" → escolher o mês → preencher a grade com teclado → erros aparecem na célula → salvar → painel atualizado.
4. **Entender um indicador.** Painel → cartão → "O que é isso?" → detalhe com 12 meses, comparação entre setores, fórmula em linguagem simples, meta e "Ver como tabela".
5. **Apresentar para a diretoria.** Painel → escolher a visão "Diretoria" → modo apresentação (um indicador por vez, setas) → relatório para impressão.
6. **Fazer backup.** Central de entrada → "Meus dados" → "Fazer backup" → arquivo salvo → (em outro momento) restaurar.

## Mapa de telas

| # | Tela | Estados | Etapa |
| --- | --- | --- | --- |
| 0 | Galeria de componentes (`/componentes/`) | Claro e escuro, vidro ligado e desligado | 1 |
| 1 | Página inicial | — | 3 |
| 2 | Primeira vez | — | 3 |
| 3 | Painel | Vazio, carregando, erro, dados insuficientes | 2 |
| 4 | Detalhe do indicador | Dados insuficientes | 2 |
| 5a | Central de entrada: importar planilha | Arrastando, progresso, mapeamento, resumo, erro | 2 |
| 5b | Central de entrada: baixar modelo | — | 2 |
| 5c | Central de entrada: lançar à mão | Foco, erro na célula | 2 |
| 5d | Central de entrada: meus dados | Vazio, toast com "Desfazer" | 2 |
| 6 | Personalizar o painel e visões salvas | — | 3 |
| 7 | Modo apresentação | — | 3 |
| 8 | Preferências | — | 3 |
| 9 | Prévia do relatório para impressão | — | 3 |

Todas em 390 px e 1280 px, nos modos claro e escuro.

## Etapas da fase 1

### Etapa 1, até 13/11: plano e direção visual — concluída em 11/11

- [x] Briefings salvos em `docs/`, `CLAUDE.md` novo na raiz.
- [x] Este plano.
- [x] Biblioteca de vidro instalada e testada com a CSP atual. Funcionou sem mudar a CSP.
- [x] Contratos de dados: `src/tipos/`, `src/nichos/exemplo.ts`, `src/dados-ficticios/` e `src/fonte-de-dados/`.
- [x] Duas direções visuais do painel na galeria (`/componentes/`): **A · Sereno** e **B · Boletim**. Capturas em `test-results/direcoes/` depois de rodar `npm run check`.
- [x] **Felipe escolheu a direção A.** A direção B ficou guardada em `docs/arquivo/direcoes-etapa-1/`, só como referência.
- [x] Tokens finais em `src/estilos/tokens.css`: cores nos dois temas, tipografia, espaçamento, raios, elevação e movimento.
- [x] Componentes base em `src/componentes/` e `src/estilos/componentes.css`: botões, campos, seletor, chips, controle segmentado, cartão de indicador (em destaque e compacto), minigráfico, gráfico de tendência, selo de meta, avisos, estados (vazio, carregando, erro, sem dados) e aviso rápido com "Desfazer".
- [x] Navegação em `src/componentes/navegacao.ts`, nas três aparências do vidro. Capturas em `test-results/galeria/*-nav-*.png` depois de rodar `npm run check`.
- [x] A galeria (`/componentes/`) virou a galeria de componentes. Faltam nela as peças que chegam com as telas da Etapa 2: tabela, grade de lançamento, área de arrastar arquivos, barra de progresso, folhas e modais.
- [x] Skill `verify` (já existe desde o esqueleto).

Pronto quando: a direção está escolhida, o `npm run check` passa e há screenshots da navegação nas três aparências.

### Etapa 2, até 18/11: protótipo para a validação — não começou

Painel, detalhe do indicador e central de entrada (os quatro caminhos), com dados fictícios e todas as interações visuais.

Pronto quando: as jornadas 2, 3 e 4 podem ser percorridas do começo ao fim, em 390 px e 1280 px.

### Etapa 3, até 22/11: acabamento e entrega — não começou

Telas restantes, todos os estados, polimento das animações, ajustes da validação com as 5 pessoas, `/graphify .` e `docs/ENTREGA_FASE_1.md`.

## Riscos

| Risco | O que faço |
| --- | --- |
| **O vidro pode esbarrar na CSP.** Resolvido em 11/11: testado no build com a CSP ligada, sem nenhuma violação. | Os testes de navegador continuam rodando com a CSP e falham se aparecer uma violação. |
| **O vidro custa caro para o computador.** Cada captura da página é lenta. | Barras de vidro sobre uma faixa de fundo fixa, e não sobre o conteúdo que rola. Versão CSS durante a rolagem, se precisar. Uma única raiz de vidro. |
| **Prazo curto.** A direção visual precisa sair até 13/11 e o protótipo até 18/11. | Etapa 2 começa pelas três telas que serão mostradas às 5 pessoas. O resto fica para a Etapa 3. |
| **Textos da área sem validação.** Não há SPEC nem amostra da professora. | Marcar tudo com [VALIDAR COM A PROFESSORA] na configuração de exemplo. Nada de fórmula ou termo clínico inventado como se fosse certo. |
| **Protótipo antigo com finanças** ainda está no build. | Aguardando a decisão do Felipe (pendência 2). |
| **Fase 2 precisa continuar sem refazer telas.** | Telas só leem dados pela interface `src/fonte-de-dados/`. Cores, movimento e foco só por tokens. |

## Critérios de aceite da fase 1

- O `npm run check` passa: typecheck, lint, testes de unidade, build e testes de navegador com screenshots.
- Há screenshots de cada tela em 390 px e 1280 px, nos modos claro e escuro, e da navegação nas três aparências do vidro.
- A galeria mostra todos os componentes e estados.
- Nenhuma tela mostra dinheiro, nome de pessoa, diagnóstico ou conduta.
- Nenhuma requisição sai para outra origem.
- A rolagem fica fluida com o vidro ligado num notebook comum.
- As telas não importam dados fictícios direto.
- O `docs/ENTREGA_FASE_1.md` existe e cobre a lista do briefing.

## Fase 2 (resumo)

De 23/11 a 13/12, com o Claude Opus 5.5. Etapas e regras em `docs/BRIEFING_FASE_2.md`. O plano detalhado será escrito aqui na Etapa 0 da fase 2.
