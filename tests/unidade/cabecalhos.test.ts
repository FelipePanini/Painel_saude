import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const arquivo = readFileSync('public/_headers', 'utf8')
const csp = arquivo.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? ''

describe('public/_headers', () => {
  it('tem uma CSP que só permite a própria origem', () => {
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self'")
    expect(csp).toContain("connect-src 'self'")
    expect(csp).toContain("font-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).not.toMatch(/https?:/)
    expect(csp).not.toContain('unsafe-inline')
    expect(csp).not.toContain('unsafe-eval')
  })

  it('tem os demais cabeçalhos de segurança', () => {
    expect(arquivo).toContain('Referrer-Policy:')
    expect(arquivo).toContain('X-Content-Type-Options: nosniff')
    expect(arquivo).toContain('Permissions-Policy:')
  })
})
