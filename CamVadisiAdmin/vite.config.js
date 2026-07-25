import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Menu projesiyle ORTAK is mantigi (fiyat/dil/etiket) tek kaynaktan gelir.
// Derleme zamaninda bundle'a dahil edilir; dagitilan dist kendi kendine yeterlidir.
const shared = fileURLToPath(new URL('../CamVadisi/shared', import.meta.url));

export default defineConfig({
  base: '/panel/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@shared': shared },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
  build: { outDir: 'dist' },
});
