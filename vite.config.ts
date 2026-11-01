import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Caminhos relativos funcionam em qualquer endereço do GitHub Pages (/<repositório>/).
  base: './',
  plugins: [react()],
});
