// Define o tema (claro ou escuro) antes da primeira pintura, para a página não piscar.
// Fica num arquivo próprio porque a CSP não permite script embutido no HTML.
// Depois que a página carrega, src/tema.ts assume e acompanha as mudanças.
document.documentElement.dataset.tema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
