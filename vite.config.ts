import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // base: './' so the build works whether served from the domain root
  // (custom domain) or a subpath (jpep.github.io/gmmn/). Adjust to a fixed
  // path when the final hosting URL is decided.
  base: './',

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
  },

  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: true,
  },
});
