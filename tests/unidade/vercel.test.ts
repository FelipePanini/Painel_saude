import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// A Vercel não lê o public/_headers (formato do Cloudflare e do Netlify); ela usa o vercel.json.
// Este teste garante que os dois arquivos mandam exatamente os mesmos cabeçalhos de segurança,
// para a CSP de produção ser a mesma que os testes de navegador conferem.

function cabecalhosDoHeaders() {
  const cabecalhos: Record<string, string> = {}
  let dentro = false
  for (const linha of readFileSync('public/_headers', 'utf8').split('\n')) {
    if (!linha.trim()) continue
    if (!/^\s/.test(linha)) {
      dentro = linha.trim() === '/*'
      continue
    }
    const separador = linha.indexOf(':')
    if (dentro && separador > 0) cabecalhos[linha.slice(0, separador).trim()] = linha.slice(separador + 1).trim()
  }
  return cabecalhos
}

describe('vercel.json', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
    outputDirectory: string
    headers: { source: string; headers: { key: string; value: string }[] }[]
  }

  it('aplica a todas as páginas os mesmos cabeçalhos do public/_headers', () => {
    expect(config.headers).toHaveLength(1)
    const [regra] = config.headers
    expect(regra!.source).toBe('/(.*)')
    const daVercel = Object.fromEntries(regra!.headers.map((h) => [h.key, h.value]))
    expect(daVercel).toEqual(cabecalhosDoHeaders())
    expect(daVercel['Content-Security-Policy']).toContain("connect-src 'self'")
  })

  it('publica a pasta do build', () => {
    expect(config.outputDirectory).toBe('dist')
  })
})
