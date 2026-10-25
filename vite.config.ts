/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'

// Lê os cabeçalhos de public/_headers (formato do Cloudflare Pages e do Netlify).
// Só a seção "/*" é usada, que vale para o site inteiro.
function lerCabecalhos(caminho: string): Record<string, string> {
  const cabecalhos: Record<string, string> = {}
  let dentroDaSecaoGeral = false
  for (const linha of readFileSync(caminho, 'utf8').split('\n')) {
    if (linha.trim() === '') continue
    if (!/^\s/.test(linha)) {
      dentroDaSecaoGeral = linha.trim() === '/*'
      continue
    }
    if (!dentroDaSecaoGeral) continue
    const separador = linha.indexOf(':')
    if (separador === -1) continue
    cabecalhos[linha.slice(0, separador).trim()] = linha.slice(separador + 1).trim()
  }
  return cabecalhos
}

// Aplica os mesmos cabeçalhos da hospedagem no `vite preview`, onde rodam os testes
// do Playwright. Assim a CSP testada é a mesma que vai para produção.
function cabecalhosDeProducao(): Plugin {
  return {
    name: 'cabecalhos-de-producao',
    configurePreviewServer(servidor) {
      const cabecalhos = lerCabecalhos('public/_headers')
      servidor.middlewares.use((_requisicao, resposta, proximo) => {
        for (const [nome, valor] of Object.entries(cabecalhos)) resposta.setHeader(nome, valor)
        proximo()
      })
    },
  }
}

export default defineConfig({
  plugins: [cabecalhosDeProducao()],
  build: {
    // Evita CSS ou scripts embutidos no HTML, que a CSP bloquearia.
    assetsInlineLimit: 0,
    rolldownOptions: {
      // O protótipo das entrevistas entra no build para ser testado com a CSP de produção.
      // Remover esta entrada (e a pasta prototipo/) antes do lançamento.
      input: { principal: 'index.html', prototipo: 'prototipo/index.html' },
    },
  },
  test: {
    include: ['tests/unidade/**/*.test.ts', 'src/**/*.test.ts'],
  },
})
