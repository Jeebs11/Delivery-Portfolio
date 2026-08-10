import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';
// NOTE: generateSeoHtml() is disabled. The original plugin fetches the previous
// author's external Sanity CMS during transformIndexHtml and overrides the
// <title>, the #seo-content block and JSON-LD with his identity. It is left out
// until a Mujeeb-branded version is rebuilt from src/config/content.js.
// import { generateSeoHtml } from './seo-plugin.js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteCompression()],
  server: {
    proxy: {
      '/sanity-cdn': {
        target: 'https://cdn.sanity.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sanity-cdn/, '')
      }
    }
  }
})
