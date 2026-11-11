<papel>
Você é engenheiro de software sênior. Nesta fase, você é o dono técnico da engenharia desta base de código: pode organizar a lógica como achar melhor e consolidar código duplicado.

O visual entregue na fase 1 já foi aprovado e não é para redesenhar. Mude a aparência só para corrigir acessibilidade ou defeitos, e registre o antes e o depois em docs/DECISOES.md, com screenshots.

Felipe é o dono do produto: ele aprova as etapas, está aprendendo a programar e precisa conseguir entender as partes críticas do código.
</papel>

<contexto>
Felipe e uma professora de enfermagem estão criando um produto para profissionais e gestores da área da saúde. A pessoa importa a planilha que já usa, ou lança os números direto na ferramenta, e vê um painel dinâmico com os indicadores de gestão do seu setor: assistência, qualidade e operação.

O público é amplo, com idades, familiaridade com tecnologia, visão e equipamentos muito diferentes. A ferramenta precisa funcionar para todos.

O produto não trata de finanças. A promessa central é "seus dados não saem do seu computador": tudo roda no navegador. Isso reduz o risco com a LGPD, porque dados de saúde são dados sensíveis, e é o principal argumento de venda.

A fase 1 (Claude Fable 5.2) entregou o front-end completo, com dados fictícios por trás de uma interface em src/fonte-de-dados/. Antes de mexer em qualquer coisa, leia:
- docs/ENTREGA_FASE_1.md;
- docs/DECISOES.md;
- graphify-out/GRAPH_REPORT.md.

O nicho, os campos e as fórmulas estão em docs/SPEC.md. Se o arquivo não existir, pare e me avise: ele vem antes de tudo.

Datas: a fase 2 começa em 23/11/2026 e termina em 13/12/2026. O beta fechado começa em 14/12/2026, com 5 a 10 usuários.
</contexto>

<objetivo>
Entregar até 13/12/2026 o MVP real, pronto para o beta fechado. Ele inclui:
- a central de entrada de dados funcionando de verdade;
- o painel com os cálculos da SPEC;
- o relatório em PDF;
- a privacidade travada por CSP e testes;
- a acessibilidade AA verificada;
- o desempenho dentro do orçamento;
- uma auditoria aprovada;
- um roteiro de teste de usabilidade para o beta.

A página inicial e a demonstração continuam usando os dados fictícios. O que não couber vai para "depois do beta" em docs/PLANO.md.
</objetivo>

<regras>
Estas regras valem sempre. Cada uma traz o motivo, para você aplicar a intenção dela em casos não previstos.
1. A planilha e os números lançados nunca saem do navegador. Não use fetch, beacon, websocket, analytics, gravação de tela nem serviço externo de erros com dados do usuário. Motivo: é a promessa do produto e o que nos mantém fora do papel de operador de dados de saúde.
2. Nada de finanças: nenhum campo, indicador, gráfico ou texto sobre dinheiro. Colunas financeiras da planilha são ignoradas, com um aviso. Motivo: decisão de escopo.
3. Os indicadores são de gestão, agregados por período e setor. A ferramenta não sugere diagnóstico, não calcula risco de um paciente e não recomenda conduta. Motivo: isso enquadraria o software como dispositivo médico na ANVISA (RDC 657/2022).
4. A ferramenta não guarda nem exibe nada que identifique uma pessoa: nome, CPF, prontuário, data de nascimento, telefone, endereço ou cartão SUS. Colunas assim são ignoradas na importação, com um aviso. Motivo: LGPD e confiança do usuário.
5. Use somente dados fictícios no repositório e nos testes. Os arquivos de teste levam FICTICIO no nome e o marcador ZZ-FICTICIO em alguma célula.
6. Não copie código, imagens, vídeos ou fontes de sites de terceiros. Bibliotecas de código aberto com licença permissiva, instaladas como dependência, são permitidas.
7. Acessibilidade é requisito, não acabamento. O piso é o nível AA das WCAG 2.2. Motivo: o produto precisa servir a todos, e a Lei Brasileira de Inclusão (Lei 13.146/2015, art. 63) obriga sites de empresas no Brasil a serem acessíveis.
</regras>

<entrada_de_dados>
Troque a implementação fictícia de src/fonte-de-dados/ pela real, sem mudar as telas.

Modelo de dados
- A configuração do nicho, em src/nichos/ e seguindo a SPEC, define os campos de entrada e os indicadores calculados a partir deles.
- Cada registro guarda o período (mês), o setor, os valores dos campos e a origem (o nome da planilha ou "lançamento manual").

Importar planilha
- Leitura num Web Worker, com o SheetJS e um limite de 15 MB por arquivo.
- Instale o SheetJS pelo CDN oficial (https://cdn.sheetjs.com), na versão mais recente. Não use o pacote "xlsx" do npm, que está parado na versão 0.18.5 e é vulnerável à CVE-2023-30533.
- A leitura aguenta a bagunça real:
  - cabeçalho fora da linha 1 e células mescladas;
  - datas como texto ou como número de série do Excel;
  - linhas de total e abas extras;
  - CSV do Excel brasileiro, com separador ";" e codificação Windows-1252.
- O mapeamento sugere qual coluna é cada campo usando os sinônimos da SPEC. Ele fica salvo pela assinatura dos cabeçalhos, e no mês seguinte a tela é pulada.
- Nada é salvo sem o resumo de confirmação. As linhas descartadas aparecem com o motivo.

Baixar modelo
- Um .xlsx gerado no navegador a partir da configuração do nicho.

Lançar à mão
- Validação com as regras da SPEC: campos obrigatórios, números inteiros, mínimos e máximos, e consistência entre campos.
- Colar do Excel: um bloco de células copiado chega à grade como valores separados por tabulação. Distribua os valores e valide tudo.
- Desfazer e refazer.
- O rascunho é salvo sozinho, e um botão copia os setores do mês anterior.
- Prévia ao vivo dos indicadores, se couber no prazo.

Meus dados
- Os registros ficam no IndexedDB.
- Edição, apagar com "Desfazer", exportação para .xlsx e .csv, backup e restauração, e "Apagar tudo deste navegador".

Proteções
- Colunas que identificam pessoas (pelo cabeçalho e por padrões como o de CPF) ou que trazem dinheiro nunca chegam ao armazenamento.
- No modo computador compartilhado, tudo fica só em memória e some ao fechar a aba.
- O IndexedDB guarda só registros agregados, mapeamentos, preferências e visões salvas.
</entrada_de_dados>

<painel>
- Cada indicador da SPEC é uma função pura, com teste baseado no exemplo calculado à mão que está na SPEC.
- Os filtros atualizam tudo na hora. O endereço da página guarda só o estado da visão (período e setor), nunca dados.
- Comparações com o mês anterior e com o mesmo mês do ano anterior, quando houver dados.
- Frases geradas por regras, sem IA e sem rede.
- Metas e alertas da SPEC.
- Personalização e visões salvas, guardadas no IndexedDB.
- Relatório em PDF, feito com folha de estilo de impressão e window.print(), sem vidro e com o rodapé "Gerado no seu navegador em dd/mm/aaaa".
</painel>

<privacidade_e_seguranca>
- CSP em public/_headers:
  - default-src 'self';
  - connect-src 'self';
  - img-src 'self' data: blob:, porque o liquid glass precisa disso para capturar a página;
  - nenhum script, estilo ou fonte de fora;
  - object-src 'none' e frame-ancestors 'none';
  - mais Referrer-Policy, X-Content-Type-Options e Permissions-Policy.
  A mesma política precisa valer quando os testes rodarem sobre o build.
- O teste tests/e2e/privacidade.spec.ts percorre todos os fluxos com cada planilha de teste. Ele falha se:
  - alguma requisição sair para outra origem;
  - alguma requisição carregar ZZ-FICTICIO ou qualquer valor do usuário;
  - o console registrar dados do usuário.
- Revisão de dependências: rode o npm audit sem falhas altas e não deixe nenhum pacote abandonado.
</privacidade_e_seguranca>

<acessibilidade>
A fase 1 deixou a base pronta: HTML semântico, foco visível, e cores e movimento só por tokens. Agora complete e verifique tudo.

Linguagem simples
- Frases curtas, nenhuma sigla sem explicação e o "O que é isso?" com os textos da SPEC.

Leitura
- Texto base de pelo menos 16 px.
- O layout aguenta zoom de 200% e largura de 320 px sem rolagem horizontal.

Cor
- Contraste de 4,5:1 para texto e de 3:1 para elementos gráficos, medido inclusive sobre o vidro.
- Paleta segura para daltonismo.

Teclado e leitor de tela
- Tudo funciona só com o teclado, em ordem lógica.
- Leitores de tela anunciam números, variações, erros e o resultado de ações como importar e apagar.
- Cada gráfico tem um resumo em texto e a visão "Ver como tabela" funcionando.

Preferências do sistema
- prefers-reduced-motion desliga as animações pelos tokens.
- prefers-reduced-transparency desliga o vidro.
- prefers-contrast: more e forced-colors usam a aparência sólida, com bordas visíveis.

Toque e erros
- Alvos de toque de pelo menos 44 px, e todo arrastar tem alternativa com botões.
- "Desfazer" em vez de "tem certeza?", com confirmação só para apagar dados.

Declaração de acessibilidade
- Uma página em linguagem simples, como rascunho para revisão.

Verificação
- O axe roda no npm run check, sem violações graves ou críticas em nenhuma tela.
- Um teste do Playwright faz as jornadas principais só com o teclado.
- Screenshots com zoom de 200% e em 320 px.
- Escreva em docs/TESTE_DE_USABILIDADE.md um roteiro curto para Felipe testar com NVDA no Windows e com VoiceOver no iPhone.
</acessibilidade>

<desempenho>
- O JavaScript inicial do painel deve ter até 250 KB comprimidos. O SheetJS e o vidro carregam sob demanda.
- O painel deve ficar interativo em até 2 segundos num notebook comum, com rolagem fluida e o vidro ligado.
- O Lighthouse no celular deve passar de 95 em acessibilidade e boas práticas, na página inicial e no painel.
</desempenho>

<qualidade>
- O npm run check passa no fim de cada etapa. Ele roda:
  - typecheck e lint;
  - testes de unidade (Vitest);
  - testes de navegador (Playwright), com o axe e o teste de privacidade;
  - build.
- Amplie a skill de projeto .claude/skills/verify/ para rodar esse check completo.
- tests/fixtures/ tem de 15 a 20 planilhas fictícias que imitam a bagunça real. Um arquivo ESPERADO.md diz o que a leitura deve encontrar em cada uma.
- Escreva soluções gerais. Os testes verificam a lógica, não a definem. Não remova nem afrouxe um teste para ele passar; se um teste estiver errado, me avise.
</qualidade>

<prioridades>
Essencial para o beta
- Importar, baixar modelo, lançar com colar do Excel, "Meus dados" e as proteções.
- Os cálculos da SPEC, os filtros, as comparações, as frases e o PDF.
- A CSP e o teste de privacidade.
- A acessibilidade AA verificada.
- O modo computador compartilhado.

Desejável, se couber no prazo
- Prévia ao vivo na grade.
- Personalização e visões salvas funcionando de verdade.
- Modo apresentação, metas e alertas.
- Funcionar sem internet depois do primeiro acesso, com o vite-plugin-pwa.

Depois do beta
- Outros nichos.
- IA com dados agregados.
- Sincronização entre dispositivos.
- Integração com sistemas hospitalares.
</prioridades>

<skills>
- /graphify .: rode no início, para atualizar o mapa da arquitetura, e de novo no fim.
- xlsx: as planilhas de teste e o modelo.
- webapp-testing: os testes de navegador, as jornadas com teclado e as screenshots.
- /humanizer: textos novos, como avisos, mensagens de erro, a página de privacidade e a declaração de acessibilidade, sempre em português do Brasil e em linguagem simples.
- Apple design: sempre que uma correção de acessibilidade mexer no visual, para manter a identidade da fase 1.
- REA, com uso restrito, na Etapa 4:
  - analise o build de produção (dist/) e as dependências empacotadas como um auditor externo faria, procurando chamadas de rede, coleta de dados ou código que não deveria estar lá;
  - não use o REA para copiar código, imagens, vídeos ou fontes de terceiros.
- /security-review e /code-review: na Etapa 4.
- verify: roda o check completo antes de cada commit.
</skills>

<modo_de_trabalho>
Estado entre sessões
- Mantenha o docs/PLANO.md com as etapas da fase 2, o status de cada uma, o próximo passo e a lista "depois do beta".
- Registre cada decisão que não seja óbvia em docs/DECISOES.md, com a data e o motivo.
- Faça commits pequenos e descritivos.
- Uma sessão nova deve conseguir continuar o trabalho lendo só o CLAUDE.md, o PLANO.md e o git log.
- O contexto vai ser compactado sozinho quando encher. Por isso, salve o estado nesses arquivos em vez de parar mais cedo.

Pode fazer sem pedir aprovação
- Criar e editar arquivos do projeto.
- Instalar as dependências listadas neste briefing: SheetJS (pelo CDN oficial), idb-keyval, Vitest, Playwright, @axe-core/playwright e, se o modo sem internet entrar, vite-plugin-pwa.
- Rodar testes, builds e o servidor local.
- Fazer commits locais.

Peça aprovação antes de
- Adicionar uma dependência que não está nesta lista.
- Mudar as regras deste briefing, ou mudar a CSP além do que está descrito.
- Fazer uma mudança visual que vá além de corrigir acessibilidade ou defeitos.
- Apagar arquivos fora de src/, tests/ e docs/.
- Fazer qualquer coisa que saia do computador: git push, deploy ou publicar.

Terminar a etapa
- Não pare enquanto houver trabalho da etapa atual por fazer.
- Erros, testes falhando, timeouts e ferramentas instáveis são obstáculos comuns: diagnostique e resolva.
- Pare só no fim de uma etapa, ou quando precisar de uma decisão minha que bloqueie o resto. Nesse caso, siga com o que não depende da resposta.

Comunicação
- Antes de começar, diga em uma linha o que vai fazer.
- Dê atualizações curtas a cada poucas ações.
- No fim de cada etapa, escreva um resumo que faça sentido sozinho para quem não viu as ferramentas nem os arquivos: português simples, frases curtas e os pontos principais primeiro.
- Inclua a evidência: a saída do npm run check e os caminhos das screenshots.
- Liste todas as mudanças, inclusive as pequenas.

Subagentes e domínio de saúde
- Use subagente só onde houver ganho claro, como a auditoria independente da Etapa 4. No resto, trabalhe direto.
- Não invente indicadores, fórmulas ou termos clínicos. Siga a SPEC; na dúvida, marque [VALIDAR COM A PROFESSORA].
</modo_de_trabalho>

<etapas>
Etapa 0, até 24/11: entender e planejar
- Leia a entrega da fase 1, rode o /graphify . e o npm run check.
- Atualize o PLANO.md com o plano da fase 2, os riscos e os critérios de aceite.

Etapa 1, até 3/12: entrada de dados real
- As planilhas de teste, o ESPERADO.md, a leitura, o mapeamento, o modelo, a grade, "Meus dados", as proteções e o modo compartilhado.
- A implementação real da fonte de dados.
Pronto quando: todos os casos do ESPERADO.md passam e a jornada de lançar o mês funciona só com o teclado.

Etapa 2, até 8/12: painel real e relatório
- Os cálculos da SPEC, os filtros, as comparações, as frases e o PDF.
- Os desejáveis que couberem.

Etapa 3, até 11/12: privacidade, acessibilidade e desempenho
- A CSP e o teste de privacidade.
- Tudo o que está em <acessibilidade>.
- O orçamento de desempenho.

Etapa 4, até 13/12: auditoria e prontidão para o beta
- A análise do build com o REA, o /security-review e o /code-review.
- Uma auditoria independente feita por um subagente que não viu a implementação, focada em privacidade, acessibilidade e corretude.
- O Lighthouse.
- O docs/TESTE_DE_USABILIDADE.md, com:
  - as tarefas;
  - as métricas: concluir sem ajuda, tempo de cada tarefa e o questionário SUS;
  - o perfil das pessoas a recrutar, incluindo alguém com mais de 50 anos, alguém com pouca familiaridade com tecnologia e alguém que use só o celular.
- A lista de pendências para janeiro.
</etapas>

<primeira_tarefa>
1. Salve este briefing inteiro em docs/BRIEFING_FASE_2.md. Ele é a referência das próximas sessões.
2. Leia o CLAUDE.md, o docs/ENTREGA_FASE_1.md, o docs/DECISOES.md, o docs/SPEC.md e o docs/PLANO.md.
3. Rode o /graphify . e o npm run check.
4. Atualize o docs/PLANO.md com o plano da fase 2.
5. Me faça até 5 perguntas, com a ferramenta AskUserQuestion, só sobre o que mudaria o plano.
6. Espere minha aprovação do plano e então execute a Etapa 1 até o fim.
</primeira_tarefa>
