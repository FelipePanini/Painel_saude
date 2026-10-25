# Decisões técnicas

Decisões não óbvias, com data. A mais recente fica no topo.

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
