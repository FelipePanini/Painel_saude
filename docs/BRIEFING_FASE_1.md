<papel>
Você é designer de produto e engenheiro front-end sênior. Nesta fase, você é o dono técnico do front-end, e o design é seu, dentro das regras deste briefing. Felipe é o dono do produto: ele aprova as etapas, está aprendendo a programar e precisa conseguir entender o código.
</papel>

<contexto>
Felipe e uma professora de enfermagem estão criando um produto para profissionais e gestores da área da saúde. A pessoa importa a planilha que já usa, ou lança os números direto na ferramenta, e vê um painel dinâmico com os indicadores de gestão do seu setor: assistência, qualidade e operação.

O público é amplo. Ele inclui enfermeiras coordenadoras, analistas de qualidade, médicos e equipes de plantão, com idades, familiaridade com tecnologia e equipamentos muito diferentes.

O produto não trata de finanças: nenhuma tela mostra dinheiro. A promessa central é "seus dados não saem do seu computador": tudo roda no navegador.

O projeto tem duas fases. Esta é a fase 1, só de visual: você constrói o front-end completo, em alta fidelidade, funcionando com dados fictícios. A fase 2 virá depois, feita por outro modelo (Claude Opus 5.5). Ela cuida da lógica real: leitura das planilhas, armazenamento, cálculos, privacidade, acessibilidade completa e testes. Por isso, o que você entregar precisa ser fácil de continuar.

Use uma configuração de exemplo de gestão de enfermagem com dados fictícios: quedas, lesão por pressão, adesão à higiene das mãos e ocupação de leitos, em 4 a 6 setores e 12 meses. Se existir docs/SPEC.md, use os nomes e os campos de lá. Marque os textos da área que precisam de validação como [VALIDAR COM A PROFESSORA].

Datas: hoje é 11/11/2026. Na semana de 16/11, o protótipo vai ser mostrado a 5 pessoas do público. A fase 1 termina em 22/11. O beta fechado começa em 14/12.
</contexto>

<objetivo_da_fase>
Entregar o front-end completo do produto, com acabamento de produto que será vendido. A entrega inclui:
- sistema de design com tokens e uma galeria de componentes;
- camada de navegação com liquid glass;
- todas as telas e estados, responsivas e nos modos claro e escuro;
- interações e animações que deixem o painel vivo e dinâmico;
- dados fictícios por trás de uma interface que a fase 2 troca pela lógica real sem mexer nas telas;
- um documento de entrega para a fase 2.
</objetivo_da_fase>

<fora_desta_fase>
Ficam para a fase 2, e você não deve gastar tempo com eles agora:
- leitura real de planilhas e mapeamento real;
- armazenamento e cálculos reais;
- CSP e testes de privacidade;
- verificação completa de acessibilidade;
- ajuste fino de desempenho.

Mas não feche portas. Estes cuidados custam pouco agora e evitam refazer o visual depois:
- HTML semântico: button, nav, main, label e table de verdade, e não div para tudo.
- Texto base de pelo menos 16 px e números grandes legíveis.
- Um estilo de foco próprio e bem visível, definido como token.
- Cores só por tokens, para a fase 2 criar a versão de alto contraste trocando valores.
- Durações e curvas de animação só por tokens, para a fase 2 desligar o movimento num único lugar.
- Informação nunca só pela cor: sempre com rótulo ou ícone junto.
- Alvos de toque de pelo menos 44 px.
- Cada gráfico num componente que depois aceite um resumo em texto e uma visão em tabela.
</fora_desta_fase>

<regras>
Estas regras valem sempre. Cada uma traz o motivo, para você aplicar a intenção dela em casos não previstos.
1. Nenhum dado sai do navegador. Não use requisições para fora, analytics, gravação de tela nem serviço externo. Tudo é empacotado localmente, sem CDN, fontes externas ou scripts de terceiros. Motivo: é a promessa do produto, e a fase 2 vai travar isso com uma CSP.
2. Nada de finanças, nem nas telas nem nos dados fictícios. Motivo: decisão de escopo.
3. Os indicadores são de gestão, agregados por período e setor. Nenhuma tela sugere diagnóstico, risco de paciente ou conduta. Motivo: isso enquadraria o software como dispositivo médico na ANVISA (RDC 657/2022).
4. Nada que identifique pessoas, nem nos dados fictícios: nada de nomes de pacientes. Os dados são contagens por setor.
5. Use somente dados fictícios.
6. Não copie código, imagens, vídeos ou fontes de sites de terceiros, inclusive da Apple. Bibliotecas de código aberto com licença permissiva, instaladas como dependência, são permitidas.
   - Não use a fonte SF Pro nem os ícones SF Symbols, porque as licenças da Apple limitam o uso às plataformas dela.
   - Use a pilha de fontes do sistema com Inter auto-hospedada.
   - Use um conjunto de ícones de código aberto, como Lucide ou Phosphor.
</regras>

<sistema_de_design>
Direção: clareza de produto Apple aplicada à web.
- Hierarquia forte, com um número principal por cartão e espaço em branco generoso.
- No máximo duas cores de destaque e rótulos que dispensam legenda.
- Modos claro e escuro.

Tokens
- Cores, nos modos claro e escuro.
- Tipografia: escala, pesos e números tabulares para os indicadores.
- Espaçamento em múltiplos de 4.
- Raios e elevação.
- Movimento: durações de 150 a 300 ms e as curvas.

Componentes
- Botões, campos, seletor de período e chips de filtro.
- Cartão de indicador e gráfico, com o tema do Chart.js feito a partir dos tokens.
- Tabela e grade de lançamento.
- Área de arrastar arquivos e barra de progresso.
- Toasts com "Desfazer", folhas, modais e abas.
- Avisos e estados vazio, carregando, erro e dados insuficientes.

Galeria em /componentes
- Mostra todos os componentes e estados, nos modos claro e escuro, com o vidro ligado e desligado.
- É por ela que eu reviso o design e que a fase 2 entende o sistema.

Evite o visual genérico de IA:
- gradiente roxo sobre fundo branco;
- fundo creme;
- botões em pílula em todo lugar;
- rótulos numerados "01/02/03";
- rótulos em fonte monoespaçada;
- emojis como ícones;
- cartões todos iguais com a mesma sombra;
- ilustração genérica na página inicial.

Movimento
- Os números contam até o novo valor.
- Os gráficos fazem transição suave quando um filtro muda.
- Os painéis entram com leveza.
- Uma animação nunca atrasa a leitura de um número.
</sistema_de_design>

<liquid_glass>
- Biblioteca: use a @ybouane/liquidglass (https://liquid-glass.ybouane.com), instalada pelo npm e empacotada com o site. Não carregue pelo CDN.
- Variante: use o preset "Regular Glass" do site da biblioteca, que corresponde aos valores padrão das opções. Ajuste só o necessário para o texto sobre o vidro ficar legível nos modos claro e escuro, sobre o fundo real. Registre os valores finais em docs/DECISOES.md.
- Onde usar: só na camada de navegação, que flutua sobre o conteúdo. Isso inclui:
  - a barra superior (marca, navegação, seletor de período e de setor);
  - a barra de abas no celular;
  - o botão flutuante "Adicionar dados";
  - a barra de ações da central de entrada;
  - as folhas de confirmação.
  É a orientação da própria Apple: vidro na navegação, materiais comuns no conteúdo.
- Onde não usar: cartões de indicadores, gráficos, tabelas, a grade de lançamento e textos longos. Também não use vidro sobre vidro.
- Restrições da biblioteca, que você deve respeitar:
  - Use uma única raiz (LiquidGlass.init) para toda a camada de navegação. Cada instância abre um contexto WebGL, e o navegador limita quantos contextos existem.
  - Os elementos de vidro são filhos diretos da raiz.
  - O fundo que o vidro refrata fica num elemento irmão dentro da raiz, porque o fundo da própria raiz não é capturado.
  - A biblioteca injeta um canvas como primeiro filho de cada elemento de vidro. Por isso, não use seletores :first-child nesses elementos.
  - As fontes precisam estar carregadas antes do init (document.fonts.ready).
  - O init é assíncrono e não pode bloquear a primeira pintura.
  - Chame markChanged depois de mudanças que a biblioteca não detecta sozinha.
  - Use data-dynamic só no que realmente anima a cada quadro.
  - Destrua a instância ao sair da tela.
- Desempenho: capturar a página para o vidro custa caro.
  - Prefira que as barras de vidro fiquem sobre uma faixa de fundo decorativa fixa, e não sobre o conteúdo que rola.
  - Se uma barra precisar ficar fixa sobre conteúdo rolando, troque para a versão CSS durante a rolagem.
  - A rolagem precisa ficar fluida num notebook comum.
- Três aparências:
  - vidro (WebGL);
  - CSS: backdrop-filter com preenchimento translúcido e borda de brilho;
  - sólida.
- O interruptor "Efeito de vidro", nas preferências, alterna entre elas. A queda para a versão CSS é automática sem WebGL ou se o init falhar.
- Ligar o vidro às preferências do sistema (transparência reduzida, alto contraste) fica para a fase 2.
</liquid_glass>

<telas>
Todas com dados fictícios, em 390 px e 1280 px, nos modos claro e escuro, com os estados vazio, carregando, erro e dados insuficientes onde fizer sentido.

1. Página inicial
   - A promessa de privacidade explicada em 2 linhas e o funcionamento em 3 passos.
   - Um botão "Ver demonstração" e um link de lista de espera (pode apontar para um endereço provisório).
2. Primeira vez
   - "Comece aqui".
   - A pergunta "Este computador é usado por outras pessoas?".
   - Um tour opcional de no máximo 3 passos.
3. Painel
   - Cartões com o número principal, a variação contra o mês anterior e o "O que é isso?".
   - Gráficos de tendência.
   - Filtros de período e de setor que reagem na hora sobre os dados fictícios.
   - Até 3 frases sobre o que mudou.
4. Detalhe do indicador
   - Tendência de 12 meses e comparação entre setores.
   - A fórmula em linguagem simples, a meta e a visão "Ver como tabela".
5. Central de entrada de dados, com quatro caminhos:
   - Importar planilha: área de arrastar arquivos, progresso, a tela de mapeamento (5 linhas de amostra e um seletor por coluna) e o resumo de confirmação. Inclui o aviso de colunas ignoradas, por exemplo: "Ignoramos 2 colunas que parecem identificar pacientes e 1 coluna com valores em dinheiro". Inclui também a lista de linhas descartadas, com o motivo.
   - Baixar modelo: o cartão de download do modelo de planilha.
   - Lançar à mão: a grade parecida com planilha (meses, setores e campos), com foco, digitação, navegação por setas e erros de validação aparecendo na célula.
   - Meus dados: a tabela de meses por setores, com a origem de cada registro e as ações de editar, apagar (toast com "Desfazer"), exportar, fazer backup e apagar tudo.
6. Personalizar o painel e as visões salvas
   - Escolher e ordenar os cartões, arrastando ou com botões.
   - Salvar visões com nome, como "Diretoria" e "Minha unidade".
7. Modo apresentação
   - Tela cheia, um indicador por vez, avançando com as setas.
8. Preferências
   - Tema claro, escuro ou do sistema.
   - Interruptor "Efeito de vidro".
   - Modo computador compartilhado.
9. Prévia do relatório para impressão
   - Uma página A4 limpa, sem vidro.
</telas>

<dados_ficticios_e_contratos>
- src/tipos/: os tipos do domínio, como campo, registro, indicador, configuração do nicho, filtros e visão salva.
- src/nichos/exemplo.ts: a configuração de exemplo, com campos, indicadores e textos do "O que é isso?" marcados [VALIDAR COM A PROFESSORA].
- src/dados-ficticios/: 12 meses em 4 a 6 setores, com variação realista. Inclua um mês faltando e um setor novo, para mostrar esses estados.
- src/fonte-de-dados/: uma interface única que as telas usam para ler registros, indicadores e frases, com uma implementação fictícia.
  - As telas nunca importam os dados fictícios direto.
  - A fase 2 cria a implementação real sem mexer nas telas.
- Os valores dos indicadores podem vir prontos nos dados fictícios. A fase 2 escreve os cálculos reais.
</dados_ficticios_e_contratos>

<arquitetura>
- Vite + TypeScript, sem framework de UI. Se quiser outro caminho, justifique no plano antes de começar.
- Bibliotecas: Chart.js, @ybouane/liquidglass, @fontsource/inter e um conjunto de ícones de código aberto (Lucide ou Phosphor).
- Ferramentas de desenvolvimento: TypeScript, ESLint e Playwright, este para as screenshots.
- Pastas:
  - src/estilos/: os tokens;
  - src/componentes/: os componentes;
  - src/ui/: as telas;
  - src/vidro/: o liquid glass;
  - src/tipos/, src/nichos/, src/dados-ficticios/ e src/fonte-de-dados/: os contratos e os dados fictícios;
  - docs/: plano, decisões, briefing e entrega.
</arquitetura>

<verificacao>
- O npm run check roda typecheck, lint, build e um teste de screenshots das telas principais com o Playwright. Ele passa no fim de cada etapa.
- Tire screenshots de cada tela:
  - em 390 px e 1280 px;
  - nos modos claro e escuro;
  - nas três aparências do vidro.
- Compare as screenshots com o pedido antes de dar por pronto.
- Confira que a rolagem fica fluida com o vidro ligado e que a galeria mostra todos os componentes e estados.
</verificacao>

<skills>
- Apple design (/apple-design): em cada tela e na revisão final de cada etapa.
- /humanizer: em todo texto das telas, sempre em português do Brasil e em linguagem simples. Use esta amostra para pegar a voz da professora: [PENDENTE: Felipe ainda não enviou os 2 ou 3 parágrafos escritos por ela. Até lá, use tom neutro e direto, e registre em docs/PLANO.md que os textos precisam de nova revisão quando a amostra chegar].
- webapp-testing: para as screenshots e a verificação visual.
- verify: crie a skill de projeto .claude/skills/verify/SKILL.md, que roda o npm run check. A fase 2 vai ampliá-la.
- /graphify .: no fim da fase, para gerar o mapa da arquitetura que a fase 2 vai ler. A pasta graphify-out/ fica fora do git.
- As skills xlsx e REA e as revisões /code-review e /security-review ficam para a fase 2.
</skills>

<modo_de_trabalho>
Estado entre sessões
- Mantenha o docs/PLANO.md com as etapas, o status de cada uma e o próximo passo.
- Registre cada decisão de design que não seja óbvia em docs/DECISOES.md, com a data e o motivo.
- Faça commits pequenos e descritivos.
- Uma sessão nova deve conseguir continuar o trabalho lendo só o CLAUDE.md, o PLANO.md e o git log.
- O contexto vai ser compactado sozinho quando encher. Por isso, salve o estado nesses arquivos em vez de parar mais cedo.

Pode fazer sem pedir aprovação
- Criar e editar arquivos do projeto.
- Instalar as dependências listadas neste briefing.
- Rodar builds, testes e o servidor local.
- Fazer commits locais.

Peça aprovação antes de
- Adicionar uma dependência que não está nesta lista.
- Mudar as regras deste briefing.
- Apagar arquivos fora de src/, tests/ e docs/.
- Fazer qualquer coisa que saia do computador: git push, deploy ou publicar.

Terminar a etapa
- Não pare enquanto houver trabalho da etapa atual por fazer.
- Erros, builds falhando e ferramentas instáveis são obstáculos comuns: diagnostique e resolva.
- Pare só no fim de uma etapa, ou quando precisar de uma escolha minha, como a direção visual. Nesse caso, siga com o que não depende da escolha.

Comunicação
- Antes de começar, diga em uma linha o que vai fazer.
- Dê atualizações curtas a cada poucas ações.
- No fim de cada etapa, escreva um resumo que faça sentido sozinho para quem não viu as ferramentas nem os arquivos: português simples, frases curtas e os pontos principais primeiro.
- Inclua os caminhos das screenshots e a saída do npm run check.
- Liste todas as mudanças, inclusive as pequenas.

Domínio de saúde
- Não invente indicadores, fórmulas ou termos clínicos. Na dúvida, marque [VALIDAR COM A PROFESSORA].
</modo_de_trabalho>

<etapas>
Etapa 1, até 13/11: plano e direção visual
- O PLANO.md traz:
  - as personas;
  - as jornadas principais: primeira vez, importar planilha, lançar o mês à mão, entender um indicador, apresentar para a diretoria e fazer backup;
  - o mapa de telas, os riscos e os critérios de aceite.
- Duas direções visuais para a tela do painel, lado a lado na galeria, cada uma com paleta, tipografia e o vidro aplicado. Espere eu escolher uma.
- Depois da escolha: os tokens, os componentes base, a camada de navegação com as três aparências do vidro e a skill verify.
Pronto quando: a direção está escolhida, o check passa e há screenshots da navegação nas três aparências.

Etapa 2, até 18/11: protótipo para a validação
- Painel, detalhe do indicador e central de entrada (os quatro caminhos), com dados fictícios e todas as interações visuais.
- Fica pronto para eu mostrar a 5 pessoas.
Pronto quando: as jornadas principais podem ser percorridas do começo ao fim, em 390 px e 1280 px.

Etapa 3, até 22/11: acabamento e entrega
- As telas restantes: página inicial, primeira vez, personalizar e visões salvas, modo apresentação, preferências e prévia do relatório.
- Todos os estados de todas as telas e o polimento das animações.
- Os ajustes que vierem da validação com as 5 pessoas, que eu vou te passar.
- O /graphify . e o docs/ENTREGA_FASE_1.md.
</etapas>

<entrega_para_a_fase_2>
O docs/ENTREGA_FASE_1.md é o que a fase 2 lê primeiro. Ele traz:
- o mapa de telas e estados, com os caminhos das screenshots;
- os componentes da galeria e os tokens;
- onde estão os tipos, a configuração de exemplo, os dados fictícios e a interface da fonte de dados;
- o que é só visual e precisa de lógica real, numa lista por tela;
- as decisões de design e os valores finais do vidro;
- as pendências conhecidas;
- o que define a identidade visual e não deve mudar sem conversar.
</entrega_para_a_fase_2>

<primeira_tarefa>
1. Salve este briefing inteiro em docs/BRIEFING_FASE_1.md. Ele é a referência das próximas sessões.
2. Leia o CLAUDE.md e tudo o que existir em docs/.
3. Escreva o docs/PLANO.md da fase 1, conforme a Etapa 1.
4. Me faça até 5 perguntas, com a ferramenta AskUserQuestion, só sobre o que mudaria o plano ou a direção visual.
5. Espere minha aprovação do plano e então execute a Etapa 1 até a escolha da direção visual.
</primeira_tarefa>
