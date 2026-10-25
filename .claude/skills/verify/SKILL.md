---
name: verify
description: Roda a verificação completa do projeto (typecheck, lint, testes de unidade, build e testes de navegador com `npm run check`) e resume o resultado. Use antes de cada commit e antes de dizer que uma tarefa terminou.
---

# Verificar o projeto

1. Rode `npm run check` na raiz do projeto. Ele executa, nesta ordem: `typecheck`, `lint`, `test` (Vitest), `build` e `test:e2e` (Playwright sobre o build, com os cabeçalhos de `public/_headers`).
2. Se o Playwright reclamar que falta o navegador, rode `npx playwright install chromium` e repita.
3. Resuma em português:
   - qual etapa passou ou falhou;
   - quantos testes passaram em cada suíte;
   - para cada falha, o arquivo, o teste e a mensagem de erro, sem esconder nada.
4. Se algo falhou, não faça o commit. Corrija a causa (não o teste) e rode de novo.
5. Nunca cole no resumo conteúdo de planilhas, mesmo das fictícias.
