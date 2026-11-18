import { defineConfig, devices } from '@playwright/test'

// Os testes rodam sobre o build de produção (`vite preview`), com os cabeçalhos de public/_headers.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // No máximo 3 abas ao mesmo tempo: cada uma pode ter dois contextos WebGL (o robô e o vidro),
  // desenhados por software no navegador de teste. Com 5, o navegador chegou a fechar no meio.
  workers: 3,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'celular', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'computador', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
