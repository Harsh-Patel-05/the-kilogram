import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PRELOAD_FONTS = /^assets\/(inter-latin|poppins-600-latin|poppins-700-latin)-[\w-]+\.woff2$/;

/** Preloads the above-the-fold fonts so text doesn't re-flow when they swap in. */
function preloadFonts() {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return [];
        return Object.keys(ctx.bundle)
          .filter((file) => PRELOAD_FONTS.test(file))
          .map((file) => ({
            tag: 'link',
            attrs: { rel: 'preload', href: `./${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
            injectTo: 'head',
          }));
      },
    },
  };
}

export default defineConfig({
  // Relative base so the build works from a sub-path (GitHub Pages: /the-kilogram/).
  base: './',
  plugins: [react(), preloadFonts()],
  build: {
    assetsInlineLimit: 2048,
  },
});
