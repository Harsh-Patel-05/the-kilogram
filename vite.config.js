import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the build works from a sub-path (GitHub Pages: /the-kilogram/).
  base: './',
  plugins: [react()],
  build: {
    assetsInlineLimit: 2048,
  },
});
